from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_V1_PREFIX, CORS_ORIGINS
from app.routers import health

app = FastAPI(
    title="Personal File Server",
    description="A secure file server for personal use",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
