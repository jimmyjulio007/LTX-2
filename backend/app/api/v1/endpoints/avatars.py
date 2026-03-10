from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import (
    Avatar, ScheduledPost, User,
    AvatarCreate, AvatarResponse,
    ScheduledPostCreate, ScheduledPostResponse,
)

router = APIRouter()


@router.post("/", response_model=AvatarResponse)
async def create_avatar(
    data: AvatarCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    avatar = Avatar(
        name=data.name,
        lora_model_id=data.lora_model_id,
        style_prompt=data.style_prompt,
        user_id=user.id,
    )
    session.add(avatar)
    session.commit()
    session.refresh(avatar)
    return avatar


@router.get("/", response_model=list[AvatarResponse])
async def list_avatars(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    stmt = select(Avatar).where(Avatar.user_id == user.id)
    return session.exec(stmt).all()


@router.patch("/{avatar_id}", response_model=AvatarResponse)
async def update_avatar(
    avatar_id: str,
    data: AvatarCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    avatar = session.get(Avatar, avatar_id)
    if not avatar or avatar.user_id != user.id:
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar.name = data.name
    avatar.style_prompt = data.style_prompt
    if data.lora_model_id is not None:
        avatar.lora_model_id = data.lora_model_id
    session.add(avatar)
    session.commit()
    session.refresh(avatar)
    return avatar


@router.delete("/{avatar_id}")
async def delete_avatar(
    avatar_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    avatar = session.get(Avatar, avatar_id)
    if not avatar or avatar.user_id != user.id:
        raise HTTPException(status_code=404, detail="Avatar not found")
    session.delete(avatar)
    session.commit()
    return {"ok": True}


@router.post("/{avatar_id}/schedule", response_model=ScheduledPostResponse)
async def schedule_post(
    avatar_id: str,
    data: ScheduledPostCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    avatar = session.get(Avatar, avatar_id)
    if not avatar or avatar.user_id != user.id:
        raise HTTPException(status_code=404, detail="Avatar not found")

    post = ScheduledPost(
        avatar_id=avatar_id,
        user_id=user.id,
        prompt=data.prompt,
        platform=data.platform,
        scheduled_at=data.scheduled_at,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/{avatar_id}/calendar", response_model=list[ScheduledPostResponse])
async def get_calendar(
    avatar_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    avatar = session.get(Avatar, avatar_id)
    if not avatar or avatar.user_id != user.id:
        raise HTTPException(status_code=404, detail="Avatar not found")

    stmt = (
        select(ScheduledPost)
        .where(ScheduledPost.avatar_id == avatar_id)
        .order_by(ScheduledPost.scheduled_at)
    )
    return session.exec(stmt).all()


@router.delete("/schedule/{post_id}")
async def cancel_scheduled_post(
    post_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    post = session.get(ScheduledPost, post_id)
    if not post or post.user_id != user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.status != "SCHEDULED":
        raise HTTPException(status_code=400, detail="Cannot cancel a post that is not scheduled")
    session.delete(post)
    session.commit()
    return {"ok": True}
