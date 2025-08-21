from fastapi import APIRouter, HTTPException, status
from app.models.auth import LoginRequest, LoginResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    user = AuthService.authenticate_user(login_data.username, login_data.password)

    if not user: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = AuthService.create_access_token({"sub": user["username"]})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer"
    )