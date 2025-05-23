# scraper.py
import sys
import os
import logging
import time
import random
from datetime import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import asyncio
import requests
from playwright.async_api import async_playwright, TimeoutError
from bs4 import BeautifulSoup
from models import Listing
from utils.database import db
from app import app

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# List of user agents to rotate
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
]

async def scrape_kijiji():
    """Scrape laptop listings from Kijiji using Playwright."""
    browser = None
    try:
        # Use the correct URL for laptops in Toronto
        url = "https://www.kijiji.ca/b-laptops/city-of-toronto/c773l1700273"
        logger.info(f"Fetching URL: {url}")
        
        async with async_playwright() as p:
            # Launch browser with additional arguments
            browser = await p.chromium.launch(
                headless=False,  # Use non-headless mode
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
                    '--disable-gpu'
                ]
            )
            
            # Create a new context with a random user agent
            context = await browser.new_context(
                user_agent=random.choice(USER_AGENTS),
                viewport={'width': 1920, 'height': 1080},
                locale='en-CA',
                timezone_id='America/Toronto',
                geolocation={'latitude': 43.6532, 'longitude': -79.3832},  # Toronto coordinates
                permissions=['geolocation'],
                color_scheme='light',
                reduced_motion='no-preference',
                forced_colors='none'
            )
            
            # Create a new page
            page = await context.new_page()
            
            # Add additional headers
            await page.set_extra_http_headers({
                'Accept-Language': 'en-CA,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            })
            
            # Add a random delay before navigation
            await asyncio.sleep(random.uniform(2, 4))
            
            # Navigate to the page with a longer timeout and different wait strategy
            logger.info("Navigating to Kijiji...")
            try:
                response = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                if not response:
                    raise Exception("Failed to get response from page")
                if response.status != 200:
                    raise Exception(f"Page returned status code {response.status}")
                logger.info(f"Page loaded with status {response.status}")
            except Exception as e:
                logger.error(f"Error loading page: {str(e)}")
                return []
            
            # Wait for the page to be fully loaded
            logger.info("Waiting for page to load...")
            try:
                await page.wait_for_load_state("domcontentloaded", timeout=10000)
                await page.wait_for_load_state("networkidle", timeout=10000)
            except TimeoutError:
                logger.warning("Timeout waiting for page load, continuing anyway...")
            
            # Add random mouse movements and scrolling
            logger.info("Performing random mouse movements...")
            for _ in range(5):
                await page.mouse.move(
                    random.randint(0, 1920),
                    random.randint(0, 1080)
                )
                await page.mouse.wheel(0, random.randint(-100, 100))
                await asyncio.sleep(random.uniform(0.5, 1.5))
            
            # Try to find and click the "Accept" button for cookies if it exists
            try:
                logger.info("Checking for cookie consent...")
                accept_button = await page.wait_for_selector('button[data-testid="cookie-banner-accept"]', timeout=5000)
                if accept_button:
                    await accept_button.click()
                    logger.info("Accepted cookies")
                    await asyncio.sleep(1)
            except TimeoutError:
                logger.info("No cookie consent found")
            
            # Get the page content and save it for debugging
            content = await page.content()
            with open("kijiji_page.html", "w", encoding="utf-8") as f:
                f.write(content)
            
            # Wait for the listings to load with a longer timeout
            logger.info("Waiting for listings to load...")
            try:
                # Try multiple selectors for listings
                selectors = [
                    "div[data-testid='listing-card']",
                    "div[data-testid='search-item']",
                    "div.search-item",
                    "div[data-testid='listing-card']",
                    "div[data-testid='listing-card']",
                    "div[data-testid='search-item']",
                    "div[data-testid='listing-card']",
                    "div[data-testid='listing-card']",
                    "div[data-testid='listing-card']",
                    "div[data-testid='listing-card']"
                ]
                
                # Wait for any of the selectors to appear
                for selector in selectors:
                    try:
                        logger.info(f"Trying selector: {selector}")
                        # Wait for the selector with a shorter timeout
                        await page.wait_for_selector(selector, timeout=5000)
                        logger.info(f"Found listings with selector: {selector}")
                        break
                    except TimeoutError:
                        logger.warning(f"Timeout waiting for selector: {selector}")
                        continue
                
                # Add a longer delay to ensure content is loaded
                await asyncio.sleep(5)
                
                # Get the page content
                content = await page.content()
                
                # Parse with BeautifulSoup
                soup = BeautifulSoup(content, "html.parser")
                listings = []

                # Try multiple selectors for listings
                items = soup.select("div[data-testid='listing-card']")
                if not items:
                    items = soup.select("div[data-testid='search-item']")
                if not items:
                    items = soup.select("div.search-item")
                
                logger.info(f"Found {len(items)} items on the page")

                for item in items:
                    try:
                        # Get title - try multiple selectors
                        title_elem = (
                            item.select_one("h3[data-testid='listing-title']") or
                            item.select_one("a.title") or
                            item.select_one("div.title") or
                            item.select_one("h3")
                        )
                        if not title_elem:
                            logger.warning("Could not find title element")
                            continue
                        title = title_elem.get_text(strip=True)

                        # Get price - try multiple selectors
                        price_elem = (
                            item.select_one("p[data-testid='listing-price']") or
                            item.select_one("div.price") or
                            item.select_one("span.price") or
                            item.select_one("p[data-testid='price']")
                        )
                        if not price_elem:
                            logger.warning(f"Could not find price for listing: {title}")
                            continue
                        price_text = price_elem.get_text(strip=True)
                        try:
                            price = float(price_text.replace("$", "").replace(",", "").strip())
                        except ValueError:
                            logger.warning(f"Could not parse price for listing: {title}")
                            continue

                        # Get location - try multiple selectors
                        location_elem = (
                            item.select_one("p[data-testid='listing-location']") or
                            item.select_one("div.location") or
                            item.select_one("span.location") or
                            item.select_one("p[data-testid='location']")
                        )
                        if not location_elem:
                            logger.warning(f"Could not find location for listing: {title}")
                            continue
                        location = location_elem.get_text(strip=True)

                        # Get URL - try multiple selectors
                        url_elem = (
                            item.select_one("a[data-testid='listing-link']") or
                            item.select_one("a.title") or
                            item.select_one("a") or
                            item.select_one("a[href*='/v-laptop/']")
                        )
                        if not url_elem:
                            logger.warning(f"Could not find URL for listing: {title}")
                            continue
                        
                        # Handle both relative and absolute URLs
                        url = url_elem["href"]
                        if not url.startswith("http"):
                            url = "https://www.kijiji.ca" + url

                        listing_data = {
                            "title": title,
                            "price": price,
                            "location": location,
                            "url": url,
                            "platform": "Kijiji",
                            "date_posted": datetime.utcnow()
                        }
                        
                        listings.append(listing_data)
                        logger.info(f"Successfully scraped listing: {title} - ${price} - {location}")
                        
                    except Exception as e:
                        logger.error(f"Error processing listing: {str(e)}")
                        continue

                logger.info(f"Successfully scraped {len(listings)} listings from Kijiji")
                return listings

            except Exception as e:
                logger.error(f"Error waiting for listings: {str(e)}")
                return []

    except Exception as e:
        logger.error(f"Error scraping Kijiji: {str(e)}")
        return []
    finally:
        # Close browser
        if browser:
            try:
                await browser.close()
            except:
                pass

def scrape_facebook_marketplace():
    """Scrape laptop listings from Facebook Marketplace."""
    try:
        url = "https://www.facebook.com/marketplace/toronto/search?query=laptop"
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        listings = []

        # Note: Facebook Marketplace requires authentication and has anti-scraping measures
        # This is a placeholder for the actual implementation
        logger.warning("Facebook Marketplace scraping requires authentication and additional setup")
        return listings
    except Exception as e:
        logger.error(f"Error scraping Facebook Marketplace: {str(e)}")
        return []

def save_to_db(listings):
    """Save scraped listings to the database."""
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
                    logger.info(f"Saved new listing: {data['title']}")
                else:
                    # Update existing listing
                    for key, value in data.items():
                        setattr(existing, key, value)
                    updated_count += 1
                    logger.info(f"Updated existing listing: {data['title']}")

            db.session.commit()
            logger.info(f"✅ {new_count} new listings saved, {updated_count} listings updated in database.")
            return new_count + updated_count
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving to database: {str(e)}")
            return 0

async def run_scraper():
    """Run all scrapers and save results."""
    all_listings = []
    
    # Run Kijiji scraper
    logger.info("Starting Kijiji scraper...")
    kijiji_listings = await scrape_kijiji()
    all_listings.extend(kijiji_listings)
    
    # Run Facebook Marketplace scraper
    logger.info("Starting Facebook Marketplace scraper...")
    fb_listings = scrape_facebook_marketplace()
    all_listings.extend(fb_listings)
    
    # Save all listings
    total_saved = save_to_db(all_listings)
    logger.info(f"Scraping completed. Total listings processed: {total_saved}")

if __name__ == "__main__":
    asyncio.run(run_scraper())
