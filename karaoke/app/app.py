from main import create_app
from main.extensions import socketio
from main.logger import logger

try:
    app = create_app()
    logger.info('App started')
except Exception as e:
    logger.critical(f'App crashed {e}')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5090, debug=False, use_reloader=False)
