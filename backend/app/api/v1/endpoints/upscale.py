from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ....dependencies import get_session, get_current_user
from ....models import VideoJob, JobStatus, User, UpscaleRequest, UpscaleResponse
from ....config import settings

router = APIRouter()


@router.post("/{job_id}", response_model=UpscaleResponse)
async def upscale_video(
    job_id: str,
    req: UpscaleRequest,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Upscale a completed video to higher resolution or framerate."""
    job = session.get(VideoJob, job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Video not found")
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed videos can be upscaled")

    # Calculate credit cost
    cost = 0
    if req.output_quality == "4k":
        cost += settings.CREDIT_COST_4K
    if req.target_fps and req.target_fps >= 60:
        cost += settings.CREDIT_COST_60FPS

    if cost == 0:
        raise HTTPException(status_code=400, detail="No upscale options selected")

    if user.credits < cost:
        raise HTTPException(status_code=402, detail=f"Insufficient credits. Need {cost}, have {user.credits}")

    # Deduct credits
    user.credits -= cost
    session.add(user)

    # Update job with upscale info
    job.output_quality = req.output_quality
    if req.target_fps:
        job.target_fps = req.target_fps
    job.upscale_job_id = f"upscale_{job_id}"
    session.add(job)
    session.commit()

    return UpscaleResponse(
        job_id=job.id,
        credits_charged=cost,
        output_quality=req.output_quality,
        target_fps=req.target_fps,
    )


@router.get("/pricing")
async def get_upscale_pricing():
    """Return credit costs for upscale operations."""
    return {
        "4k": settings.CREDIT_COST_4K,
        "60fps": settings.CREDIT_COST_60FPS,
        "draft": settings.CREDIT_COST_DRAFT,
        "standard": settings.CREDIT_COST_STANDARD,
        "premium": settings.CREDIT_COST_PREMIUM,
    }
