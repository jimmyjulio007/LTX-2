from fastapi import APIRouter
from .endpoints import (
    jobs, upload, users, admin, ads, prompts, social, gallery, folders,
    referrals, notifications, upscale, marketplace, projects, scripts,
    developer, lora, avatars, workspaces, export,
)

api_router = APIRouter()

api_router.include_router(jobs.router, prefix="/jobs", tags=["Video Generation"])
api_router.include_router(upload.router, prefix="/v1/upload", tags=["Upload"])
api_router.include_router(users.router, prefix="/users", tags=["Account"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(ads.router, prefix="/ads", tags=["Ad Campaigns"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["Prompt Intelligence"])
api_router.include_router(social.router, prefix="/social", tags=["Social Media Integration"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["Gallery"])
api_router.include_router(folders.router, prefix="/folders", tags=["Folders"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(upscale.router, prefix="/upscale", tags=["Upscaling"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects & Timeline"])
api_router.include_router(scripts.router, prefix="/scripts", tags=["Script-to-Film"])
api_router.include_router(developer.router, prefix="/developer", tags=["Developer Platform"])
api_router.include_router(lora.router, prefix="/lora", tags=["LoRA Training"])
api_router.include_router(avatars.router, prefix="/avatars", tags=["Avatars & Scheduling"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
