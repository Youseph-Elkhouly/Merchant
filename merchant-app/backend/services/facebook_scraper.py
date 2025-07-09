# facebook_scraper.py
# Based on https://github.com/passivebot/facebook-marketplace-scraper
# Adapted for Flask backend integration

import sys
import os
import logging
import time
import random
import re
from datetime import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import asyncio
from playwright.async_api import async_playwright, TimeoutError
from bs4 import BeautifulSoup
from models import Listing
from utils.database import db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Facebook Marketplace city mapping from the original repository
FACEBOOK_CITIES = {
    'New York': 'nyc',
    'Los Angeles': 'la',
    'Las Vegas': 'vegas',
    'Chicago': 'chicago',
    'Houston': 'houston',
    'San Antonio': 'sanantonio',
    'Miami': 'miami',
    'Orlando': 'orlando',
    'San Diego': 'sandiego',
    'Arlington': 'arlington',
    'Baltimore': 'baltimore',
    'Cincinnati': 'cincinnati',
    'Denver': 'denver',
    'Fort Worth': 'fortworth',
    'Jacksonville': 'jacksonville',
    'Memphis': 'memphis',
    'Nashville': 'nashville',
    'Philadelphia': 'philly',
    'Portland': 'portland',
    'San Jose': 'sanjose',
    'Tucson': 'tucson',
    'Atlanta': 'atlanta',
    'Boston': 'boston',
    'Columbus': 'columbus',
    'Detroit': 'detroit',
    'Honolulu': 'honolulu',
    'Kansas City': 'kansascity',
    'New Orleans': 'neworleans',
    'Phoenix': 'phoenix',
    'Seattle': 'seattle',
    'Washington DC': 'dc',
    'Milwaukee': 'milwaukee',
    'Sacramento': 'sac',
    'Austin': 'austin',
    'Charlotte': 'charlotte',
    'Dallas': 'dallas',
    'El Paso': 'elpaso',
    'Indianapolis': 'indianapolis',
    'Louisville': 'louisville',
    'Minneapolis': 'minneapolis',
    'Oklahoma City': 'oklahoma',
    'Pittsburgh': 'pittsburgh',
    'San Francisco': 'sanfrancisco',
    'Tampa': 'tampa',
    # Canadian cities
    'Toronto': 'toronto',
    'Vancouver': 'vancouver',
    'Montreal': 'montreal',
    'Calgary': 'calgary',
    'Edmonton': 'edmonton',
    'Ottawa': 'ottawa',
    'Winnipeg': 'winnipeg',
    'Quebec City': 'quebec',
    'Hamilton': 'hamilton',
    'Kitchener': 'kitchener',
    'London': 'london',
    'Victoria': 'victoria',
    'Windsor': 'windsor',
    'Saskatoon': 'saskatoon',
    'Regina': 'regina',
    'Halifax': 'halifax',
    'St. John\'s': 'stjohns'
}

