from flask_socketio import SocketIO
from redis import Redis
import json

socketio = SocketIO(async_mode="eventlet")

redis = Redis(host='karaoke_redis_container', port=6379, db=0, decode_responses=True)
