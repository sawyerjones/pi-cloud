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
        token = test_auth()
        if token:
            test_files(token)
            print("tests passed")