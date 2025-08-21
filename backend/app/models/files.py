from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class FileType(str, Enum): 
    FILE = "file"
    DIRECTORY="directory"

class FileItem(BaseModel):
    name: str
    path: str
    type: FileType
    size: Optional[int] = None
    modified: datetime

class DirectoryListing(BaseModel): 
    path: str
    items: List[FileItem]
    total_items: int
    