import sys
import os
import logging
import time
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright, TimeoutError
from bs4 import BeautifulSoup
from models import Listing
from utils.database import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KIJIJI_CITIES = {
    'Toronto': 'on/gta-greater-toronto-area',
    'Vancouver': 'bc/vancouver',
    'Montreal': 'qc/greater-montreal-area',
    'Calgary': 'ab/calgary',
    'Edmonton': 'ab/edmonton',
    'Ottawa': 'on/ottawa',
    'Winnipeg': 'mb/winnipeg',
    'Quebec City': 'qc/quebec-city',
    'Hamilton': 'on/hamilton',
    'Kitchener': 'on/kitchener-waterloo-cambridge',
    'London': 'on/london',
    'Victoria': 'bc/victoria',
    'Windsor': 'on/windsor-region',
    'Saskatoon': 'sk/saskatoon',
    'Regina': 'sk/regina',
    'Halifax': 'ns/halifax',
    "St. John's": 'nl/st-johns',
}

def build_kijiji_url(city="Toronto", query="laptop", max_price=1000):
    city_path = KIJIJI_CITIES.get(city, 'on/gta-greater-toronto-area')
    url = f"https://www.kijiji.ca/b-{city_path}/search/kijiji/{query}/k0l1700272?price={max_price}"
    return url

async def scrape_kijiji(city="Toronto", query="laptop", max_price=1000):
    url = build_kijiji_url(city, query, max_price)
    logger.info(f"Scraping Kijiji URL: {url}")
    listings = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(3)
            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')
            items = soup.select('li[data-testid="listing-card"]')
            for item in items:
                title_tag = item.select_one('.title a')
                price_tag = item.select_one('.price')
                image_tag = item.select_one('img')
                location_tag = item.select_one('.location')
                date_tag = item.select_one('.date-posted')
                url = title_tag['href'] if title_tag and title_tag.has_attr('href') else ''
                title = title_tag.get_text(strip=True) if title_tag else 'Kijiji Listing'
                price = price_tag.get_text(strip=True).replace('$', '').replace(',', '') if price_tag else '0'
                try:
                    price = float(price)
                except:
                    price = 0.0
                image = image_tag['src'] if image_tag and image_tag.has_attr('src') else ''
                location = location_tag.get_text(strip=True) if location_tag else ''
                date_posted = date_tag.get_text(strip=True) if date_tag else ''
                listings.append({
                    'title': title,
                    'price': price,
                    'url': f'https://www.kijiji.ca{url}' if url.startswith('/') else url,
                    'platform': 'Kijiji',
                    'date_posted': date_posted,
                    'image': image,
                    'condition': 'Good',
                    'category': 'Electronics',
                    'location': location,
                    'info': '',
                })
        except Exception as e:
            logger.error(f"Error scraping Kijiji: {str(e)}")
        finally:
            await browser.close()
    return listings

def save_kijiji_listings_to_db(listings, app):
    with app.app_context():
        for l in listings:
            exists = Listing.query.filter_by(url=l['url']).first()
            if exists:
                continue
            listing = Listing(
                title=l['title'],
                price=l['price'],
                url=l['url'],
                platform=l['platform'],
                date_posted=datetime.utcnow(),
                image=l['image'],
                condition=l['condition'],
                category=l['category'],
                location=l['location'],
                info=l['info'],
            )
            db.session.add(listing)
        db.session.commit()
        logger.info(f"Saved {len(listings)} new Kijiji listings to DB.")

async def run_kijiji_scraper(app, city="Toronto", query="laptop", max_price=1000):
    listings = await scrape_kijiji(city, query, max_price)
    save_kijiji_listings_to_db(listings, app) 