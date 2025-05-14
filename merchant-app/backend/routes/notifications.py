from flask import Blueprint, jsonify

notifications = Blueprint('notifications', __name__)

@notifications.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Notifications are working!"}), 200
