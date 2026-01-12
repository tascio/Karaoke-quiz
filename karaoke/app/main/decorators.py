from functools import wraps
from flask import g, request
from containers.containers import teams_service, gamestate_service
from main.utils import request_ip
from main.extensions import socketio
from logger.logger import logger


def is_ip_registered(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request_ip()
        g.team = teams_service.get_team(ip)
        return f(*args, **kwargs)
    return decorated_function

def interlock(state_permitted):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            state = gamestate_service.get_current_game_state()
            if state in state_permitted:
                logger.info(f"interlock bypassed {state} -> {state_permitted}")
                return f(*args, **kwargs)
            logger.warning(f"interlock engaged {state} -> {state_permitted}")
            socketio.emit("action_blocked", {
                    "action": f.__name__,
                    "current_state": state,
                    "required_states": state_permitted
                }, to=request.sid)
            return None
        return decorated_function
    return decorator        