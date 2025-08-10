#!/usr/bin/env python
"""
Mobile API Test Script
Run this to test the mobile API endpoints
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001"
MOBILE_API = f"{BASE_URL}/mobile"

def test_login():
    """Test mobile login endpoint"""
    url = f"{MOBILE_API}/auth/login/"
    data = {
        "username": "admin",
        "password": "admin"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login API Status: {response.status_code}")
        print(f"Login Response: {response.json()}")
        
        if response.status_code == 200:
            return response.json().get('token')
        return None
    except Exception as e:
        print(f"Login Error: {e}")
        return None

def test_dashboard(token):
    """Test mobile dashboard endpoint"""
    url = f"{MOBILE_API}/dashboard/"
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Dashboard API Status: {response.status_code}")
        print(f"Dashboard Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Dashboard Error: {e}")

def test_transactions(token):
    """Test mobile transactions endpoint"""
    url = f"{MOBILE_API}/transactions/"
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Transactions API Status: {response.status_code}")
        print(f"Transactions Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Transactions Error: {e}")

def test_categories(token):
    """Test mobile categories endpoint"""
    url = f"{MOBILE_API}/categories/"
    headers = {"Authorization": f"Token {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Categories API Status: {response.status_code}")
        print(f"Categories Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Categories Error: {e}")

def main():
    print("=== Budget Tracker Mobile API Test ===\n")
    
    # Test login
    print("1. Testing Login...")
    token = test_login()
    
    if not token:
        print("❌ Login failed. Cannot proceed with other tests.")
        return
    
    print(f"✅ Login successful! Token: {token[:20]}...\n")
    
    # Test dashboard
    print("2. Testing Dashboard...")
    test_dashboard(token)
    print()
    
    # Test transactions
    print("3. Testing Transactions...")
    test_transactions(token)
    print()
    
    # Test categories
    print("4. Testing Categories...")
    test_categories(token)
    print()
    
    print("=== Test Complete ===")

if __name__ == "__main__":
    main()
