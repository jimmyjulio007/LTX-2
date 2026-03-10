from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import User, NotificationPreference

router = APIRouter()


@router.get("/preferences")
async def get_notification_preferences(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get the user's notification preferences."""
    prefs = session.exec(
        select(NotificationPreference).where(NotificationPreference.user_id == user.id)
    ).first()

    if not prefs:
        # Create default preferences
        prefs = NotificationPreference(user_id=user.id)
        session.add(prefs)
        session.commit()
        session.refresh(prefs)

    return {
        "email_on_completion": prefs.email_on_completion,
        "email_on_failure": prefs.email_on_failure,
        "email_marketing": prefs.email_marketing,
    }


@router.patch("/preferences")
async def update_notification_preferences(
    email_on_completion: bool = None,
    email_on_failure: bool = None,
    email_marketing: bool = None,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Update the user's notification preferences."""
    prefs = session.exec(
        select(NotificationPreference).where(NotificationPreference.user_id == user.id)
    ).first()

    if not prefs:
        prefs = NotificationPreference(user_id=user.id)

    if email_on_completion is not None:
        prefs.email_on_completion = email_on_completion
    if email_on_failure is not None:
        prefs.email_on_failure = email_on_failure
    if email_marketing is not None:
        prefs.email_marketing = email_marketing

    session.add(prefs)
    session.commit()

    return {
        "email_on_completion": prefs.email_on_completion,
        "email_on_failure": prefs.email_on_failure,
        "email_marketing": prefs.email_marketing,
    }
