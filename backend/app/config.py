from decouple import config
import os

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", cast=bool)

STORAGE_PATH = config("STORAGE_PATH")
MAX_FILE_SIZE = config("MAX_FILE_SIZE")

API_V1_PREFIX = "/api/v1"
CORS_ORIGINS = config("CORS_ORIGINS")

os.makedirs(STORAGE_PATH, exist_ok=True)