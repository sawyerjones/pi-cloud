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
    
    # fallback: return None if no secret found
    # This will cause an error but allows the app to start for debugging
    return None

SECRET_KEY = get_jwt_secret()

# Validate SECRET_KEY is set
if SECRET_KEY is None:
    raise ValueError("JWT_SECRET must be set either as a Docker secret or environment variable")
DEBUG = config("DEBUG", cast=bool)

STORAGE_PATH = config("STORAGE_PATH")
MAX_FILE_SIZE = config("MAX_FILE_SIZE", cast=int)

API_V1_PREFIX = "/api/v1"
CORS_ORIGINS = config("CORS_ORIGINS")

os.makedirs(STORAGE_PATH, exist_ok=True)