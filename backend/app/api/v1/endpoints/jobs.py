from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user, check_credits
from ....models import (
    VideoJob, JobType, JobResponse, TextToVideoCreate, 
    ImageToVideoCreate, AudioToVideoCreate, RetakeCreate, ExtendCreate, User
)
from ....core.runpod import trigger_runpod_job
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
    background_tasks: BackgroundTasks
):
    """Logique commune de création de job."""
    if hasattr(job_in, 'prompt'):
        job_in.prompt = sanitize_input(job_in.prompt)
        
    job = VideoJob(**job_in.dict(), job_type=job_type, user_id=user.id)
    session.add(job)
    session.commit()
    session.refresh(job)
    
    # On lance la communication GPU en arrière-plan pour ne pas bloquer l'utilisateur
    background_tasks.add_task(trigger_runpod_job, job, session, user)
    return job

@router.post("/text-to-video", response_model=JobResponse)
async def text_to_video(job_in: TextToVideoCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.TEXT_TO_VIDEO, user, session, background_tasks)

@router.post("/image-to-video", response_model=JobResponse)
async def image_to_video(job_in: ImageToVideoCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.IMAGE_TO_VIDEO, user, session, background_tasks)

@router.post("/audio-to-video", response_model=JobResponse)
async def audio_to_video(job_in: AudioToVideoCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.AUDIO_TO_VIDEO, user, session, background_tasks)

@router.post("/retake", response_model=JobResponse)
async def retake(job_in: RetakeCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.RETAKE, user, session, background_tasks)

@router.post("/extend", response_model=JobResponse)
async def extend(job_in: ExtendCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user: User = Depends(check_credits)):
    return await create_job(job_in, JobType.EXTEND, user, session, background_tasks)
