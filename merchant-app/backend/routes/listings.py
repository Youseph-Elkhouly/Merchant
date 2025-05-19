# routes/listings.py
from flask import Blueprint, jsonify, request
from models import Listing
from utils.database import db

listings = Blueprint('listings', __name__)

@listings.route('/', methods=['GET'])
def get_listings():
    all_listings = Listing.query.all()
    return jsonify({
        "message": "List of listings",
        "data": [{
            "id": listing.id,
            "title": listing.title,
            "price": listing.price,
            "location": listing.location,
            "url": listing.url,
            "platform": listing.platform,
            "date_posted": listing.date_posted.isoformat()
        } for listing in all_listings]
    }), 200

@listings.route('/create', methods=['POST'])
def create_listing():
    data = request.get_json()
    # Validate required fields
    required_fields = ['title', 'price', 'location', 'url', 'platform']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Create new listing
    new_listing = Listing(
        title=data['title'],
        price=data['price'],
        location=data['location'],
        url=data['url'],
        platform=data['platform']
    )
    
    # Save to database
    db.session.add(new_listing)
    db.session.commit()
    
    return jsonify({
        "message": "Listing created successfully",
        "data": {
            "id": new_listing.id,
            "title": new_listing.title,
            "price": new_listing.price,
            "location": new_listing.location,
            "url": new_listing.url,
            "platform": new_listing.platform,
            "date_posted": new_listing.date_posted.isoformat()
        }
    }), 201

@listings.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Listings are working!"}), 200
