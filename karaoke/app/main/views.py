from flask import Flask, render_template, Blueprint, g, jsonify
from containers.containers import teams_service, quiz_service, rounds_service, gamestate_service
from main.decorators import is_ip_registered, host_restricted
from configs.config import *

views_bp = Blueprint('views', __name__)


@views_bp.route("/api/player")
@is_ip_registered
def player():
    return jsonify({ "team": g.team })

@views_bp.route("/api/host")
def host_data():
    return jsonify({
        "teams": teams_service.get_teams(),
        "current_question": rounds_service.get_current_question_round(),
        "questions": quiz_service.get_all_quizzes(),
        "audioEffectsKaraoke": gamestate_service.get_audio_effects_karaoke(),
        "audioEffectsPlayers": gamestate_service.get_audio_effects_players(),
    })

