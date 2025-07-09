#!/usr/bin/env python3
"""
Test script for Facebook Marketplace scraper
Based on https://github.com/passivebot/facebook-marketplace-scraper
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.facebook_scraper import scrape_facebook_marketplace

async def test_facebook_scraper():
    """Test the Facebook Marketplace scraper"""
    print("🧪 Testing Facebook Marketplace Scraper")
    print("=" * 50)
    
    # Test parameters
    city = "Toronto"
    query = "laptop"
    max_price = 1000
    
    print(f"📍 City: {city}")
    print(f"🔍 Query: {query}")
    print(f"💰 Max Price: ${max_price}")
    print()
    
    # Check if authentication file exists
    auth_file = "facebook_auth.json"
    if not os.path.exists(auth_file):
        print("❌ Authentication file not found!")
        print("💡 Please run the setup script first:")
        print("   python setup_facebook_auth.py")
        print()
        print("This will help you log into Facebook and save your session.")
        return
    
    print("✅ Authentication file found")
    print("🔐 Using saved Facebook session")
    print()
    
    try:
        print("🚀 Starting Facebook Marketplace scraping...")
        print("💡 Browser will open in visible mode")
        print("   If Facebook asks for login, the session may have expired")
        print("   Run 'python setup_facebook_auth.py' again to refresh")
        print()
        
        # Add a longer delay to ensure content is loaded
        await asyncio.sleep(5)
        results = await scrape_facebook_marketplace(city, query, max_price)
        
        print(f"✅ Scraping completed!")
        print(f"📊 Found {len(results)} listings")
        print()
        
        if results:
            print("📋 Sample Results:")
            print("-" * 30)
            for i, listing in enumerate(results[:5], 1):  # Show first 5 results
                print(f"{i}. {listing['title']}")
                print(f"   💰 ${listing['price']}")
                print(f"   🔗 {listing['url']}")
                print()
            
            if len(results) > 5:
                print(f"   ... and {len(results) - 5} more listings")
        else:
            print("❌ No listings found")
            print("💡 This might be due to:")
            print("   - Facebook blocking the scraper")
            print("   - No listings matching the criteria")
            print("   - Session expired (run setup script again)")
            print("   - CSS selectors need updating")
            print("   - Check facebook_page.html for debugging")
        
    except Exception as e:
        print(f"❌ Error during scraping: {str(e)}")
        print("💡 Check the logs for more details")

if __name__ == "__main__":
    print("Facebook Marketplace Scraper Test")
    print("Based on: https://github.com/passivebot/facebook-marketplace-scraper")
    print()
    
    # Run the test
    asyncio.run(test_facebook_scraper()) 