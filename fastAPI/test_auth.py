"""
Test script for authentication endpoints
"""
import os
import json
import requests
from typing import Dict, Any

# Base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_auth_endpoints():
    """Test all authentication endpoints"""
    print("\nTesting authentication endpoints...\n")
    
    # Test /auth/test
    print("Testing /auth/test...")
    response = requests.get(f"{BASE_URL}/auth/test")
    print_response(response)
    
    # Test login with demo credentials
    print("\nTesting /auth/login with demo credentials...")
    response = requests.post(
        f"{BASE_URL}/auth/login", 
        json={"email": "demo@example.com", "password": "password"}
    )
    print_response(response)
    
    # Extract token from response
    data = response.json()
    if data.get("success"):
        token = data["data"]["access_token"]
        
        # Test /auth/me with token
        print("\nTesting /auth/me...")
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        print_response(response)
    else:
        print("Login failed, skipping /auth/me test")
        
    # Test signup with new user
    print("\nTesting /auth/signup with new user...")
    response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpassword",
            "name": "Test User"
        }
    )
    print_response(response)

def print_response(response: requests.Response):
    """Print formatted response"""
    try:
        data = response.json()
        print(f"Status code: {response.status_code}")
        print("Response:")
        print(json.dumps(data, indent=2))
    except json.JSONDecodeError:
        print(f"Status code: {response.status_code}")
        print("Response: Not JSON")
        print(response.text)

if __name__ == "__main__":
    test_auth_endpoints() 