import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import User, Referral

router = APIRouter()

MAX_REFERRALS_PER_USER = 20
CREDITS_REWARD = 5


@router.get("/my-code")
async def get_my_referral_code(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get or generate the user's unique referral code."""
    if not user.referral_code:
        user.referral_code = secrets.token_urlsafe(6)[:8].upper()
        session.add(user)
        session.commit()

    return {"referral_code": user.referral_code}


@router.get("/stats")
async def get_referral_stats(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get referral stats for the current user."""
    referrals = session.exec(
        select(Referral).where(Referral.referrer_id == user.id)
    ).all()

    completed = [r for r in referrals if r.status == "COMPLETED"]

    return {
        "referral_code": user.referral_code,
        "total_referrals": len(referrals),
        "completed_referrals": len(completed),
        "total_credits_earned": sum(r.credits_awarded for r in completed),
        "max_referrals": MAX_REFERRALS_PER_USER,
    }


@router.post("/validate/{code}")
async def validate_referral_code(
    code: str,
    session: Session = Depends(get_session),
):
    """Validate a referral code during signup."""
    referrer = session.exec(
        select(User).where(User.referral_code == code.upper())
    ).first()

    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    # Check if referrer has reached max referrals
    referral_count = len(
        session.exec(
            select(Referral).where(Referral.referrer_id == referrer.id)
        ).all()
    )

    if referral_count >= MAX_REFERRALS_PER_USER:
        raise HTTPException(status_code=400, detail="Referral limit reached")

    return {"valid": True, "referrer_name": referrer.name}


@router.post("/complete")
async def complete_referral(
    code: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Complete a referral after signup. Awards credits to both parties."""
    referrer = session.exec(
        select(User).where(User.referral_code == code.upper())
    ).first()

    if not referrer or referrer.id == user.id:
        raise HTTPException(status_code=400, detail="Invalid referral")

    # Check if already referred
    existing = session.exec(
        select(Referral)
        .where(Referral.referee_id == user.id)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already referred")

    # Create referral record
    referral = Referral(
        referrer_id=referrer.id,
        referee_id=user.id,
        referral_code=code.upper(),
        status="COMPLETED",
        credits_awarded=CREDITS_REWARD,
        completed_at=datetime.now(),
    )
    session.add(referral)

    # Award credits to both
    referrer.credits += CREDITS_REWARD
    user.credits += CREDITS_REWARD
    user.referred_by = code.upper()

    session.add(referrer)
    session.add(user)
    session.commit()

    return {
        "status": "completed",
        "credits_awarded": CREDITS_REWARD,
    }
