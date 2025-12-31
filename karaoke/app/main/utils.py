from flask import request

def request_ip():
    return request.headers.get("X-Forwarded-For", request.remote_addr).split(",")[0].strip()