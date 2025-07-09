# app.py
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

from utils.database import db
from flask_migrate import Migrate
from routes.auth import auth
from routes.listings import listings
from routes.notifications import notifications  # Optional: comment out if not implemented
from models import User, Listing  # Ensure models are imported before migrate.init_app()

# ✅ Load .env file
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///app.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("SECRET_KEY", "dev-secret-key")

# ✅ Initialize CORS
CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","))

# ✅ Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# ✅ Register Blueprints
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(listings, url_prefix="/api/listings")
app.register_blueprint(notifications, url_prefix="/api/notifications")  # Optional

# ✅ Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "healthy", "message": "Backend is running!"}, 200

# ✅ CLI command to initialize the database manually (if needed)
@app.cli.command("init-db")
def init_db():
    with app.app_context():
        db.create_all()
        print("✅ Database initialized!")

# ✅ Run the server (not used in production)
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5001, debug=True, host='0.0.0.0')
