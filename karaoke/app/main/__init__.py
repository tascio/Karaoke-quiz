import eventlet
eventlet.monkey_patch()

from flask import Flask
from logger.logger import logger
from flask_socketio import SocketIO
from main.views import views_bp
from main.extensions import socketio
from flask_cors import CORS

import os

def create_app():
    try:
        BASEDIR = os.path.abspath(os.path.dirname(__file__))
        logger.info(f"base dir = {BASEDIR}")
        app = Flask(__name__, template_folder='../static/templates', static_folder='../static')
        CORS(app, resources={r"*": {"origins": ["http://localhost:5173", "http://karaoke_frontend:5173"]}})        
        socketio.init_app(app, cors_allowed_origins=["http://localhost:5173", "http://karaoke_frontend:5173"])
        from sockets import socket_service, karaokeAudio, playersAudio

        app.register_blueprint(views_bp)

    except Exception as e:
        logger.critical(f'INITIALIZING ERROR {e}')
        print('create app error ',str(e))

    return app