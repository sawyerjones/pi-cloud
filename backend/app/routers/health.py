from fastapi import APIRouter
from pathlib import Path
from app.config import STORAGE_PATH

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "storage_exists": Path(STORAGE_PATH).exists(),
        "message": "Server is running"
    }

@router.get("/")
async def root():
    return {
        "message": "File Server API",
        "version": "0.1.0",
        "docs": "/docs"
    }