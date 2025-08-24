from fastapi import APIRouter, Query, Depends, UploadFile, File, HTTPException
from typing import List, Optional
import urllib.parse
from app.models.files import DirectoryListing, FileItem
from app.services.file_service import FileService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/files", tags=["files"])

def get_file_service():
    return FileService()

@router.get("/list", response_model=DirectoryListing)
async def list_directory(
    path: str = Query("/", description="Directory path to list"),
    file_service: FileService = Depends(get_file_service)
):
    # lists directories contents
    return await file_service.list_directory(path)

@router.post("/upload")
async def upload_file(
    path: str = Query("/", description="Destination to directory path"),
    file: UploadFile = File(..., description="File to upload"),
    file_service: FileService = Depends(get_file_service),
):
    return await file_service.upload_file(file, path)

@router.post("/mkdir")
async def create_directory(
    path: str = Query(..., description="Parent directory path"),
    name: str = Query(..., description="New directory name"),
    file_service: FileService = Depends(get_file_service)
):
    return await file_service.create_directory(path, name)