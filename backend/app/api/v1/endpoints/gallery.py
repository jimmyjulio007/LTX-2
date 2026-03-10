import secrets
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional
from ....dependencies import get_session, get_current_user
from ....models import VideoJob, VideoLike, User, VideoVisibility, ModerationStatus

router = APIRouter()


@router.get("/public")
async def get_public_videos(
    sort: str = Query(default="recent", regex="^(recent|popular|likes)$"),
    category: Optional[str] = None,
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0),
    session: Session = Depends(get_session),
):
    """Paginated public video feed for the gallery."""
    statement = (
        select(VideoJob)
        .where(VideoJob.visibility == VideoVisibility.PUBLIC)
        .where(VideoJob.moderation_status == ModerationStatus.CLEAN)
        .where(VideoJob.video_url.is_not(None))
    )

    if sort == "popular":
        statement = statement.order_by(VideoJob.views_count.desc())
    elif sort == "likes":
        statement = statement.order_by(VideoJob.likes_count.desc())
    else:
        statement = statement.order_by(VideoJob.created_at.desc())

    statement = statement.offset(offset).limit(limit)
    jobs = session.exec(statement).all()

    return {
        "items": [
            {
                "id": j.id,
                "share_id": j.share_id,
                "title": j.title,
                "prompt": j.prompt[:200],
                "video_url": j.video_url,
                "thumbnail_url": j.thumbnail_url,
                "likes_count": j.likes_count,
                "views_count": j.views_count,
                "user_id": j.user_id,
                "created_at": j.created_at.isoformat(),
            }
            for j in jobs
        ],
        "limit": limit,
        "offset": offset,
    }


@router.get("/public/{share_id}")
async def get_public_video(
    share_id: str,
    session: Session = Depends(get_session),
):
    """Get a single video by share_id for the share page."""
    job = session.exec(
        select(VideoJob).where(VideoJob.share_id == share_id)
    ).first()

    if not job or job.visibility == VideoVisibility.PRIVATE:
        raise HTTPException(status_code=404, detail="Video not found")

    # Increment view count
    job.views_count += 1
    session.add(job)
    session.commit()

    # Get creator info
    user = session.get(User, job.user_id)

    return {
        "id": job.id,
        "share_id": job.share_id,
        "title": job.title,
        "prompt": job.prompt,
        "video_url": job.video_url,
        "thumbnail_url": job.thumbnail_url,
        "likes_count": job.likes_count,
        "views_count": job.views_count,
        "job_type": job.job_type,
        "width": job.width,
        "height": job.height,
        "created_at": job.created_at.isoformat(),
        "creator": {
            "name": user.name if user else "Unknown",
            "image": user.image if user else None,
        },
    }


@router.post("/{job_id}/like")
async def toggle_like(
    job_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Toggle like on a video."""
    job = session.get(VideoJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Video not found")

    # Check if already liked
    existing = session.exec(
        select(VideoLike)
        .where(VideoLike.user_id == user.id)
        .where(VideoLike.job_id == job_id)
    ).first()

    if existing:
        session.delete(existing)
        job.likes_count = max(0, job.likes_count - 1)
        liked = False
    else:
        like = VideoLike(user_id=user.id, job_id=job_id)
        session.add(like)
        job.likes_count += 1
        liked = True

    session.add(job)
    session.commit()

    return {"liked": liked, "likes_count": job.likes_count}


@router.patch("/{job_id}/visibility")
async def change_visibility(
    job_id: str,
    visibility: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Change video visibility (owner only)."""
    job = session.get(VideoJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Video not found")
    if job.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if visibility not in [v.value for v in VideoVisibility]:
        raise HTTPException(status_code=400, detail="Invalid visibility")

    job.visibility = visibility

    # Generate share_id if making public/unlisted for the first time
    if visibility in (VideoVisibility.PUBLIC, VideoVisibility.UNLISTED) and not job.share_id:
        job.share_id = secrets.token_urlsafe(8)

    session.add(job)
    session.commit()

    return {"visibility": job.visibility, "share_id": job.share_id}


@router.post("/{job_id}/remix")
async def remix_video(
    job_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get the prompt from a public video to remix it."""
    job = session.get(VideoJob, job_id)
    if not job or job.visibility == VideoVisibility.PRIVATE:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "prompt": job.prompt,
        "negative_prompt": job.negative_prompt,
        "width": job.width,
        "height": job.height,
        "num_frames": job.num_frames,
        "frame_rate": job.frame_rate,
    }
