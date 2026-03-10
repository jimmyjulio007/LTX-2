import hashlib
from typing import Generator, List
from sqlmodel import Session, create_engine, select
from datetime import datetime
from .config import settings
from .models import User, Session as SessionModel, ApiKey, Role
from fastapi import Depends, HTTPException, Request

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"sslmode": "require"} if "neon.tech" in settings.DATABASE_URL else {}
)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

async def get_current_user(
    request: Request,
    db: Session = Depends(get_session)
) -> User:
    """
    Authenticates via X-API-Key header or Better Auth session token.
    """
    # 1. Try API Key authentication
    api_key_header = request.headers.get("X-API-Key")
    if api_key_header:
        key_hash = hashlib.sha256(api_key_header.encode()).hexdigest()
        api_key = db.exec(
            select(ApiKey).where(ApiKey.key_hash == key_hash).where(ApiKey.is_active == True)
        ).first()

        if not api_key:
            raise HTTPException(status_code=401, detail="Invalid API key")

        if api_key.expires_at and api_key.expires_at.replace(tzinfo=None) < datetime.now():
            raise HTTPException(status_code=401, detail="API key expired")

        api_key.total_requests += 1
        api_key.last_used_at = datetime.now()
        db.add(api_key)
        db.commit()

        user = db.get(User, api_key.user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.banned:
            raise HTTPException(status_code=403, detail=f"User is banned: {user.banReason or 'No reason provided'}")
        return user

    # 2. Try session token from cookie
    token = request.cookies.get("better-auth.session_token")

    # 3. Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: No session token found"
        )

    # 4. Validate token in Database
    statement = select(SessionModel).where(SessionModel.token == token)
    session_record = db.exec(statement).first()

    if not session_record:
        raise HTTPException(status_code=401, detail="Invalid session")

    if session_record.expiresAt.replace(tzinfo=None) < datetime.now():
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.get(User, session_record.userId)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if user.banned:
        raise HTTPException(
            status_code=403,
            detail=f"User is banned: {user.banReason or 'No reason provided'}"
        )

    return user

async def require_role(allowed_roles: List[Role]):
    """
    Dependency factory to enforce Role-Based Access Control.
    """
    async def decorator(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Permission denied: Required roles {allowed_roles}"
            )
        return user
    return decorator

async def check_credits(user: User = Depends(get_current_user)):
    """
    Ensures the user has at least 1 credit to perform an operation.
    """
    if user.credits < 1:
        raise HTTPException(
            status_code=402, 
            detail=f"Insufficient credits. Balance: {user.credits}"
        )
    return user
