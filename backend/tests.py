import requests 
import json

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def test_health():
    print("testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Reponse: {response.json()}")
    return response.status_code == 200

def test_auth():
    print("testing auth...")
    login_data = {"username": "admin", "password": "test123"}
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    print(f"Login Status: {response.status_code}")

    if response.status_code == 200:
        token = response.json()["access_token"]
        print("auth working")
        return token
    else:
        print("auth failed")
        return None

def test_demo():
    print("testing demo login...")
    response = requests.post(f"{API_URL}/auth/demo")
    print(f"Demo Login Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data["access_token"]
        print(f"Demo login successful! Token: {token[:20]}...")
        print(f"Token type: {data.get('token_type', 'N/A')}")
        return token
    else:
        print(f"Demo login failed: {response.text}")
        return None
    
def test_files(token): 
    print("testing file listing...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/files/list", headers=headers)
    print(f"Files Status: {response.status_code}")
    
    if response.status_code == 200:
        files = response.json()
        print(f"Found {files['total_items']} items")
    else:
        print("file listing failed")

if __name__ == "__main__":
    print("Testing File Server API")
    print("="*40)
    
    if test_health():
        # Test demo endpoint
        demo_token = test_demo()
        if demo_token:
            print("\nTesting demo token with /auth/me endpoint...")
            headers = {"Authorization": f"Bearer {demo_token}"}
            me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
            if me_response.status_code == 200:
                user_info = me_response.json()
                print(f"Demo user info: {user_info}")
            else:
                print(f"Failed to get user info: {me_response.status_code} - {me_response.text}")
        
        # Test regular auth
        token = test_auth()
        if token:
            test_files(token)
            print("\nAll tests passed!")