async def scrape_facebook_marketplace(city="Toronto", query="laptop", max_price=1000, email=None, password=None):
    """
    Scrape Facebook Marketplace using saved authentication state.
    """
    browser = None
    try:
        # Map city to Facebook location code
        if city in FACEBOOK_CITIES:
            city_code = FACEBOOK_CITIES[city]
        else:
            city_code = city.lower()
            logger.warning(f"City '{city}' not found in Facebook cities mapping, using '{city_code}'")
        
        marketplace_url = f'https://www.facebook.com/marketplace/{city_code}/search/?query={query}&maxPrice={max_price}'
        auth_file = "facebook_auth.json"
        
        logger.info(f"Fetching Facebook Marketplace URL: {marketplace_url}")
        
        # Check if auth file exists
        if not os.path.exists(auth_file):
            logger.error(f"Authentication file '{auth_file}' not found!")
            logger.error("Please run 'python setup_facebook_auth.py' first to set up authentication.")
            return []
        
        async with async_playwright() as p:
            # Launch browser with anti-detection measures
            browser = await p.chromium.launch(
                headless=False,  # Keep visible for debugging
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-site-isolation-trials',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images',
                    '--disable-javascript',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection'
                ]
            )
            
            # Create context with saved authentication state
            context = await browser.new_context(
                storage_state=auth_file,
                viewport={'width': 1920, 'height': 1080},
                locale='en-CA',
                timezone_id='America/Toronto',
                geolocation={'latitude': 43.6532, 'longitude': -79.3832},
                permissions=['geolocation'],
                color_scheme='light',
                reduced_motion='no-preference',
                forced_colors='none',
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            page = await context.new_page()
            
            # First, try to go to Facebook home to verify authentication
            logger.info("Verifying authentication...")
            try:
                await page.goto("https://www.facebook.com/", wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(3)
                
                # Check if we're logged in
                try:
                    await page.wait_for_selector('[data-testid="blue_bar_profile_link"]', timeout=10000)
                    logger.info("✅ Authentication verified - logged in successfully")
                except:
                    logger.warning("⚠️ Authentication may have expired - trying to continue anyway")
                    
            except Exception as e:
                logger.warning(f"Could not verify authentication: {str(e)}")
            
            # Navigate to marketplace
            logger.info("Navigating to Facebook Marketplace...")
            try:
                response = await page.goto(marketplace_url, wait_until="domcontentloaded", timeout=30000)
                if not response:
                    raise Exception("Failed to get response from page")
                logger.info(f"Page loaded with status {response.status}")
            except Exception as e:
                logger.error(f"Error loading marketplace page: {str(e)}")
                return []
            
            # Wait for page to load
            logger.info("Waiting for page to load...")
            try:
                await page.wait_for_load_state("domcontentloaded", timeout=10000)
                await page.wait_for_load_state("networkidle", timeout=10000)
            except TimeoutError:
                logger.warning("Timeout waiting for page load, continuing anyway...")
            
            await asyncio.sleep(3)
            
            # Scroll to load more content
            logger.info("Scrolling to load more content...")
            for i in range(3):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(2)
            
            # Get page content
            content = await page.content()
            with open("facebook_page.html", "w", encoding="utf-8") as f:
                f.write(content)
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            parsed = []
            
            # Updated CSS selectors based on current Facebook Marketplace structure
            # Look for listing containers with class x3ct3a4
            listings = soup.find_all('div', class_='x3ct3a4')
            logger.info(f"Found {len(listings)} listings with x3ct3a4 selector")
            
            # If no listings found, try alternative selectors
            if not listings:
                logger.info("Trying alternative selectors...")
                alternative_selectors = [
                    "div[data-testid='marketplace_feed_item']",
                    "div[data-testid='marketplace-listing-item']",
                    "div[data-testid='marketplace-item']",
                    "div[role='article']",
                    "a[href*='/marketplace/item/']"
                ]
                
                for selector in alternative_selectors:
                    listings = soup.select(selector)
                    if listings:
                        logger.info(f"Found {len(listings)} listings with selector: {selector}")
                        break
            
            # Process each listing
            for listing in listings:
                try:
                    price = None  # Ensure price is always defined
                    # Find the link element within the listing
                    link_elem = listing.find('a', href=re.compile(r'/marketplace/item/'))
                    if not link_elem:
                        # If listing is already a link element
                        if listing.name == 'a' and listing.get('href', '').startswith('/marketplace/item/'):
                            link_elem = listing
                        else:
                            continue
                    
                    # Extract URL
                    url = link_elem.get('href', '')
                    if not url.startswith('http'):
                        url = "https://www.facebook.com" + url
                    
                    # Find title - look for text content within the link
                    title = None
                    # Gather all span/div text candidates
                    text_candidates = [
                        elem.get_text(strip=True)
                        for elem in link_elem.find_all(['span', 'div'])
                        if elem.get_text(strip=True)
                    ]
                    # Remove duplicates
                    text_candidates = list(dict.fromkeys(text_candidates))
                    # Remove any candidate that matches the price
                    text_candidates = [
                        t for t in text_candidates
                        if (not price or str(price) not in t)
                    ]
                    # Use the first remaining candidate as the title
                    if text_candidates:
                        title = text_candidates[0]
                        # Remove all price patterns (e.g., 'CA$300', '$300', '- $300.0') from anywhere in the title
                        title = re.sub(r'(\-|–)?\s*(CA\$|\$)\d+[\d.,]*', '', title)
                        title = title.strip(', ').strip()
                    # Fallback: use the link text if still no title
                    if not title:
                        title = link_elem.get_text(strip=True)
                    
                    # Clean up title
                    if title:
                        # Remove extra whitespace and newlines
                        title = ' '.join(title.split())
                        # Remove very short titles
                        if len(title) < 3:
                            continue
                    
                    # Find price - look for price elements
                    price_elem = link_elem.find('span', class_=lambda x: x and ('x193iq5w' in x or 'x1lliihq' in x))
                    if not price_elem:
                        # Try to find any element that might contain price
                        price_elem = link_elem.find('span', string=re.compile(r'[\$]?\d+'))
                    
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                        # Extract price using regex
                        price_match = re.search(r'[\$]?(\d+(?:,\d{3})*(?:\.\d{2})?)', price_text)
                        if price_match:
                            price = float(price_match.group(1).replace(",", ""))
                    
                    # Find image
                    image = None
                    img_elem = link_elem.find('img')
                    if img_elem:
                        image = img_elem.get('src', '')
                    
                    # Only add listing if we have at least a title and URL
                    if title and url:
                        listing_data = {
                            "title": title,
                            "price": price,
                            "url": url,
                            "platform": "Facebook",
                            "date_posted": datetime.utcnow(),
                            "image": image
                        }
                        # Optionally extract description/info if available
                        desc_elem = link_elem.find('div', string=True)
                        if desc_elem:
                            listing_data["info"] = desc_elem.get_text(strip=True)
                        parsed.append(listing_data)
                        logger.info(f"Successfully scraped listing: {title} - ${price if price else 'N/A'}")
                    
                except Exception as e:
                    logger.error(f"Error processing listing: {str(e)}")
                    continue
            
            await browser.close()
            logger.info(f"Successfully scraped {len(parsed)} listings from Facebook Marketplace")
            return parsed

    except Exception as e:
        logger.error(f"Error scraping Facebook Marketplace: {str(e)}")
        return []
    finally:
        if browser:
            try:
                await browser.close()
            except:
                pass

def save_facebook_listings_to_db(listings, app):
    """Save scraped Facebook listings to the database."""
    with app.app_context():
        try:
            new_count = 0
            updated_count = 0
            for data in listings:
                # Check if listing already exists
                existing = Listing.query.filter_by(url=data["url"]).first()
                if not existing:
                    listing = Listing(**data)
                    db.session.add(listing)
                    new_count += 1
                    logger.info(f"Saved new Facebook listing: {data['title']}")
                else:
                    # Update existing listing
                    for key, value in data.items():
                        setattr(existing, key, value)
                    updated_count += 1
                    logger.info(f"Updated existing Facebook listing: {data['title']}")

            db.session.commit()
            logger.info(f"✅ {new_count} new Facebook listings saved, {updated_count} listings updated in database.")
            return new_count + updated_count
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving Facebook listings to database: {str(e)}")
            return 0

async def run_facebook_scraper(app, city="Toronto", query="laptop", max_price=1000, email=None, password=None):
    """Run Facebook Marketplace scraper and save results."""
    logger.info(f"Starting Facebook Marketplace scraper for {city}, query: {query}, max price: ${max_price}")
    
    # Run Facebook scraper
    facebook_listings = await scrape_facebook_marketplace(city, query, max_price, email, password)
    
    # Save listings
    total_saved = save_facebook_listings_to_db(facebook_listings, app)
    logger.info(f"Facebook scraping completed. Total listings processed: {total_saved}")
    
    return {
        "listings_found": len(facebook_listings),
        "listings_saved": total_saved,
        "city": city,
        "query": query,
        "max_price": max_price
    }

if __name__ == "__main__":
    # This will be run separately with the app context
    print("This module should be imported and run with app context") 