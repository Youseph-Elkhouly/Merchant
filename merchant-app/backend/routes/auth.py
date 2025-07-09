from flask import Blueprint, request, jsonify
from models import User
from utils.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re

auth = Blueprint("auth", __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def is_valid_email(email):
    return EMAIL_REGEX.match(email)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    # Input validation
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    if not is_valid_email(email):
        return jsonify({"message": "Invalid email format."}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "User with this email already exists."}), 400

    # Create new user
    hashed_pw = generate_password_hash(password)
    user = User(
        email=email,
        password=hashed_pw,
        name=name
    )

    try:
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "User registered successfully.",
            "access_token": access_token,
            "user_id": user.id,
            "email": user.email,
            "name": user.name
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Input validation
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    if not is_valid_email(email):
        return jsonify({"message": "Invalid email format."}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful.",
            "access_token": access_token,
            "user_id": user.id,
            "email": user.email,
            "name": getattr(user, 'name', '')
        }), 200

    return jsonify({"message": "Invalid email or password."}), 401

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name
    }), 200
