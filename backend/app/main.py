import os
import json
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlmodel import Session, select
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .models import VideoJob, JobStatus, User, Session as SessionModel
from .dependencies import engine, get_session
from .api.v1.router import api_router

# Initialisation
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title=settings.APP_NAME,
    description="## LTX-2 ULTRA SECURE ENGINE - final quality",
    version="2.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
# Splitting origins and cleaning up whitespace
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Indispensable pour Better Auth (Cookies)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    from .models import SQLModel
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables verified/created.")

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
    async def connect(self, job_id, ws):
        await ws.accept()
        if job_id not in self.active_connections: self.active_connections[job_id] = []
        self.active_connections[job_id].append(ws)
    def disconnect(self, job_id, ws):
        if job_id in self.active_connections: self.active_connections[job_id].remove(ws)
    async def broadcast(self, job_id, data):
        if job_id in self.active_connections:
            for conn in self.active_connections[job_id]: 
                try:
                    await conn.send_text(json.dumps(data))
                except:
                    continue

manager = ConnectionManager()

@app.get("/health", tags=["Infrastructure"])
async def health():
    return {
        "status": "ok", 
        "version": "2.1.0", 
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/webhook/runpod", tags=["Infrastructure"])
async def runpod_webhook(data: dict, token: str, session: Session = Depends(get_session)):
    if token != settings.RUNPOD_WEBHOOK_TOKEN: raise HTTPException(status_code=401)
    runpod_id = data.get("id")
    job = session.exec(select(VideoJob).where(VideoJob.runpod_job_id == runpod_id)).first()
    if job:
        status_val = data.get("status")
        job.status = JobStatus.COMPLETED if status_val == "COMPLETED" else JobStatus.FAILED
        if job.status == JobStatus.COMPLETED:
            job.video_url = data.get("output", {}).get("video_url")
            job.progress = 100
        else:
            # Store failure reason from RunPod
            error_msg = data.get("error") or data.get("output", {}).get("error", "Unknown GPU error")
            job.failure_reason = str(error_msg)[:500]
            # Refund credits on failure
            user = session.get(User, job.user_id)
            if user: user.credits += job.cost; session.add(user)
        session.add(job); session.commit()
        await manager.broadcast(job.id, {
            "progress": job.progress,
            "status": job.status,
            "video_url": job.video_url,
            "failure_reason": job.failure_reason,
        })
        # Publish to Redis for other services (email notifications, etc.)
        try:
            from .core.redis_client import redis_client
            redis_client.publish(f"job:{job.id}", json.dumps({
                "status": job.status,
                "video_url": job.video_url,
                "user_id": job.user_id,
            }))
        except Exception:
            pass  # Redis publish is best-effort
    return {"status": "ok"}

@app.websocket("/ws/progress/{job_id}")
async def websocket_progress(websocket: WebSocket, job_id: str, token: str = Query(...)):
    """
    WebSocket sécurisé : vérifie la session Better Auth et la propriété du job.
    """
    try:
        with Session(engine) as session:
            # 1. Valider le token de session
            statement = select(SessionModel).where(SessionModel.token == token)
            session_record = session.exec(statement).first()
            
            if not session_record or session_record.expiresAt < datetime.now(timezone.utc).replace(tzinfo=None):
                await websocket.close(code=4001) # Policy Violation / Expired
                return
            
            user_id = session_record.userId
            
            # 2. Vérifier la propriété du job
            job = session.get(VideoJob, job_id)
            if not job or job.user_id != user_id:
                await websocket.close(code=4001)
                return
                
        await manager.connect(job_id, websocket)
        try:
            while True: await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(job_id, websocket)
    except Exception as e:
        logger.error(f"WS Auth Error: {e}")
        await websocket.close(code=4001)
