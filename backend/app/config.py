from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # API Metadata
    APP_NAME: str = "LTX-2 Video Engine"
    DEBUG: bool = False

    # Database (Neon/Postgres ou SQLite local)
    DATABASE_URL: str = "sqlite:///./ltx_video.db"
    
    # RunPod
    RUNPOD_API_KEY: str
    RUNPOD_ENDPOINT_ID: str
    RUNPOD_WEBHOOK_TOKEN: str

    # Security
    INTERNAL_API_SECRET: str
    JWT_SECRET_KEY: str = "super_secret_change_me_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # Storage (S3/R2)
    S3_BUCKET: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_ENDPOINT: Optional[str] = "https://s3.amazonaws.com"

    # Gemini AI & Moderation
    GEMINI_API_KEY: str = ""
    MODERATION_ENABLED: bool = True

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    GPU_MAX_RETRIES: int = 3
    GPU_RETRY_BACKOFF: int = 60  # seconds, exponential base

    # Credit Costs
    CREDIT_COST_DRAFT: int = 0
    CREDIT_COST_STANDARD: int = 1
    CREDIT_COST_PREMIUM: int = 3
    CREDIT_COST_4K: int = 2
    CREDIT_COST_60FPS: int = 1
    CREDIT_COST_LORA_TRAINING: int = 20

    # RunPod Endpoints (per tier)
    RUNPOD_ENDPOINT_DRAFT: str = ""
    RUNPOD_ENDPOINT_PREMIUM: str = ""
    RUNPOD_TRAINING_ENDPOINT_ID: str = ""

    # Social API
    TIKTOK_CLIENT_ID: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TIKTOK_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/tiktok/callback"

    META_CLIENT_ID: str = ""
    META_CLIENT_SECRET: str = ""
    META_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/meta/callback"

settings = Settings()
