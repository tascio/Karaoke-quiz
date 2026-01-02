from functools import wraps
from flask import g
from main.models import redis_view
from main.utils import request_ip

def is_ip_registered(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request_ip()
        rv = redis_view()
        g.team = rv.get_team(ip)
        return f(*args, **kwargs)
    return decorated_function