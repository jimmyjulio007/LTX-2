from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
import uuid
from enum import Enum

# --- ENUMS ---

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"

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

class ModerationStatus(str, Enum):
    CLEAN = "CLEAN"
    FLAGGED = "FLAGGED"
    BLOCKED = "BLOCKED"
    PENDING_REVIEW = "PENDING_REVIEW"

class VideoVisibility(str, Enum):
    PRIVATE = "PRIVATE"
    PUBLIC = "PUBLIC"
    UNLISTED = "UNLISTED"

# --- CORE MODELS (Better Auth Sync) ---

class User(SQLModel, table=True):
    __tablename__ = "user"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    emailVerified: bool = Field(default=False)
    image: Optional[str] = None
    role: Role = Field(default=Role.USER)
    
    # Application specific
    credits: int = Field(default=10)
    referral_code: Optional[str] = Field(default=None, unique=True, index=True)
    referred_by: Optional[str] = None
    
    banned: Optional[bool] = Field(default=False)
    banReason: Optional[str] = None
    banExpires: Optional[datetime] = None
    
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)
    
    jobs: List["VideoJob"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")
    social_accounts: List["SocialAccount"] = Relationship(back_populates="user")

class Session(SQLModel, table=True):
    __tablename__ = "session"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    token: str = Field(unique=True, index=True)
    expiresAt: datetime
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    userId: str = Field(foreign_key="user.id")
    impersonatedBy: Optional[str] = None
    
    user: User = Relationship(back_populates="sessions")

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

    # Celery & Retry
    retry_count: int = Field(default=0)
    celery_task_id: Optional[str] = None
    failure_reason: Optional[str] = None

    # Moderation
    moderation_status: str = Field(default=ModerationStatus.CLEAN)
    moderation_notes: Optional[str] = None
    is_public: bool = Field(default=False)

    # Prompt Enhancement
    original_prompt: Optional[str] = None
    enhanced: bool = Field(default=False)

    # Gallery & Sharing
    visibility: str = Field(default=VideoVisibility.PRIVATE)
    share_id: Optional[str] = None
    title: Optional[str] = None
    likes_count: int = Field(default=0)
    views_count: int = Field(default=0)
    thumbnail_url: Optional[str] = None
    folder_id: Optional[str] = Field(default=None, foreign_key="folder.id")

    # Quality & Model Tier (Phase 1)
    model_tier: str = Field(default="standard")  # draft, standard, premium
    output_quality: str = Field(default="1080p")  # 720p, 1080p, 4k
    target_fps: Optional[int] = None
    upscale_job_id: Optional[str] = None

    # Camera & Motion (Phase 2)
    camera_motion: Optional[str] = None  # JSON: {pan, tilt, zoom, roll, dolly}
    motion_paths: Optional[str] = None   # JSON: [{objectId, points}]

    # LoRA (Phase 4)
    lora_model_id: Optional[str] = Field(default=None, foreign_key="loramodel.id")

    # Workspace (Phase 5)
    workspace_id: Optional[str] = Field(default=None, foreign_key="workspace.id")

    # Watermark (Phase 6)
    watermark_enabled: bool = Field(default=False)
    watermark_text: Optional[str] = None
    c2pa_enabled: bool = Field(default=False)

    user_id: str = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="jobs")
    
    campaign_id: Optional[str] = Field(default=None, foreign_key="adcampaign.id")
    campaign: Optional["AdCampaign"] = Relationship(back_populates="jobs")
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AdCampaign(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    product_url: Optional[str] = None
    product_description: str
    target_platform: str = Field(default="tiktok")
    product_images: Optional[str] = None  # JSON list of image URLs
    budget: Optional[float] = None
    best_variation_id: Optional[str] = None
    total_variations: int = Field(default=3)

    status: str = Field(default="PENDING")  # PENDING, GENERATING, COMPLETED

    user_id: str = Field(foreign_key="user.id")

    jobs: List[VideoJob] = Relationship(back_populates="campaign")

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class VideoLike(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    job_id: str = Field(foreign_key="videojob.id")
    created_at: datetime = Field(default_factory=datetime.now)

class Folder(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    user_id: str = Field(foreign_key="user.id")
    parent_id: Optional[str] = Field(default=None)
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class PromptTemplate(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    name_fr: str = Field(default="")
    category: str  # cinematic, anime, macro, film, abstract, nature
    prompt_text: str
    thumbnail_url: Optional[str] = None
    sort_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)

class SocialAccount(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    provider: str  # tiktok, instagram, etc.
    provider_user_id: str
    username: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    
    user_id: str = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="social_accounts")
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class SocialPost(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    job_id: str = Field(foreign_key="videojob.id")
    social_account_id: str = Field(foreign_key="socialaccount.id")
    
    status: str = Field(default="PENDING") # PENDING, PUBLISHED, FAILED
    platform_post_id: Optional[str] = None
    error_message: Optional[str] = None
    
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Referral(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    referrer_id: str = Field(foreign_key="user.id")
    referee_id: Optional[str] = Field(default=None, foreign_key="user.id")
    referral_code: str = Field(unique=True, index=True)
    status: str = Field(default="PENDING")  # PENDING, COMPLETED, EXPIRED
    credits_awarded: int = Field(default=5)
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

class NotificationPreference(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", unique=True)
    email_on_completion: bool = Field(default=True)
    email_on_failure: bool = Field(default=True)
    email_marketing: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

# --- Phase 1: Ad Performance ---

class AdPerformance(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    campaign_id: str = Field(foreign_key="adcampaign.id")
    job_id: str = Field(foreign_key="videojob.id")
    platform: str = Field(default="tiktok")
    impressions: int = Field(default=0)
    clicks: int = Field(default=0)
    ctr: float = Field(default=0.0)
    conversions: int = Field(default=0)
    spend: float = Field(default=0.0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

# --- Phase 1: Marketplace ---

class MarketplaceTemplate(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    creator_id: str = Field(foreign_key="user.id")
    name: str
    name_fr: str = Field(default="")
    description: str = Field(default="")
    description_fr: str = Field(default="")
    prompt_text: str
    negative_prompt: Optional[str] = None
    category: str = Field(default="cinematic")
    thumbnail_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    price_credits: int = Field(default=1)
    total_sales: int = Field(default=0)
    is_approved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class TemplatePurchase(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    buyer_id: str = Field(foreign_key="user.id")
    template_id: str = Field(foreign_key="marketplacetemplate.id")
    credits_paid: int
    creator_royalty: int
    created_at: datetime = Field(default_factory=datetime.now)

# --- Phase 2: Projects & Timeline ---

class Project(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    user_id: str = Field(foreign_key="user.id")
    workspace_id: Optional[str] = Field(default=None, foreign_key="workspace.id")
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ProjectClip(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(foreign_key="project.id")
    job_id: str = Field(foreign_key="videojob.id")
    position: int = Field(default=0)
    start_trim: float = Field(default=0.0)
    end_trim: float = Field(default=0.0)
    transition_type: str = Field(default="cut")  # cut, fade, dissolve, wipe
    transition_duration: float = Field(default=0.5)
    created_at: datetime = Field(default_factory=datetime.now)

class ProjectRender(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(foreign_key="project.id")
    status: str = Field(default=JobStatus.PENDING)
    video_url: Optional[str] = None
    runpod_job_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# --- Phase 3: Developer API Keys ---

class ApiKey(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    key_hash: str = Field(index=True, unique=True)
    key_prefix: str  # "ltx_" + first 8 chars
    name: str
    permissions: str = Field(default="all")
    rate_limit: int = Field(default=100)
    total_requests: int = Field(default=0)
    is_active: bool = Field(default=True)
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

# --- Phase 4: LoRA Training ---

class LoraModel(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    name: str
    status: str = Field(default="PENDING")  # PENDING, TRAINING, READY, FAILED
    training_images_count: int = Field(default=0)
    training_job_id: Optional[str] = None
    model_url: Optional[str] = None
    trigger_word: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class LoraTrainingImage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    lora_model_id: str = Field(foreign_key="loramodel.id")
    image_url: str
    created_at: datetime = Field(default_factory=datetime.now)

# --- Phase 4: Avatars & Scheduling ---

class Avatar(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    name: str
    lora_model_id: Optional[str] = Field(default=None, foreign_key="loramodel.id")
    style_prompt: str = Field(default="")
    profile_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ScheduledPost(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    avatar_id: str = Field(foreign_key="avatar.id")
    user_id: str = Field(foreign_key="user.id")
    prompt: str
    platform: str = Field(default="tiktok")
    scheduled_at: datetime
    status: str = Field(default="SCHEDULED")  # SCHEDULED, GENERATING, PUBLISHED, FAILED
    job_id: Optional[str] = Field(default=None, foreign_key="videojob.id")
    social_account_id: Optional[str] = Field(default=None, foreign_key="socialaccount.id")
    created_at: datetime = Field(default_factory=datetime.now)

# --- Phase 5: Workspaces ---

class Workspace(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    owner_id: str = Field(foreign_key="user.id")
    plan: str = Field(default="free")  # free, pro, enterprise
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class WorkspaceMember(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    workspace_id: str = Field(foreign_key="workspace.id")
    user_id: str = Field(foreign_key="user.id")
    role: str = Field(default="member")  # owner, admin, member, viewer
    invited_by: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.now)

# --- SCHEMAS ---

class UserResponse(SQLModel):
    id: str
    email: str
    credits: int
    role: Role

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

class AdCampaignCreate(SQLModel):
    product_description: str
    product_url: Optional[str] = None
    target_platform: Optional[str] = "tiktok"
    num_variations: Optional[int] = 3

class AdCampaignResponse(SQLModel):
    id: str
    name: str
    status: str
    jobs: List["JobResponse"]
    created_at: datetime

class AdPerformanceResponse(SQLModel):
    id: str
    campaign_id: str
    job_id: str
    platform: str
    impressions: int
    clicks: int
    ctr: float
    conversions: int
    spend: float
    is_active: bool

class JobResponse(SQLModel):
    id: str
    job_type: str
    status: str
    progress: int
    video_url: Optional[str] = None
    runpod_job_id: Optional[str] = None
    user_id: str
    retry_count: int = 0
    celery_task_id: Optional[str] = None
    failure_reason: Optional[str] = None
    model_tier: str = "standard"
    output_quality: str = "1080p"

# --- Marketplace Schemas ---

class MarketplaceTemplateCreate(SQLModel):
    name: str
    name_fr: str = ""
    description: str = ""
    description_fr: str = ""
    prompt_text: str
    negative_prompt: Optional[str] = None
    category: str = "cinematic"
    price_credits: int = 1

class MarketplaceTemplateResponse(SQLModel):
    id: str
    creator_id: str
    name: str
    name_fr: str
    description: str
    description_fr: str
    prompt_text: str
    negative_prompt: Optional[str]
    category: str
    thumbnail_url: Optional[str]
    preview_video_url: Optional[str]
    price_credits: int
    total_sales: int
    is_approved: bool
    created_at: datetime

# --- Upscale Schemas ---

class UpscaleRequest(SQLModel):
    output_quality: str = "4k"  # 4k, 1080p
    target_fps: Optional[int] = None  # 60 for interpolation

class UpscaleResponse(SQLModel):
    job_id: str
    credits_charged: int
    output_quality: str
    target_fps: Optional[int]

# --- Project Schemas ---

class ProjectCreate(SQLModel):
    name: str
    description: Optional[str] = None

class ProjectClipCreate(SQLModel):
    job_id: str
    position: int = 0
    transition_type: str = "cut"
    transition_duration: float = 0.5

class ProjectResponse(SQLModel):
    id: str
    name: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    created_at: datetime
    updated_at: datetime

# --- Developer Schemas ---

class ApiKeyCreate(SQLModel):
    name: str
    permissions: str = "all"
    rate_limit: int = 100

class ApiKeyResponse(SQLModel):
    id: str
    key_prefix: str
    name: str
    permissions: str
    rate_limit: int
    total_requests: int
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime

class ApiKeyFullResponse(ApiKeyResponse):
    """Returned only on creation, includes the full key."""
    full_key: str

# --- LoRA Schemas ---

class LoraModelCreate(SQLModel):
    name: str
    trigger_word: str = ""

class LoraModelResponse(SQLModel):
    id: str
    name: str
    status: str
    training_images_count: int
    trigger_word: str
    model_url: Optional[str]
    created_at: datetime
    updated_at: datetime

# --- Avatar Schemas ---

class AvatarCreate(SQLModel):
    name: str
    lora_model_id: Optional[str] = None
    style_prompt: str = ""

class AvatarResponse(SQLModel):
    id: str
    name: str
    lora_model_id: Optional[str]
    style_prompt: str
    profile_image_url: Optional[str]
    created_at: datetime

class ScheduledPostCreate(SQLModel):
    prompt: str
    platform: str = "tiktok"
    scheduled_at: datetime

class ScheduledPostResponse(SQLModel):
    id: str
    avatar_id: str
    prompt: str
    platform: str
    scheduled_at: datetime
    status: str
    job_id: Optional[str]
    created_at: datetime

# --- Workspace Schemas ---

class WorkspaceCreate(SQLModel):
    name: str

class WorkspaceResponse(SQLModel):
    id: str
    name: str
    owner_id: str
    plan: str
    created_at: datetime

class WorkspaceMemberResponse(SQLModel):
    id: str
    user_id: str
    role: str
    joined_at: datetime

class WorkspaceInvite(SQLModel):
    email: str
    role: str = "member"

# --- Export Schemas ---

class ExportRequest(SQLModel):
    format: str = "mp4"  # mp4, webm, prores, gif
    quality: str = "1080p"  # 720p, 1080p, 4k
    fps: Optional[int] = None
    alpha: bool = False

class ExportResponse(SQLModel):
    job_id: str
    format: str
    quality: str
    download_url: Optional[str] = None

# --- Common ---

class UploadResponse(SQLModel):
    storage_uri: str
    filename: str

class ErrorDetail(SQLModel):
    type: str
    message: str

class ErrorResponse(SQLModel):
    type: str = "error"
    error: ErrorDetail
