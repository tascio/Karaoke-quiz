from functools import wraps
from flask import request, g
from main.models import redis_view

def is_ip_registered(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.headers.get("X-Forwarded-For", request.remote_addr).split(",")[0].strip()
        rv = redis_view()
        g.team = rv.get_team(ip)
        return f(*args, **kwargs)
    return decorated_function