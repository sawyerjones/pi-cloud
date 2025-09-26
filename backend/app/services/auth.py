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

class AuthService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuthService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):

        if self._initialized:
            return
        #TODO actually use DB for users
        admin_password = os.getenv('ADMIN_PASSWORD', 'setupdb')
        self.USERS = {
            "admin": {
                "username": "admin",
                "hashed_password": pwd_context.hash(admin_password),
                "is_active": True,
                "permissions": ["read", "write", "delete"],
            }
        }
        # demo user: no password required via special endpoint
        self.DEMO_USERNAME = "demo"
        self.USERS[self.DEMO_USERNAME] = {
            "username": self.DEMO_USERNAME,
            "hashed_password": pwd_context.hash(os.getenv('DEMO_PLACEHOLDER_PASSWORD', 'demo')), 
            "is_active": True,
            "permissions": ["read", "write", "delete"],
        }
        self._initialized = True

    def verifyPassword(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    

    def authenticate_user(self, username: str, password: str):
        user = self.USERS.get(username)

        if not user:
            logger.warning(f"Login attempt for non-existant user: {username}")
            return None
        
        password_valid = self.verifyPassword(password, user["hashed_password"])
    
        if not password_valid:
            return None
        
        return user

    def get_or_create_demo_user(self):
        # ensure demo user exists and return its record
        user = self.USERS.get(self.DEMO_USERNAME)
        if not user:
            user = {
                "username": self.DEMO_USERNAME,
                "hashed_password": pwd_context.hash(os.getenv('DEMO_PLACEHOLDER_PASSWORD', 'demo')),
                "is_active": True,
                "permissions": ["read", "write", "delete"],
            }
            self.USERS[self.DEMO_USERNAME] = user
        return user
    
    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

    def verify_token(self, token: str) -> dict:
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
            user = self.USERS.get(username)
            if user is None:
                raise credentials_exception
            return {
                "username": username,
                "permissions": user.get("permissions", [])
            }
        except JWTError: 
            raise credentials_exception

auth_service = AuthService()