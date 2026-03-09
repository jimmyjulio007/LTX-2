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

settings = Settings()
