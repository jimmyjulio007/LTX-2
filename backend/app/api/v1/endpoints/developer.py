import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import ApiKey, ApiKeyCreate, ApiKeyResponse, ApiKeyFullResponse, User
from datetime import datetime

router = APIRouter()


def _generate_api_key() -> tuple[str, str, str]:
    """Generate an API key, returning (full_key, key_hash, key_prefix)."""
    raw = secrets.token_urlsafe(32)
    full_key = f"ltx_{raw}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    key_prefix = full_key[:12]
    return full_key, key_hash, key_prefix


@router.post("/keys", response_model=ApiKeyFullResponse)
async def create_api_key(
    data: ApiKeyCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Generate a new API key. The full key is only shown once."""
    full_key, key_hash, key_prefix = _generate_api_key()

    api_key = ApiKey(
        user_id=user.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=data.name,
        permissions=data.permissions,
        rate_limit=data.rate_limit,
    )
    session.add(api_key)
    session.commit()
    session.refresh(api_key)

    return ApiKeyFullResponse(
        id=api_key.id,
        key_prefix=key_prefix,
        name=api_key.name,
        permissions=api_key.permissions,
        rate_limit=api_key.rate_limit,
        total_requests=0,
        is_active=True,
        last_used_at=None,
        created_at=api_key.created_at,
        full_key=full_key,
    )


@router.get("/keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """List API keys (prefix only, never full key)."""
    stmt = select(ApiKey).where(ApiKey.user_id == user.id)
    return session.exec(stmt).all()


@router.delete("/keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Revoke an API key."""
    api_key = session.get(ApiKey, key_id)
    if not api_key or api_key.user_id != user.id:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    session.add(api_key)
    session.commit()
    return {"ok": True, "message": "API key revoked"}


@router.get("/usage")
async def get_usage(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get API usage statistics."""
    stmt = select(ApiKey).where(ApiKey.user_id == user.id)
    keys = session.exec(stmt).all()

    total_requests = sum(k.total_requests for k in keys)
    active_keys = sum(1 for k in keys if k.is_active)

    return {
        "total_requests": total_requests,
        "active_keys": active_keys,
        "total_keys": len(keys),
        "credits_remaining": user.credits,
        "keys": [
            {
                "id": k.id,
                "name": k.name,
                "prefix": k.key_prefix,
                "requests": k.total_requests,
                "last_used": k.last_used_at,
            }
            for k in keys
        ],
    }
