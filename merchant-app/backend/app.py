# app.py
from flask import Flask
from utils.database import db, migrate
from routes.auth import auth
from routes.listings import listings
from routes.notifications import notifications
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("SECRET_KEY")

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)

# Register Blueprints
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(listings, url_prefix="/api/listings")
app.register_blueprint(notifications, url_prefix="/api/notifications")

if __name__ == '__main__':
    app.run(port=5000, debug=True)
