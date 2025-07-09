#!/usr/bin/env python3
"""
Test script for the backend
Run this to test all the main functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001"

def test_health():
    """Test the health endpoint"""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_auth():
    """Test authentication endpoints"""
    print("\n🔐 Testing authentication...")
    
    # Test registration
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        if response.status_code == 201:
            print("✅ Registration successful")
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return False
    
    # Test login
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=register_data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

def test_listings(token=None):
    """Test listings endpoints"""
    print("\n📋 Testing listings...")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # Test get listings
    try:
        response = requests.get(f"{BASE_URL}/api/listings/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get listings successful - {len(data.get('data', []))} listings")
        else:
            print(f"❌ Get listings failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get listings error: {str(e)}")
        return False
    

    
    # Test stats
    try:
        response = requests.get(f"{BASE_URL}/api/listings/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats successful - Total: {stats.get('total_listings')}")
        else:
            print(f"❌ Stats failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Stats error: {str(e)}")
        return False
    
    return True

def test_scraper():
    """Test the scraper endpoint"""
    print("\n🕷️ Testing scraper...")
    
    try:
        response = requests.post(f"{BASE_URL}/api/listings/scrape")
        if response.status_code == 202:
            print("✅ Scraper triggered successfully")
            print("⏳ Waiting 30 seconds for scraping to complete...")
            time.sleep(30)
            
            # Check stats after scraping
            response = requests.get(f"{BASE_URL}/api/listings/stats")
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ Scraping completed - Total listings: {stats.get('total_listings')}")
                return True
        else:
            print(f"❌ Scraper failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Scraper error: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🧪 Starting backend tests...")
    
    # Test health
    if not test_health():
        print("❌ Health check failed, stopping tests")
        return
    
    # Test auth
    token = test_auth()
    
    # Test listings
    if not test_listings(token):
        print("❌ Listings tests failed")
        return
    
    # Test scraper (optional - takes time)
    print("\n🤔 Do you want to test the scraper? (y/n): ", end="")
    try:
        choice = input().lower().strip()
        if choice == 'y':
            test_scraper()
    except KeyboardInterrupt:
        print("\n⏹️ Scraper test skipped")
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main() 