from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_V1_PREFIX, CORS_ORIGINS
from app.routers import health, auth, files
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi_utilities import repeat_every
from contextlib import asynccontextmanager
from app.services.file_service import FileService
import logging

# loggin set up
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# app with lifespan to register repeated tasks (replaces deprecated on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- startup ---
    # The @repeat_every decorator automatically registers the cleanup_demo_job
    # No need to call it manually - it will run on schedule
    yield
    # --- shutdown ---

app = FastAPI(
    title="Personal File Server",
    description="A secure file server for personal use",
    version="0.1.0",
    lifespan=lifespan,
)

# exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )



app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(files.router, prefix=API_V1_PREFIX)

@repeat_every(seconds=60*120)  # every 2 hours
def cleanup_demo_job() -> None:
    try:
        service = FileService()
        deleted = service.cleanup_demo_uploads(max_age_hours=2)
        if deleted:
            logger.info(f"Demo cleanup removed {deleted} items")
    except Exception as e:
        logger.error(f"Demo cleanup error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
