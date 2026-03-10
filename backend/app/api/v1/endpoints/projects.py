from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import (
    Project, ProjectClip, ProjectRender,
    ProjectCreate, ProjectClipCreate, ProjectResponse,
    VideoJob, User, JobStatus,
)

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = Project(name=data.name, description=data.description, user_id=user.id)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    stmt = select(Project).where(Project.user_id == user.id)
    return session.exec(stmt).all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    project.name = data.name
    if data.description is not None:
        project.description = data.description
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"ok": True}


@router.post("/{project_id}/clips")
async def add_clip(
    project_id: str,
    data: ProjectClipCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    job = session.get(VideoJob, data.job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Video not found")

    clip = ProjectClip(
        project_id=project_id,
        job_id=data.job_id,
        position=data.position,
        transition_type=data.transition_type,
        transition_duration=data.transition_duration,
    )
    session.add(clip)
    session.commit()
    session.refresh(clip)
    return clip


@router.get("/{project_id}/clips")
async def list_clips(
    project_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    stmt = select(ProjectClip).where(ProjectClip.project_id == project_id).order_by(ProjectClip.position)
    return session.exec(stmt).all()


@router.patch("/{project_id}/clips/{clip_id}")
async def update_clip(
    project_id: str,
    clip_id: str,
    data: ProjectClipCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    clip = session.get(ProjectClip, clip_id)
    if not clip or clip.project_id != project_id:
        raise HTTPException(status_code=404, detail="Clip not found")

    clip.position = data.position
    clip.transition_type = data.transition_type
    clip.transition_duration = data.transition_duration
    session.add(clip)
    session.commit()
    session.refresh(clip)
    return clip


@router.delete("/{project_id}/clips/{clip_id}")
async def delete_clip(
    project_id: str,
    clip_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    clip = session.get(ProjectClip, clip_id)
    if not clip or clip.project_id != project_id:
        raise HTTPException(status_code=404, detail="Clip not found")

    session.delete(clip)
    session.commit()
    return {"ok": True}


@router.post("/{project_id}/clips/reorder")
async def reorder_clips(
    project_id: str,
    clip_ids: list[str],
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    for i, clip_id in enumerate(clip_ids):
        clip = session.get(ProjectClip, clip_id)
        if clip and clip.project_id == project_id:
            clip.position = i
            session.add(clip)

    session.commit()
    return {"ok": True}


@router.post("/{project_id}/render")
async def render_project(
    project_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    render = ProjectRender(project_id=project_id, status=JobStatus.PENDING)
    session.add(render)
    session.commit()
    session.refresh(render)

    return {"render_id": render.id, "status": render.status}
