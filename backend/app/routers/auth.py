from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import LoginRequest, LoginResponse, UserInfo
from app.services.auth import auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# dependency to get current authenticated user from JWT token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return auth_service.verify_token(credentials.credentials)

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    user = auth_service.authenticate_user(login_data.username, login_data.password)
    if not user: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = auth_service.create_access_token({"sub": user["username"]})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserInfo(
        username=current_user["username"],
        permissions=current_user["permissions"]
    )

# verifies if current token is valid
@router.post("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {
        "valid": True,
        "username": current_user["username"],
        "permissions": current_user["permissions"]
    }