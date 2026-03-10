from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user, require_role
from ....models import VideoJob, ModerationStatus, User, Role

router = APIRouter()


@router.get("/moderation/queue")
async def get_moderation_queue(
    status: str = Query(default=ModerationStatus.FLAGGED),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get flagged/pending content for admin review."""
    if user.role not in (Role.ADMIN, Role.MANAGER):
        raise HTTPException(status_code=403, detail="Admin access required")

    statement = (
        select(VideoJob)
        .where(VideoJob.moderation_status == status)
        .order_by(VideoJob.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    jobs = session.exec(statement).all()

    count_statement = select(VideoJob).where(VideoJob.moderation_status == status)
    total = len(session.exec(count_statement).all())

    return {
        "items": [
            {
                "id": j.id,
                "prompt": j.prompt,
                "video_url": j.video_url,
                "moderation_status": j.moderation_status,
                "moderation_notes": j.moderation_notes,
                "user_id": j.user_id,
                "created_at": j.created_at.isoformat(),
            }
            for j in jobs
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/moderation/{job_id}")
async def review_job(
    job_id: str,
    action: str,  # "approve" or "reject"
    notes: str = "",
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Approve or reject flagged content."""
    if user.role not in (Role.ADMIN, Role.MANAGER):
        raise HTTPException(status_code=403, detail="Admin access required")

    job = session.get(VideoJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if action == "approve":
        job.moderation_status = ModerationStatus.CLEAN
        job.moderation_notes = f"Approved by {user.email}: {notes}"
    elif action == "reject":
        job.moderation_status = ModerationStatus.BLOCKED
        job.moderation_notes = f"Rejected by {user.email}: {notes}"
        job.is_public = False
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    session.add(job)
    session.commit()

    return {"status": "ok", "moderation_status": job.moderation_status}
