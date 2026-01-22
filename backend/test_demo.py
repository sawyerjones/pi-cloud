#!/usr/bin/env python3
"""
Test script specifically for the demo endpoint.
Can be run against local backend or via docker exec.
"""
import requests
import sys
import os

# Allow testing against different backends
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_URL = f"{BASE_URL}/api/v1"

def test_demo_endpoint():
    """Test the /api/v1/auth/demo endpoint"""
    print("=" * 60)
    print("Testing Demo Login Endpoint")
    print("=" * 60)
    print(f"Testing against: {API_URL}/auth/demo")
    print()
    
    try:
        # Test demo login
        print("1. Testing POST /api/v1/auth/demo...")
        response = requests.post(f"{API_URL}/auth/demo", timeout=10)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            token_type = data.get("token_type", "N/A")
            
            print(f"   ✓ Demo login successful!")
            print(f"   Token Type: {token_type}")
            print(f"   Token (first 30 chars): {token[:30]}...")
            
            # Test token with /auth/me endpoint
            print("\n2. Testing token with GET /api/v1/auth/me...")
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=10)
            
            if me_response.status_code == 200:
                user_info = me_response.json()
                print(f"   ✓ Token validation successful!")
                print(f"   Username: {user_info.get('username')}")
                print(f"   Permissions: {user_info.get('permissions')}")
                print("\n" + "=" * 60)
                print("✓ All demo endpoint tests passed!")
                print("=" * 60)
                return True
            else:
                print(f"   ✗ Token validation failed: {me_response.status_code}")
                print(f"   Response: {me_response.text}")
                return False
        else:
            print(f"   ✗ Demo login failed!")
            print(f"   Response: {response.text}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                pass
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"   ✗ Connection refused - is the backend running?")
        print(f"   Try: docker-compose up -d backend")
        return False
    except requests.exceptions.Timeout:
        print(f"   ✗ Request timed out")
        return False
    except Exception as e:
        print(f"   ✗ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_demo_endpoint()
    sys.exit(0 if success else 1)
