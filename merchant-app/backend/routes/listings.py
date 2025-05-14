# routes/listings.py
from flask import Blueprint, jsonify

listings = Blueprint('listings', __name__)

@listings.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Listings are working!"}), 200
