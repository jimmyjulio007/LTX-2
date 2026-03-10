import asyncio
import logging
from celery import shared_task
from sqlmodel import Session, select
from ..dependencies import engine
from ..models import VideoJob, JobStatus, User
from ..config import settings

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async function from synchronous Celery task context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


@shared_task(
    bind=True,
    max_retries=settings.GPU_MAX_RETRIES,
    default_retry_delay=settings.GPU_RETRY_BACKOFF,
    acks_late=True,
)
def process_gpu_job(self, job_id: str):
    """
    Process a GPU video generation job with automatic retry and exponential backoff.
    On permanent failure (max retries exceeded), refunds credits.
    """
    from ..core.runpod import trigger_runpod_job

    with Session(engine) as session:
        job = session.get(VideoJob, job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return {"status": "error", "reason": "job_not_found"}

        user = session.get(User, job.user_id)
        if not user:
            logger.error(f"User {job.user_id} not found for job {job_id}")
            return {"status": "error", "reason": "user_not_found"}

        try:
            _run_async(trigger_runpod_job(job, session, user))
            return {"status": "dispatched", "job_id": job_id}

        except Exception as exc:
            job.retry_count = (job.retry_count or 0) + 1
            session.add(job)
            session.commit()

            if self.request.retries < self.max_retries:
                backoff = settings.GPU_RETRY_BACKOFF * (2 ** self.request.retries)
                logger.warning(
                    f"Job {job_id} failed (attempt {self.request.retries + 1}/"
                    f"{self.max_retries}), retrying in {backoff}s: {exc}"
                )
                raise self.retry(exc=exc, countdown=backoff)
            else:
                # Permanent failure — refund credits
                logger.error(f"Job {job_id} permanently failed after {self.max_retries} retries: {exc}")
                job.status = JobStatus.FAILED
                job.failure_reason = str(exc)[:500]
                user.credits += job.cost
                session.add(job)
                session.add(user)
                session.commit()
                return {"status": "failed", "job_id": job_id, "reason": str(exc)[:200]}
