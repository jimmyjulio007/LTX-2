from typing import Generator
from sqlmodel import Session, create_engine
from .config import settings
from .models import User
from .core.security import security, verify_token
from fastapi import Depends, HTTPException

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"sslmode": "require"} if "neon.tech" in settings.DATABASE_URL else {}
)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

async def get_current_user(
    auth: str = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    user_id = verify_token(auth.credentials)
    user = session.get(User, user_id)
    if not user:
        # Auto-creation remains for now as requested/allowed in previous steps
        user = User(id=user_id, email=f"{user_id}@auth.link", credits=10)
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

async def check_credits(user: User = Depends(get_current_user)):
    if user.credits < 1:
        raise HTTPException(
            status_code=402, 
            detail=f"Insufficient credits. Balance: {user.credits}"
        )
    return user
