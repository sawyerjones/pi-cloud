from decouple import config
import os

def get_jwt_secret():
    # try Docker secret first
    try:
        with open('/run/secrets/jwt_secret', 'r') as f:
            secret = f.read().strip()
            if secret:
                return secret

    except (FileNotFoundError, IOError):
        pass
    
    # try environment variable
    env_secret = os.getenv('JWT_SECRET')
    if env_secret:
        return env_secret

SECRET_KEY = get_jwt_secret()
DEBUG = config("DEBUG", cast=bool)

STORAGE_PATH = config("STORAGE_PATH")
MAX_FILE_SIZE = config("MAX_FILE_SIZE", cast=int)

API_V1_PREFIX = "/api/v1"
CORS_ORIGINS = config("CORS_ORIGINS")

os.makedirs(STORAGE_PATH, exist_ok=True)