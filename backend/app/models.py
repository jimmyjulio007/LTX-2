from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
import uuid
from enum import Enum

# --- ENUMS ---

class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class JobType(str, Enum):
    TEXT_TO_VIDEO = "text-to-video"
    IMAGE_TO_VIDEO = "image-to-video"
    AUDIO_TO_VIDEO = "audio-to-video"
    RETAKE = "retake"
    EXTEND = "extend"

# --- CORE MODELS ---

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(index=True, unique=True)
    credits: int = Field(default=10) # 10 crédits offerts à l'inscription
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    jobs: List["VideoJob"] = Relationship(back_populates="user")

class VideoJob(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    job_type: str = Field(default=JobType.TEXT_TO_VIDEO)
    prompt: str
    negative_prompt: Optional[str] = "low quality, blurry, distorted"
    
    # Inputs (URIS - Can be HTTPS URL, Data URI or ltx:// URI)
    image_uri: Optional[str] = None
    audio_uri: Optional[str] = None
    video_uri: Optional[str] = None
    
    # Settings
    width: int = Field(default=1280)
    height: int = Field(default=768)
    num_frames: int = Field(default=121)
    frame_rate: float = Field(default=24.0)
    
    # Retake specific
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    
    # Status & Results
    status: str = Field(default=JobStatus.PENDING)
    progress: int = Field(default=0)
    video_url: Optional[str] = None
    runpod_job_id: Optional[str] = None
    cost: int = Field(default=1) # Coût du job en crédits
    
    user_id: str = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="jobs")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- SCHEMAS ---

class UserResponse(SQLModel):
    id: str
    email: str
    credits: int

class JobCreateBase(SQLModel):
    prompt: str
    negative_prompt: Optional[str] = "low quality, blurry, distorted"
    width: Optional[int] = 1280
    height: Optional[int] = 768
    num_frames: Optional[int] = 121
    frame_rate: Optional[float] = 24.0

class TextToVideoCreate(JobCreateBase):
    pass

class ImageToVideoCreate(JobCreateBase):
    image_uri: str

class AudioToVideoCreate(JobCreateBase):
    audio_uri: str

class RetakeCreate(JobCreateBase):
    video_uri: str
    start_time: float
    end_time: float

class ExtendCreate(JobCreateBase):
    video_uri: str
    additional_frames: int = 48

class JobResponse(SQLModel):
    id: str
    job_type: str
    status: str
    progress: int
    video_url: Optional[str] = None
    runpod_job_id: Optional[str] = None
    user_id: str

class UploadResponse(SQLModel):
    storage_uri: str
    filename: str

class ErrorDetail(SQLModel):
    type: str
    message: str

class ErrorResponse(SQLModel):
    type: str = "error"
    error: ErrorDetail
