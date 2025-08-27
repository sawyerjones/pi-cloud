from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY
import logging
import os

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

logger = logging.getLogger(__name__)

#TODO actually use DB for users

class AuthService:
    def __init__(self):
        admin_password = os.getenv('ADMIN_PASSWORD', 'setupdb')
        self.USERS = {
            "admin": {
                "username": "admin",
                "hashed_password": pwd_context.hash(admin_password),
                "is_active": True,
                "permissions": ["read", "write", "delete"],
            }
        }
    @staticmethod
    def verifyPassword(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def authenticate_user(self, username: str, password: str):
        user = self.USERS.get(username)
        if not user or not AuthService.verifyPassword(password, user["hashed_password"]):
            logger.warning(f"Login attempt for non-existant user: {username}")
            return None
        
        logger.info(f"Successful login for user: {username}")
        return user
    
    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    
    @staticmethod
    def verify_token(token: str) -> dict:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            username: str = payload.get("sub")

            if username is None:
                raise credentials_exception

            # check if user still exists
            user = USERS.get(username)
            if user is None:
                raise credentials_exception
            return {
                "username": username,
                "permissions": user.get("permissions", [])
            }
        except JWTError: 
            raise credentials_exception

