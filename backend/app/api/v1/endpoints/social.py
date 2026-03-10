from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import User, SocialAccount, SocialPost, VideoJob
from ....config import settings
import httpx
import uuid
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/tiktok/authorize")
async def tiktok_authorize(user: User = Depends(get_current_user)):
    """Redirect to TikTok for OAuth."""
    # Build TikTok OAuth URL
    scopes = "user.info.basic,video.upload,video.publish"
    url = (
        f"https://www.tiktok.com/v2/auth/authorize/"
        f"?client_key={settings.TIKTOK_CLIENT_ID}"
        f"&scope={scopes}"
        f"&response_type=code"
        f"&redirect_uri={settings.TIKTOK_REDIRECT_URI}"
        f"&state={user.id}"
    )
    return RedirectResponse(url)

@router.get("/tiktok/callback")
async def tiktok_callback(code: str, state: str, session: Session = Depends(get_session)):
    """Handle TikTok OAuth callback."""
    # In production, verify 'state' matches user.id
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://open.tiktokapis.com/v2/oauth/token/",
            data={
                "client_key": settings.TIKTOK_CLIENT_ID,
                "client_secret": settings.TIKTOK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.TIKTOK_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange TikTok code")
            
        data = response.json()
        
        # Save or Update SocialAccount
        # Note: TikTok returns open_id as unique identifier
        account = SocialAccount(
            provider="tiktok",
            provider_user_id=data["open_id"],
            username="TikTok User", # Ideally fetch from /user/info/
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token"),
            expires_at=datetime.now() + timedelta(seconds=data["expires_in"]),
            user_id=state
        )
        session.add(account)
        session.commit()
        
    return {"status": "success", "message": "TikTok account linked!"}

@router.post("/publish/{job_id}")
async def publish_to_social(
    job_id: str,
    social_account_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Publish a generated video to a linked social account."""
    job = session.get(VideoJob, job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Video job not found")
        
    if job.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Video is not ready for publishing")
        
    account = session.get(SocialAccount, social_account_id)
    if not account or account.user_id != user.id:
        raise HTTPException(status_code=404, detail="Social account not found")
        
    # Create Post Record
    post = SocialPost(
        job_id=job.id,
        social_account_id=account.id,
        status="PENDING"
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    
    # In a real app, this would trigger a Celery task to upload to TikTok
    # For now, we simulate the start of the process
    return {"status": "pending", "post_id": post.id}

@router.get("/accounts")
async def list_social_accounts(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
) -> list[SocialAccount]:
    """List all accounts linked by the user."""
    statement = select(SocialAccount).where(SocialAccount.user_id == user.id)
    return session.exec(statement).all()
