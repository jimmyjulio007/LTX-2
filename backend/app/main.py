import os
import json
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlmodel import Session, select
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .models import VideoJob, JobStatus, User
from .dependencies import engine, get_session
from .api.v1.router import api_router
from .core.security import verify_token

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
origins = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router)

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
    return {"status": "ok", "version": "2.1.0", "timestamp": datetime.utcnow().isoformat()}

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
            user = session.get(User, job.user_id)
            if user: user.credits += job.cost; session.add(user)
        session.add(job); session.commit()
        await manager.broadcast(job.id, {"progress": job.progress, "status": job.status, "video_url": job.video_url})
    return {"status": "ok"}

@app.websocket("/ws/progress/{job_id}")
async def websocket_progress(websocket: WebSocket, job_id: str, token: str = Query(...)):
    """WebSocket sécurisé : vérifie le JWT et la propriété du job."""
    try:
        user_id = verify_token(token)
        # On vérifie avec une session fraîche
        with Session(engine) as session:
            job = session.get(VideoJob, job_id)
            if not job or job.user_id != user_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
                
        await manager.connect(job_id, websocket)
        try:
            while True: await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(job_id, websocket)
    except Exception as e:
        logger.error(f"WS Auth Error: {e}")
        await websocket.close(code=4001)
