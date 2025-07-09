#!/usr/bin/env python3
"""
Scraper runner script
Run this to execute the web scrapers with proper Flask app context
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from services.scraper import run_scraper

async def main():
    """Main function to run the scraper"""
    print("🚀 Starting web scraper...")
    
    try:
        await run_scraper(app)
        print("✅ Scraping completed successfully!")
    except Exception as e:
        print(f"❌ Error running scraper: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 