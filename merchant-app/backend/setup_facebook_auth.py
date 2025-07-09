#!/usr/bin/env python3
"""
Facebook Authentication Setup Script
This script helps you log into Facebook manually and save the session for the scraper.
"""

import asyncio
import sys
import os
from playwright.async_api import async_playwright

async def setup_facebook_auth():
    """Set up Facebook authentication by manually logging in and saving the session."""
    print("🔐 Facebook Authentication Setup")
    print("=" * 50)
    print("This script will open a browser window for you to log into Facebook manually.")
    print("After logging in successfully, the session will be saved for the scraper.")
    print()
    
    try:
        async with async_playwright() as p:
            # Launch browser in visible mode
            browser = await p.chromium.launch(
                headless=False,
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
            
            # Create a new context with realistic settings
            context = await browser.new_context(
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
            
            print("🌐 Opening Facebook login page...")
            await page.goto("https://www.facebook.com/", wait_until="domcontentloaded")
            
            print()
            print("📝 Instructions:")
            print("1. Log into Facebook in the browser window that just opened")
            print("2. Complete any CAPTCHA or 2FA if required")
            print("3. Make sure you can see your Facebook home page")
            print("4. Come back here and press Enter when you're logged in")
            print()
            
            # Wait for user to complete login
            input("Press Enter after you've successfully logged into Facebook...")
            
            # Verify login was successful
            try:
                # Wait for common elements that indicate successful login
                await page.wait_for_selector('[data-testid="blue_bar_profile_link"]', timeout=10000)
                print("✅ Login appears successful!")
            except:
                print("⚠️ Could not verify login automatically, but continuing...")
            
            # Save the authentication state
            auth_file = "facebook_auth.json"
            await context.storage_state(path=auth_file)
            
            print(f"💾 Authentication state saved to: {auth_file}")
            print("✅ Setup complete! You can now run the Facebook scraper.")
            print()
            print("📋 Next steps:")
            print("1. Run: python test_facebook_scraper.py")
            print("2. The scraper will use your saved session")
            print("3. If the session expires, run this setup script again")
            
            await browser.close()
            
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        print("💡 Try running the script again")

if __name__ == "__main__":
    print("Facebook Authentication Setup")
    print("Based on: https://github.com/passivebot/facebook-marketplace-scraper")
    print()
    
    # Run the setup
    asyncio.run(setup_facebook_auth()) 