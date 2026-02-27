from flask import request, g
from main.extensions import socketio
from containers.containers import teams_service, rounds_service, gamestate_service, answers_service
from services.game_controller import GameController
from services.models import GameState
from main.utils import request_ip
from logger.logger import logger
from configs.config import *
from main.decorators import interlock
from flask_socketio import join_room, leave_room
import time

gsc = GameController()

MP4_PATH_FOR_JS = "/static/media/"

@socketio.on("changeStateToIdle")
def changeStateToIdle():
    gamestate_service.update_game_state(GameState.IDLE)
    emitCurrentGameState()

@socketio.on("changeStateToSing")
def changeStateToSing():
    gamestate_service.update_game_state(GameState.SING)
    emitCurrentGameState()

@socketio.on("changeStateToQuiz")
def changeStateToQuiz():
    gamestate_service.update_game_state(GameState.QUIZ)
    emitCurrentGameState()

@socketio.on("changeStateToQuizEnd")
def changeStateToQuizEnd():
    gamestate_service.update_game_state(GameState.QUIZ_END)
    emitCurrentGameState()

@socketio.on("changeStateToResults")
def changeStateToResults():
    gamestate_service.update_game_state(GameState.RESULTS)
    emitCurrentGameState()


def emitCurrentGameState():
    ip = request_ip()
    team = teams_service.get_team(ip)
    state = gamestate_service.get_current_game_state()

    socketio.emit("sync_player_back", {
        'team': team if team else None,
        'state': state, 
        'audioEffectsKaraoke': gamestate_service.get_audio_effects_karaoke(),
        'audioEffectsPlayers': gamestate_service.get_audio_effects_players()}, 
        to=ip)
    
    if state == GameState.QUIZ:
        logger.info(f"{ip} did a refresh in quiz")
        emit_show_question()

    elif state == GameState.QUIZ_END:
        logger.info(f"{ip} did a refresh in quiz end")
        send_question_refresh()

    elif state == GameState.END_GAME:
        logger.info(f"Broadcast END GAME")
        socketio.emit("end_game")

@socketio.on("sync_player")
def sync_player():
    emitCurrentGameState()

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
        team = teams_service.get_team(ip)
        socketio.emit("join_ok",{"team": team}, to=sid)
    else:
        socketio.emit("username_exist", to=sid)

@socketio.on("sync_state_show_answer")
def sync_state_show_answer():
    emitCurrentGameState()

@socketio.on("connect")
def on_connect():
    ip = request_ip()
    sid = request.sid
    join_room(ip)
    logger.info(f"SOCKET CONNECTED {ip} sid={sid}")


#GAME STATUS SET SING
@socketio.on("start_song")
@interlock([GameState.IDLE, GameState.QUIZ_END])
def start_song():
    karaoke = gsc.start_song()
    if karaoke:
        current_question = rounds_service.get_current_question_round()
        emit_start_song(karaoke, current_question)
    else:
        emit_end_game()

#GAME STATUS GET QUIZ
@socketio.on("request_question_refresh")
def send_question_refresh():
    sid = request.sid
    ip = request_ip()

    quiz = rounds_service.get_current_question_round()
    id_q = quiz['id_q']
    logger.info(f"request question refresh {quiz} {ip}")
    if answers_service.exist_answer(id_q, ip):
        socketio.emit("show_question_refresh", {
            "quid": id_q,
            "question": quiz["question"],
            "choices": quiz["answers"],
            "correct": quiz['correct'],
            "answer": answers_service.get_player_answer(id_q, ip)
        }, to=sid)
    else:
        socketio.emit("show_question_refresh", {
            "quid": id_q,
            "question": quiz["question"],
            "choices": quiz["answers"],
            "correct": quiz['correct'],
        }, to=sid)
    
#GAME STATUS SET QUIZ
@socketio.on("request_question")
@interlock([GameState.SING])
def send_question():
    stop_mic_sampling()
    gsc.send_question()
    do_the_quiz(gsc.on_quiz_timeout)
   
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
    id_q = rounds_service.get_current_question_round()['id_q']
    round_answers = answers_service.get_all_player_answers(id_q)
    socketio.emit("show_round_scores", {"teams": gsc._score_this_round(round_answers, teams)})

@socketio.on("show_ranking")
@interlock([GameState.QUIZ_END])
def show_ranking():
    teams = teams_service.get_teams()
    socketio.emit("show_ranking_karaoke", teams)

@socketio.on("mic_sampling_result")
def mic_sampling_result(data):
    ip = request_ip()
    id_q = rounds_service.get_current_question_round()['id_q']

    avg = int(float(data["avg_db"]))
    samples = data["samples"]
    answers_service.save_player_p_audio(id_q, ip, avg)

@socketio.on("refresh_players")
def refresh_players():
    socketio.emit("refresh_players")

@socketio.on("showPremiation")
def showPremiation():
    test = [{'username': "Cell", 'points': 2708, 'p_audio': 10},
            {'username': "pippo", 'points': 2108, 'p_audio': 103},
            {'username': "Cetinoll", 'points': 2208, 'p_audio': 70},
            {'username': "tino", 'points': 555, 'p_audio': 30},
            {'username': "xxx", 'points': 1000, 'p_audio': 30},
            {'username': "aaa", 'points': 1579, 'p_audio': 99},
            {'username': "sss", 'points': 2000, 'p_audio': 67},
            {'username': "www", 'points': 1789, 'p_audio': 22},
            {'username': "  cc", 'points': 322, 'p_audio': 324},
            {'username': "jerr", 'points': 1134, 'p_audio': 1},
            {'username': "fasc", 'points': 2341, 'p_audio': 234},
            {'username': "rutt", 'points': 311, 'p_audio': 55}]
    socketio.emit("showPremiationKaraoke", test)#teams_service.get_teams())

def emit_start_song(video, current_question):
    socketio.emit("play_song", {"video": f"{MP4_PATH_FOR_JS}{video}"})
    socketio.emit("start_mic_sampling")
    socketio.emit("current_question_host", current_question)
    socketio.emit("all_question_host", current_question)
    emitCurrentGameState()

def stop_mic_sampling():
    socketio.emit("stop_mic_sampling")
    end_question_before_show()

def emit_show_question():
    quiz = rounds_service.get_current_question_round()
    socketio.emit("show_question", {
        "quid": quiz["id_q"],
        "question": quiz["question"],
        "choices": quiz["answers"],
        "author": quiz["author"].capitalize(),
    })

def do_the_quiz(on_timeout):
    emitCurrentGameState()
    emit_show_question()
    socketio.start_background_task(end_question_after_timeout, on_timeout)

def end_question(teams, correct, scores_this_round):
    socketio.emit("show_scores_host", teams)
    socketio.emit("show_answer", {"correct": correct, "teams": scores_this_round})
    socketio.emit("force_sync_state_player")
    logger.info("end question >")

def emit_end_game():
    gamestate_service.update_game_state(GameState.END_GAME)
    emitCurrentGameState()

def end_question_before_show():
    i = 3
    while i > 0:
        socketio.emit("show_countdown", {"count" : f"Question in {i}"})
        i -= 1
        socketio.sleep(1)
    logger.info(f"countdown expired, going to emit show_question")
    return
            
def end_question_after_timeout(on_timeout):
    i = COUNTDOWN
    while i > 0:
        socketio.emit("show_countdown", {"count" : i})
        i -= 1
        socketio.sleep(1)
    logger.info(f"countdown expired got to end_question")
    gamestate_service.update_game_state(GameState.QUIZ_END)
    teams, correct, scores_this_round = on_timeout()
    end_question(teams, correct, scores_this_round)