from fastapi import APIRouter, Depends, Request, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user, check_credits
from ....models import (
    VideoJob, JobType, JobResponse, TextToVideoCreate,
    ImageToVideoCreate, AudioToVideoCreate, RetakeCreate, ExtendCreate, User
)
from ....core.tasks import process_gpu_job
from ....core.moderation import moderate_prompt, ModerationFlag
import re

router = APIRouter()

def sanitize_input(text: str) -> str:
    if not text: return text
    clean = re.sub(r'<.*?>', '', text)
    return clean.strip()

async def create_job(
    job_in: any,
    job_type: JobType,
    user: User,
    session: Session,
):
    """Logique commune de création de job. Dispatches to Celery worker."""
    if hasattr(job_in, 'prompt'):
        job_in.prompt = sanitize_input(job_in.prompt)

        # Moderation check before creating job
        flag, reason = moderate_prompt(job_in.prompt)
        if flag == ModerationFlag.BLOCKED:
            raise HTTPException(status_code=400, detail=f"Content blocked: {reason}")

    job = VideoJob(**job_in.dict(), job_type=job_type, user_id=user.id)

    # Set moderation status based on check
    if hasattr(job_in, 'prompt'):
        if flag == ModerationFlag.FLAGGED:
            job.moderation_status = "FLAGGED"
            job.moderation_notes = reason
        elif flag == ModerationFlag.CLEAN:
            job.moderation_status = "CLEAN"
    session.add(job)
    session.commit()
    session.refresh(job)

    # Dispatch to Celery worker for persistent, retryable GPU processing
    task = process_gpu_job.delay(job.id)
    job.celery_task_id = task.id
    session.add(job)
    session.commit()

    return job

@router.post("/text-to-video", response_model=JobResponse)
async def text_to_video(job_in: TextToVideoCreate, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.TEXT_TO_VIDEO, user, session)

@router.post("/image-to-video", response_model=JobResponse)
async def image_to_video(job_in: ImageToVideoCreate, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.IMAGE_TO_VIDEO, user, session)

@router.post("/audio-to-video", response_model=JobResponse)
async def audio_to_video(job_in: AudioToVideoCreate, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.AUDIO_TO_VIDEO, user, session)

@router.post("/retake", response_model=JobResponse)
async def retake(job_in: RetakeCreate, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.RETAKE, user, session)

@router.post("/extend", response_model=JobResponse)
async def extend(job_in: ExtendCreate, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.EXTEND, user, session)
