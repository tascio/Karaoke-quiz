from flask import Flask, render_template, current_app, Blueprint, jsonify, request, g
from logger.logger import logger
from flask_socketio import emit
from containers.containers import teams_service, quiz_service, rounds_service, gamestate_service
from main.decorators import is_ip_registered
from main.utils import request_ip
from configs.config import *

views_bp = Blueprint('views', __name__)


@views_bp.route("/")
@is_ip_registered
def player():
    return render_template("pages/player.html", team=g.team)

@views_bp.route("/host")
def host():
    teams = teams_service.get_teams()
    current_round = rounds_service.get_current_question()
    if not current_round:
        question = None
    else:
        question = quiz_service.get_quiz(current_round['id_q'])
    questions = quiz_service.get_all_quizzes()
    return render_template("pages/host.html", teams=teams, current_question=question, questions=questions)

@views_bp.route("/karaoke")
def karaoke():
    return render_template("pages/karaoke.html")
