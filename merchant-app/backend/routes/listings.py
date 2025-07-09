# routes/listings.py
from flask import Blueprint, jsonify, request, current_app
from models import Listing, Favourite
from utils.database import db
import asyncio
import threading
from services.scraper import run_scraper
from services.facebook_scraper import run_facebook_scraper
from flask_jwt_extended import jwt_required, get_jwt_identity

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
            "url": listing.url,
            "platform": listing.platform,
            "date_posted": listing.date_posted.isoformat() if listing.date_posted else None,
            "image": listing.image,
            "condition": getattr(listing, 'condition', 'Good'),
            "category": getattr(listing, 'category', 'Electronics'),
            # Optionally include info/description if present
            **({"info": getattr(listing, "info", None)} if hasattr(listing, "info") else {})
        } for listing in all_listings]
    }), 200



@listings.route('/clear', methods=['DELETE'])
def clear_all_listings():
    """Clear all scraped listings from the database"""
    try:
        # Delete all listings
        deleted_count = Listing.query.delete()
        db.session.commit()
        
        return jsonify({
            "message": f"Successfully cleared {deleted_count} listings from database",
            "deleted_count": deleted_count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": f"Failed to clear listings: {str(e)}"
        }), 500

@listings.route('/scrape', methods=['POST'])
def trigger_scrape_unified():
    """Trigger the web scraper for the selected platform (facebook or kijiji) with data clearing"""
    data = request.get_json() or {}
    platform = data.get('platform', 'facebook').lower()
    city = data.get('city', 'Toronto')
    query = data.get('query', 'laptop')
    max_price = data.get('max_price', 1000)
    email = data.get('email')
    password = data.get('password')

    def run_scraper_async(app, platform, city, query, max_price, email, password):
        with app.app_context():
            # Clear old data first
            try:
                deleted_count = Listing.query.delete()
                db.session.commit()
                print(f"✅ Cleared {deleted_count} old listings before scraping")
            except Exception as e:
                print(f"❌ Error clearing old listings: {str(e)}")
                db.session.rollback()
            # Dispatch to the correct scraper
            if platform == 'facebook':
                from services.facebook_scraper import run_facebook_scraper
                asyncio.run(run_facebook_scraper(app, city, query, max_price, email, password))
            elif platform == 'kijiji':
                from services.kijiji_scraper import run_kijiji_scraper
                asyncio.run(run_kijiji_scraper(app, city, query, max_price))
            else:
                print(f"❌ Unknown platform: {platform}")

    # Validate required fields
    if platform == 'facebook' and (not email or not password):
        return jsonify({
            "error": "Facebook scraping requires email and password."
        }), 400
    if platform not in ['facebook', 'kijiji']:
        return jsonify({
            "error": f"Unsupported platform: {platform}"
        }), 400

    # Run scraper in a separate thread to avoid blocking
    thread = threading.Thread(target=run_scraper_async, args=(current_app._get_current_object(), platform, city, query, max_price, email, password))
    thread.daemon = True
    thread.start()

    return jsonify({
        "message": f"{platform.capitalize()} scraping started in background (old data cleared)",
        "status": "running",
        "parameters": {
            "platform": platform,
            "city": city,
            "query": query,
            "max_price": max_price,
            "login_provided": bool(email and password) if platform == 'facebook' else None
        }
    }), 202

@listings.route('/stats', methods=['GET'])
def get_stats():
    """Get listing statistics"""
    total_listings = Listing.query.count()
    kijiji_listings = Listing.query.filter_by(platform='Kijiji').count()
    facebook_listings = Listing.query.filter_by(platform='Facebook').count()
    
    return jsonify({
        "total_listings": total_listings,
        "kijiji_listings": kijiji_listings,
        "facebook_listings": facebook_listings
    }), 200

@listings.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Listings are working!"}), 200

@listings.route('/favourites', methods=['GET'])
@jwt_required()
def get_favourites():
    user_id = get_jwt_identity()
    favs = Favourite.query.filter_by(user_id=user_id).all()
    listings = [fav.listing for fav in favs]
    return jsonify({
        'favourites': [
            {
                'id': l.id,
                'title': l.title,
                'price': l.price,
                'url': l.url,
                'platform': l.platform,
                'date_posted': l.date_posted.isoformat() if l.date_posted else None,
                'image': l.image,
                'condition': getattr(l, 'condition', 'Good'),
                'category': getattr(l, 'category', 'Electronics'),
                'info': getattr(l, 'info', None),
                'location': getattr(l, 'location', None)
            } for l in listings
        ]
    }), 200

@listings.route('/favourites', methods=['POST'])
@jwt_required()
def add_favourite():
    user_id = get_jwt_identity()
    data = request.get_json()
    listing_id = data.get('listing_id')
    if not listing_id:
        return jsonify({'error': 'listing_id is required'}), 400
    # Prevent duplicates
    if Favourite.query.filter_by(user_id=user_id, listing_id=listing_id).first():
        return jsonify({'message': 'Already favourited'}), 200
    fav = Favourite(user_id=user_id, listing_id=listing_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify({'message': 'Added to favourites'}), 201

@listings.route('/favourites/<int:listing_id>', methods=['DELETE'])
@jwt_required()
def remove_favourite(listing_id):
    user_id = get_jwt_identity()
    fav = Favourite.query.filter_by(user_id=user_id, listing_id=listing_id).first()
    if not fav:
        return jsonify({'error': 'Not in favourites'}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({'message': 'Removed from favourites'}), 200
