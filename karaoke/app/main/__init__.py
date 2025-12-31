import eventlet
eventlet.monkey_patch()

from flask import Flask
from main.logger import logger
from flask_socketio import SocketIO
from main.views import views_bp
from main.extensions import socketio

import os

def create_app():
    try:
        BASEDIR = os.path.abspath(os.path.dirname(__file__))
        logger.info(f"base dir = {BASEDIR}")
        app = Flask(__name__, template_folder='../static/templates', static_folder='../static')
        socketio.init_app(app, cors_allowed_origins="*")

        app.register_blueprint(views_bp)

    except Exception as e:
        logger.critical(f'INITIALIZING ERROR {e}')
        print('create app error ',str(e))

    return app