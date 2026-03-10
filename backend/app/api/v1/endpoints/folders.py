from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ....dependencies import get_session, get_current_user
from ....models import Folder, VideoJob, User

router = APIRouter()


@router.post("/")
async def create_folder(
    name: str,
    parent_id: str = None,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Create a new folder."""
    folder = Folder(name=name, user_id=user.id, parent_id=parent_id)
    session.add(folder)
    session.commit()
    session.refresh(folder)
    return {
        "id": folder.id,
        "name": folder.name,
        "parent_id": folder.parent_id,
    }


@router.get("/")
async def list_folders(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """List all folders for the current user."""
    folders = session.exec(
        select(Folder)
        .where(Folder.user_id == user.id)
        .order_by(Folder.sort_order, Folder.name)
    ).all()

    return [
        {
            "id": f.id,
            "name": f.name,
            "parent_id": f.parent_id,
            "sort_order": f.sort_order,
        }
        for f in folders
    ]


@router.patch("/{folder_id}")
async def rename_folder(
    folder_id: str,
    name: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Rename a folder."""
    folder = session.get(Folder, folder_id)
    if not folder or folder.user_id != user.id:
        raise HTTPException(status_code=404, detail="Folder not found")

    folder.name = name
    session.add(folder)
    session.commit()
    return {"id": folder.id, "name": folder.name}


@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Delete a folder. Videos inside are moved to root (folder_id = None)."""
    folder = session.get(Folder, folder_id)
    if not folder or folder.user_id != user.id:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Move all videos in this folder to root
    videos = session.exec(
        select(VideoJob).where(VideoJob.folder_id == folder_id)
    ).all()
    for video in videos:
        video.folder_id = None
        session.add(video)

    session.delete(folder)
    session.commit()
    return {"status": "deleted"}


@router.post("/{folder_id}/move")
async def move_to_folder(
    folder_id: str,
    job_ids: List[str],
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Move video jobs into a folder."""
    folder = session.get(Folder, folder_id)
    if not folder or folder.user_id != user.id:
        raise HTTPException(status_code=404, detail="Folder not found")

    for job_id in job_ids:
        job = session.get(VideoJob, job_id)
        if job and job.user_id == user.id:
            job.folder_id = folder_id
            session.add(job)

    session.commit()
    return {"status": "moved", "count": len(job_ids)}
