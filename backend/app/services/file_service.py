import os
from pathlib import Path
from datetime import datetime
from app.config import STORAGE_PATH
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