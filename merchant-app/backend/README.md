# Merchant Backend

A Flask-based backend for the Merchant application with web scraping capabilities for laptop listings from Kijiji and Facebook Marketplace.

## Features

- 🔐 User authentication with JWT
- 📋 CRUD operations for listings
- 🕷️ Web scraping from Kijiji and Facebook Marketplace
- 🗄️ SQLite database (configurable for PostgreSQL)
- 🌐 CORS support for frontend integration
- 📊 Listing statistics and analytics

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
# Install Playwright browsers (required for web scraping)
playwright install chromium
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=sqlite:///app.db

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Initialize Database

```bash
# Initialize the database
python app.py
```

The database will be automatically created when you run the app for the first time.

## Running the Backend

### Development Mode

```bash
python app.py
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
# Set environment variables
export FLASK_ENV=production
export FLASK_DEBUG=False

# Run with gunicorn (install with: pip install gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check
- `GET /health` - Check if the backend is running

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Listings
- `GET /api/listings/` - Get all listings
- `POST /api/listings/create` - Create a new listing
- `POST /api/listings/scrape` - Trigger web scraping
- `GET /api/listings/stats` - Get listing statistics
- `GET /api/listings/ping` - Health check for listings

### Notifications
- `GET /api/notifications/` - Get notifications (if implemented)

## Web Scraping

### Manual Scraping

```bash
# Run the scraper manually
python run_scraper.py
```

### API Scraping

```bash
# Trigger scraping via API
curl -X POST http://localhost:5000/api/listings/scrape
```

### Supported Platforms

1. **Kijiji** - Laptop listings from Toronto area
2. **Facebook Marketplace** - Placeholder (requires authentication setup)

## Testing

### Run All Tests

```bash
python test_backend.py
```

### Test Individual Components

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test listings endpoint
curl http://localhost:5000/api/listings/ping

# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Database

### SQLite (Default)
- Database file: `instance/app.db`
- No additional setup required

### PostgreSQL (Optional)
1. Install PostgreSQL
2. Create database and user
3. Update `DATABASE_URL` in `.env`
4. Install `psycopg2-binary` (already in requirements.txt)

## Troubleshooting

### Common Issues

1. **Playwright not installed**
   ```bash
   playwright install chromium
   ```

2. **Database errors**
   ```bash
   # Remove existing database
   rm instance/app.db
   # Restart the application
   python app.py
   ```

3. **CORS errors**
   - Check `CORS_ORIGINS` in `.env`
   - Ensure frontend URL is included

4. **Scraping fails**
   - Check internet connection
   - Verify target websites are accessible
   - Check browser logs in `kijiji_page.html`

### Logs

- Application logs are printed to console
- Scraping logs include detailed information about the process
- HTML content is saved to `kijiji_page.html` for debugging

## Development

### Project Structure

```
backend/
├── app.py                 # Main Flask application
├── models.py             # Database models
├── requirements.txt      # Python dependencies
├── run_scraper.py       # Scraper runner script
├── test_backend.py      # Test script
├── routes/              # API routes
│   ├── auth.py         # Authentication routes
│   ├── listings.py     # Listing routes
│   └── notifications.py # Notification routes
├── services/           # Business logic
│   ├── scraper.py     # Web scraping logic
│   └── notification_service.py # Notification service
└── utils/             # Utilities
    └── database.py    # Database configuration
```

### Adding New Features

1. Create new routes in `routes/` directory
2. Add business logic in `services/` directory
3. Update models in `models.py` if needed
4. Add tests to `test_backend.py`

## Security Notes

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting for scraping endpoints
- Add input validation for all endpoints
- Consider using environment-specific configurations

## License

This project is part of the Merchant application. 