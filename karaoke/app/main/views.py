from flask import Flask, Response, render_template, current_app, Blueprint, jsonify, request, g
from main.logger import logger
from flask_socketio import emit, join_room
import time, json, subprocess, random, os
from main.extensions import socketio
from main.models import redis_view, redis_write, redis_questions, redis_answer, redis_game_state
from main.decorators import is_ip_registered
from main.utils import request_ip

views_bp = Blueprint('views', __name__)

SING = "sing"
IDLE = "idle"
QUIZ = "quiz"
RESULTS = "results"
TEN_CENTS = 1000
BASE_CENTS = 100
TEN_MS = 10000
BASE_MS = 1000
COUNTDOWN = 10

@views_bp.route("/")
@is_ip_registered
def player():
    return render_template("pages/player.html", team=g.team)

@views_bp.route("/host")
def host():
    rv = redis_view()
    teams = rv.get_teams()
    rq = redis_questions()
    question = rq.get_current_question()
    questions = rq.get_all_questions()
    return render_template("pages/host.html", teams=teams, current_question=question, questions=questions)

@views_bp.route("/karaoke")
def karaoke():
    return render_template("pages/karaoke.html")


@socketio.on("join")
def join(data):
    sid = request.sid
    rw = redis_write()
    username = data["username"][:20]
    ip = request_ip()
    if rw.registrazione(ip, username):
        socketio.emit("join_ok", to=sid)
    else:
        socketio.emit("username_exist", to=sid)

@socketio.on("connect")
def on_connect():
    sid = request.sid
    rg = redis_game_state()
    socketio.emit("sync_state", rg.get_current_game_state(), to=sid)

#GAME STATUS GET SING
@socketio.on("start_song_refresh")
def start_song_refresh():
    sid = request.sid
    socketio.emit("show_sing", to=sid)

#GAME STATUS SET SING
@socketio.on("start_song")
def start_song():
    rv = redis_view()
    teams = rv.get_teams()
    ra = redis_answer()
    ra.reset_player_answers(teams)

    rq = redis_questions()
    if question:=rq.get_random_question():
        rg = redis_game_state()
        rg.update_game_state(SING)

        rq.set_current_question(question)
        karaoke_folder = "/app/static/media"
        video = [v for v in os.listdir(karaoke_folder) if question["id"] in v][0]
        socketio.emit("play_song", {"video": f"/static/media/{video}"})
        socketio.emit("start_mic_sampling")
        socketio.emit("show_sing")
    else:
        socketio.emit("quiz_finished")

#GAME STATUS GET QUIZ
@socketio.on("request_question_refresh")
def send_question_refresh():
    sid = request.sid
    ip = request_ip()
    ra = redis_answer()
    rq = redis_questions()
    question = rq.get_current_question()
    if answ:=ra.get_player_answer(ip):
        socketio.emit("show_question", {
            "id": question["id"],
            "question": question["question"],
            "choices": question["answers"],
            "answer": answ
        }, to=sid)
    else:
        socketio.emit("show_question", {
            "id": question["id"],
            "question": question["question"],
            "choices": question["answers"],
        }, to=sid)
    
#GAME STATUS SET QUIZ
@socketio.on("request_question")
def send_question():
    rq = redis_questions()
    if question:=rq.get_current_question():
        rg = redis_game_state()
        rg.update_game_state(QUIZ)
        socketio.emit("stop_mic_sampling")
        end_question_before_show()
        rq.set_start_question(question)
        socketio.emit("show_question", {
            "id": question["id"],
            "question": question["question"],
            "choices": question["answers"],
        })
        socketio.start_background_task(end_question_after_timeout)
def end_question_before_show():
    i = 3
    while i > 0:
        socketio.emit("show_countdown", {
            "count" : f"Question in {i}"
        })
        i -= 1
        time.sleep(1)
    logger.info(f"countdown expired, going to emit show_question")
    return            
def end_question_after_timeout():
    i = COUNTDOWN
    while i > 0:
        socketio.emit("show_countdown", {
            "count" : i
        })
        i -= 1
        socketio.sleep(1)
    logger.info(f"countdown expired got to end_question")
    process_end_question()


@socketio.on("answer")
def receive_answer(data):
    ra = redis_answer()
    ip = request_ip()
    answ = data.get("choice", None) 

    rq = redis_questions()
    question = rq.get_current_question()
    start_ts = question["start_ts"]
    now = time.time()
    response_time_ms = int((now - start_ts) * BASE_CENTS)
    logger.info(f"{ip} answer in {start_ts} - {now} = {response_time_ms}")

    if response_time_ms > TEN_CENTS:
        logger.warning(f"Answer arrived too late {ip}")
        return
    try:
        ra.save_player_answer(ip, answ, response_time_ms)
    except Exception as e:
        logger.error(f"error in receive answer {e}")


#AGGIORNAMENTO DEI PUNTEGGI
@socketio.on("end_question")
def end_question():
    process_end_question()
    rg = redis_game_state()
    rg.update_game_state(RESULTS)

def process_end_question():
    rq = redis_questions()
    question = rq.get_current_question()
    correct = question["correct"]

    rw = redis_write()
    
    rv = redis_view()
    teams = rv.get_teams()

    ra = redis_answer()
    scores_this_round = {}

    for ip, data in teams.items():
        scores_this_round[data['username']] = {}
        answ = ra.get_player_answer(ip)
            # if answ['done']:
            #     continue
            # else:
        logger.info(f"player {ip} respond {answ}")
        try:
            if answ['answer'] == correct:
                points = TEN_CENTS - answ['response_time_ms']
                scores_this_round[data['username']] = {'points' : points, "p_audio": answ['p_audio']}
                if answ['done']:
                    continue
                rw.update_points(ip, points, 1, 0, answ['p_audio'])
                ra.set_processed(ip) 
            else:
                scores_this_round[data['username']] = {'points' : 0, "p_audio": answ['p_audio']}
                if answ['done']:
                    continue
                rw.update_points(ip, 0, 0, 1, answ['p_audio'])
                ra.set_processed(ip)
        except Exception as e:
            logger.error(f"Error in processing answers {e} {answ}")
       
    socketio.emit("show_scores_host", teams)
    socketio.emit("show_answer", {"correct": correct, "teams": scores_this_round})
    socketio.emit("show_answer_right_players", {"correct": correct})

@socketio.on("show_ranking")
def show_ranking():
    rv = redis_view()
    teams = rv.get_teams()
    socketio.emit("show_ranking_karaoke", teams)

@socketio.on("mic_sampling_result")
def mic_sampling_result(data):
    ip = request_ip()
    rw = redis_write()
    avg = int(float(data["avg_db"]))
    samples = data["samples"]
    rw.update_points_audio(ip, avg)

@socketio.on("refresh_players")
def refresh_players():
    socketio.emit("refresh_players")