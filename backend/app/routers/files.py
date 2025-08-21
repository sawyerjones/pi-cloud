from fastapi import APIRouter, Query, Depends
from app.models.files import DirectoryListing
from app.services.file_service import FileService

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