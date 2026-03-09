from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from ..config import settings
from ..models import User

security = HTTPBearer()

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalid: Missing ID")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

async def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(lambda: None) # Will be overridden in main or provided via dependency
) -> User:
    # This will be properly used in endpoints with a real session
    pass
