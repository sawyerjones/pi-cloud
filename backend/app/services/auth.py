from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# test user store
USERS = {
    "admin": {
        "username": "admin",
        "hashed_password": pwd_context.hash("test123"),
        "permissions": ["read", "write", "delete"]
    }
}

class AuthService:
    @staticmethod
    def verifyPassword(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def authenticate_user(username: str, password: str):
        user = USERS.get(username)
        if not user or not AuthService.verifyPassword(password, user["hashed_password"]):
            return None
        return user
    
    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")