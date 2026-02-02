from flask import Flask, render_template, Blueprint, jsonify, g
from containers.containers import teams_service, quiz_service, rounds_service, gamestate_service
from main.decorators import is_ip_registered
from configs.config import *

views_bp = Blueprint('views', __name__)


@views_bp.route("/")
@is_ip_registered
def player():
    return render_template("pages/player.html", team=g.team)

@views_bp.route("/host")
def host():
    teams = teams_service.get_teams()
    question = rounds_service.get_current_question_round()
    questions = quiz_service.get_all_quizzes()
    return render_template("pages/host.html", teams=teams, current_question=question, questions=questions, 
                           audioEffectsKaraoke=gamestate_service.get_audio_effects_karaoke(),
                           audioEffectsPlayers=gamestate_service.get_audio_effects_players())

@views_bp.route("/karaoke")
def karaoke():
    return render_template("pages/karaoke.html")
