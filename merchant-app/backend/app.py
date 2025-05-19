# app.py
from flask import Flask
from utils.database import db, migrate
from routes.auth import auth
from routes.listings import listings
from routes.notifications import notifications
import os
from dotenv import load_dotenv

# ✅ Load the environment variables
load_dotenv()

app = Flask(__name__)
# Use SQLite as the default database if DATABASE_URL is not set
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///app.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("SECRET_KEY", "dev-secret-key")

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)

# Register Blueprints
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(listings, url_prefix="/api/listings")
app.register_blueprint(notifications, url_prefix="/api/notifications")

@app.cli.command("init-db")
def init_db():
    """Initialize the database."""
    db.create_all()
    print("Database initialized!")

if __name__ == '__main__':
    app.run(port=5000, debug=True)
