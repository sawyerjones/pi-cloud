from fastapi import APIRouter, Query, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
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
    file_service: FileService = Depends(get_file_service),
    current_user: dict = Depends(get_current_user)
):
    # lists directories contents
    return await file_service.list_directory(path, current_user)

@router.post("/upload")
async def upload_file(
    path: str = Query("/", description="Destination to directory path"),
    file: UploadFile = File(..., description="File to upload"),
    file_service: FileService = Depends(get_file_service),
    current_user: dict = Depends(get_current_user)
):
    return await file_service.upload_file(file, path, current_user)

@router.post("/mkdir")
async def create_directory(
    path: str = Query(..., description="Parent directory path"),
    name: str = Query(..., description="New directory name"),
    file_service: FileService = Depends(get_file_service),
    current_user: dict = Depends(get_current_user)
):
    return await file_service.create_directory(path, name, current_user)

@router.delete("/delete")
async def delete_file(
    path: str = Query(..., description="File or directory path to delete"),
    file_service: FileService = Depends(get_file_service),
    current_user: dict = Depends(get_current_user)
):
    return await file_service.delete_file(path, current_user)

@router.get('/download')
async def download_file(
    path: str = Query(..., description="File path to download"),
    file_service: FileService = Depends(get_file_service),
    current_user: dict = Depends(get_current_user)
): 
    target_path, mime_type = await file_service.download_file(path, current_user)
    # URL decode
    filename = urllib.parse.unquote(target_path.name)

    return FileResponse(
        path=str(target_path),
        filename=filename,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attatchment; filename="{filename}"'
        }
    )