import os
import httpx
import logging
from sqlmodel import Session
from ..models import VideoJob, JobStatus, User
from ..config import settings

logger = logging.getLogger(__name__)

async def trigger_runpod_job(job: VideoJob, session: Session, user: User):
    """
    Orchestre l'appel à RunPod et gère la déduction/boursement des crédits.
    """
    # Déduction préventive
    user.credits -= job.cost
    session.add(user)
    
    headers = {
        "Authorization": f"Bearer {settings.RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Select RunPod endpoint based on model tier
    endpoint_id = settings.RUNPOD_ENDPOINT_ID
    if job.model_tier == "draft" and settings.RUNPOD_ENDPOINT_DRAFT:
        endpoint_id = settings.RUNPOD_ENDPOINT_DRAFT
    elif job.model_tier == "premium" and settings.RUNPOD_ENDPOINT_PREMIUM:
        endpoint_id = settings.RUNPOD_ENDPOINT_PREMIUM

    # Payload LTX standard
    exclude_fields = {'created_at', 'updated_at', 'runpod_job_id', 'user', 'campaign'}
    input_data = {
        **job.dict(exclude=exclude_fields),
        "webhook_url": f"{os.environ.get('BASE_URL', 'http://localhost:8000')}/webhook/runpod?token={settings.RUNPOD_WEBHOOK_TOKEN}"
    }

    # Include camera motion and LoRA if set
    if job.camera_motion:
        input_data["camera_motion"] = job.camera_motion
    if job.motion_paths:
        input_data["motion_paths"] = job.motion_paths
    if job.lora_model_id:
        input_data["lora_model_id"] = job.lora_model_id

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"https://api.runpod.ai/v2/{endpoint_id}/run",
                headers=headers,
                json={"input": input_data},
                timeout=20
            )
            
            if resp.status_code == 200:
                data = resp.json()
                job.runpod_job_id = data.get("id")
                job.status = JobStatus.PROCESSING
                logger.info(f"Job RunPod lancé: {job.runpod_job_id}")
            else:
                logger.error(f"Erreur RunPod API ({resp.status_code}): {resp.text}")
                job.status = JobStatus.FAILED
                user.credits += job.cost # Remboursement
                
            session.add(job)
            session.commit()
            
        except Exception as e:
            logger.error(f"Échec fatal lors du trigger RunPod: {e}")
            job.status = JobStatus.FAILED
            user.credits += job.cost # Remboursement
            session.add(job)
            session.commit()
            raise # On laisse l'exception remonter si nécessaire
