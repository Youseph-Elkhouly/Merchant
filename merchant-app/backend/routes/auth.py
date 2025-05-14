# routes/auth.py
from flask import Blueprint

auth = Blueprint('auth', __name__)

@auth.route('/ping', methods=['GET'])
def ping():
    return "Auth is working!"
