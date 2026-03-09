from fastapi import APIRouter
from .endpoints import jobs, upload, users

api_router = APIRouter()

api_router.include_router(jobs.router, prefix="/jobs", tags=["Video Generation"])
api_router.include_router(upload.router, prefix="/v1/upload", tags=["Upload"])
api_router.include_router(users.router, prefix="/users", tags=["Account"])
