from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ....dependencies import get_session, get_current_user
from ....models import VideoJob, JobStatus, User, ExportRequest, ExportResponse

router = APIRouter()


@router.post("/{job_id}", response_model=ExportResponse)
async def export_video(
    job_id: str,
    req: ExportRequest,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Export a completed video in a specific format."""
    job = session.get(VideoJob, job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Video not found")
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed videos can be exported")
    if not job.video_url:
        raise HTTPException(status_code=400, detail="No video file available")

    # For now, return the existing URL with format metadata
    # In production, this would trigger a conversion job
    return ExportResponse(
        job_id=job.id,
        format=req.format,
        quality=req.quality,
        download_url=job.video_url,
    )
