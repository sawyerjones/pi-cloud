from fastapi import HTTPException

class FileServerException(HTTPException):
    """base exception"""
    pass

class FileNotFoundError(FileServerException):
    def __init__(self, path: str):
        super().__init__(
            status_code=404,
            detail=f"File not found: {path}"
        )
class InvalidPathError(FileServerException):
    def __init__(self, path: str):
        super().__init__(
            status_code=400,
            detail=f"Invalid path: {path}"
        )

class PermissionDeniedError(FileServerException):
    def __init__(self, action: str):
        super().__init__(
            status_code=403,
            detail=f"Permission denied: {action}"
        )