from flask import request
from main.extensions import socketio
from containers.containers import teams_service, quiz_service, rounds_service, gamestate_service, answers_service
from services.game_controller import GameController
from services.models import GameState
from main.utils import request_ip
from logger.logger import logger
from configs.config import *
from main.decorators import interlock
import time

gsc = GameController()

MP4_PATH_FOR_JS = "/static/media/"

@socketio.on("setIdle")
def setIdle():
    gamestate_service.update_game_state(GameState.IDLE)
    socketio.emit("karaoke_idle")

@socketio.on("join")
def join(data):
    logger.info("join")
    sid = request.sid
    username = data["username"][:20]
    ip = request_ip()
    if teams_service.register(ip, username):
        socketio.emit("join_ok", to=sid)
    else:
        socketio.emit("username_exist", to=sid)

@socketio.on("connect")
def on_connect():
    logger.info("SOCKET CONNECTED")
    sid = request.sid
    socketio.emit("sync_state", gamestate_service.get_current_game_state(), to=sid)


#GAME STATUS GET SING
@socketio.on("start_song_refresh")
def start_song_refresh():
    sid = request.sid
    socketio.emit("show_sing", to=sid)


#GAME STATUS SET SING
@socketio.on("start_song")
@interlock([GameState.IDLE, GameState.RESULTS])
def start_song():
    karaoke = gsc.start_song()
    if karaoke:
        emit_start_song(karaoke)
    else:
        emit_end_game()

#GAME STATUS GET QUIZ
@socketio.on("request_question_refresh")
def send_question_refresh():
    sid = request.sid
    ip = request_ip()

    question = rounds_service.get_current_question()
    id_q = question['id_q']
    quiz = quiz_service.get_quiz(id_q)
    logger.info(f"request question refresh {question} {quiz} {ip}")
    if answers_service.exist_answer(id_q, ip):
        socketio.emit("show_question_refresh", {
            "id": id_q,
            "question": quiz["quiz"],
            "choices": quiz["answers"],
            "correct": quiz['correct'],
            "answer": answers_service.get_player_answer(id_q, ip)
        }, to=sid)
    else:
        socketio.emit("show_question_refresh", {
            "id": id_q,
            "question": quiz["quiz"],
            "choices": quiz["answers"],
            "correct": quiz['correct'],
        }, to=sid)
    
#GAME STATUS SET QUIZ
@socketio.on("request_question")
@interlock([GameState.SING])
def send_question():
    stop_mic_sampling()
    quiz = gsc.send_question()
    do_the_quiz(quiz, gsc.on_quiz_timeout)
   
@socketio.on("answer")
def receive_answer(data):
    ip = request_ip()
    answ = data.get("choice", None)
    time_answer = time.time()

    res = answers_service.save_player_answer(ip, answ, time_answer)
    if not res:
        socketio.emit("already_responded", to=request.sid)


#AGGIORNAMENTO DEI PUNTEGGI
@socketio.on("showRoundScore")
@interlock([GameState.QUIZ_END])
def showRoundScore():
    teams = teams_service.get_teams()
    question = rounds_service.get_current_question()
    round_answers = answers_service.get_all_player_answers(question['id_q'])
    socketio.emit("show_answer", {"teams": gsc._score_this_round(round_answers, teams)})

@socketio.on("show_ranking")
@interlock([GameState.QUIZ_END])
def show_ranking():
    teams = teams_service.get_teams()
    socketio.emit("show_ranking_karaoke", teams)

@socketio.on("mic_sampling_result")
def mic_sampling_result(data):
    ip = request_ip()
    question = rounds_service.get_current_question()

    avg = int(float(data["avg_db"]))
    samples = data["samples"]
    answers_service.save_player_p_audio(question['id_q'], ip, avg)

@socketio.on("refresh_players")
def refresh_players():
    socketio.emit("refresh_players")


def emit_start_song(video):
    socketio.emit("play_song", {"video": f"{MP4_PATH_FOR_JS}{video}"})
    socketio.emit("start_mic_sampling")
    socketio.emit("show_sing")

def stop_mic_sampling():
    socketio.emit("stop_mic_sampling")
    end_question_before_show()

def do_the_quiz(quiz, on_timeout):
    socketio.emit("show_question", {
        "id": quiz["id_q"],
        "question": quiz["quiz"],
        "choices": quiz["answers"],
    })
    socketio.start_background_task(end_question_after_timeout, on_timeout)

def end_question(teams, correct, scores_this_round):
    socketio.emit("show_scores_host", teams)
    socketio.emit("show_answer", {"correct": correct, "teams": scores_this_round})
    socketio.emit("show_answer_right_players", {"correct": correct})

def emit_end_game():
    socketio.emit("quiz_finished")


def end_question_before_show():
    i = 3
    while i > 0:
        socketio.emit("show_countdown", {
            "count" : f"Question in {i}"
        })
        i -= 1
        #time.sleep(1)
        socketio.sleep(1)
    logger.info(f"countdown expired, going to emit show_question")
    return
            
def end_question_after_timeout(on_timeout):
    i = COUNTDOWN
    while i > 0:
        socketio.emit("show_countdown", {
            "count" : i
        })
        i -= 1
        socketio.sleep(1)
    logger.info(f"countdown expired got to end_question")
    gamestate_service.update_game_state(GameState.QUIZ_END)
    teams, correct, scores_this_round = on_timeout()
    end_question(teams, correct, scores_this_round)