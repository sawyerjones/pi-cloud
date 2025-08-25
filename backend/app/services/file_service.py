import os
import shutil
import mimetypes
from pathlib import Path
from datetime import datetime
from fastapi import HTTPException, UploadFile
from pathvalidate import is_valid_filename
import aiofiles
from typing import Tuple

from app.config import STORAGE_PATH, MAX_FILE_SIZE
from app.models.files import FileItem, FileType, DirectoryListing
from app.utils.exceptions import FileNotFoundError, InvalidPathError

class FileService:
    def __init__(self):
        self.storage_path = Path(STORAGE_PATH)
        # make sure storage dir exists
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def _get_safe_path(self, path: str) -> str:
        # normalize paths
        clean_path = path.lstrip('/')
        full_path = self.storage_path / clean_path

        # confirm path is within storage
        try:
            full_path.resolve().relative_to(self.storage_path.resolve())
        except:
            raise InvalidPathError(path)
        
        return full_path
    
    async def list_directory(self, path: str = "/") -> DirectoryListing:
        dir_path = self._get_safe_path(path)

        if not dir_path.exists():
            raise FileNotFoundError(path)
        if not dir_path.is_dir():
            raise InvalidPathError(f"{path} is not a directory.")
        
        # collect all children
        items = []
        for item in dir_path.iterdir():
            stat = item.stat()
            file_item = FileItem(
                name=item.name,
                path=f"{path.rstrip('/')}/{item.name}",
                type=FileType.DIRECTORY if item.is_dir() else FileType.FILE,
                size=stat.st_size if item.is_file() else None,
                modified=datetime.fromtimestamp(stat.st_mtime)
            )
            items.append(file_item)
        # sort w/ directories first
        items.sort(key=lambda x: (x.type != FileType.DIRECTORY, x.name.lower()))
        
        return DirectoryListing(
            path=path,
            items=items,
            total_items=len(items)
        )

    async def upload_file(self, file: UploadFile, destination_path: str = "/"):
        try:
            if file.size and file.size > MAX_FILE_SIZE:
                # payload too large
                raise HTTPException(status_code=413, detail="File too large to upload")
            if not file.filename or not is_valid_filename(file.filename):
                raise HTTPException(status_code=400, detail="Invalid filename")
            
            # set destination
            dest_dir = self._get_safe_path(destination_path)
            if not dest_dir.exists():
                dest_dir.mkdir(parents=True, exist_ok=True)
            dest_file = dest_dir / file.filename

            # confirm unique name
            if dest_file.exists():
                base_name = dest_file.stem
                extension = dest_file.suffix # '.pdf'
                counter = 1
                while dest_file.exists():
                    dest_file = dest_dir / f"{base_name}_{counter}{extension}"
                    counter += 1

            # write file 
            async with aiofiles.open(dest_file, 'wb') as f:
                content = await file.read()
                await f.write(content)

            # get uploaded size
            file_stat = dest_file.stat()

            return {
                "message": 'File uploaded successfully',
                "filename": dest_file.name,
                "path": str(dest_file.relative_to(self.storage_path)),
                "size": file_stat.st_size
            }

        except HTTPException:
            raise
        except Exception as e:
            # internal server error
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        

    async def create_directory(self, path: str, name: str) -> dict:
        try:
            parent_dir = self._get_safe_path(path)
            new_dir = parent_dir / name
            
            if not is_valid_filename(name):
                raise HTTPException(status_code=400, detail="Invalid directory name")
            if new_dir.exists():
                raise HTTPException(status_code=409, detail="Directory already exists")
            
            new_dir.mkdir(parents=True, exist_ok=True)

            return {
                "message": "Directory successfully created",
                "path": str(new_dir.relative_to(self.storage_path))
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Create directory failed: {str(e)}")

    async def delete_file(self, path: str) -> dict:
        try :
            target_path = self._get_safe_path(path)
            if not target_path.exists():
                raise FileNotFoundError(path)
            
            if target_path.is_dir():
                shutil.rmtree(target_path)
                message = "Directory successfully deleted"
            else:
                target_path.unlink()
                message = "File deleted successfully"

            return {"message": message, "path": path}
        
        except (FileNotFoundError, InvalidPathError):
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
        
    async def download_file(self, path: str) -> Tuple[Path, str]:
        # get safe path and media (MIME) type
        try:
            target_path = self._get_safe_path(path)
            if not target_path.exists():
                raise FileNotFoundError(path)
            # TODO: handle downloading directories
            if target_path.is_dir():
                raise HTTPException(status_code=400, detail="Cannot download directories")
            
            mime_type = mimetypes.guess_type(str(target_path))[0] 

            return target_path, mime_type

        except (FileNotFoundError, InvalidPathError):
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")