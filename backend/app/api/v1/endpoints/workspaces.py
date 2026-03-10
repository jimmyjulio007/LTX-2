from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import (
    Workspace, WorkspaceMember, User,
    WorkspaceCreate, WorkspaceResponse, WorkspaceMemberResponse, WorkspaceInvite,
)

router = APIRouter()


@router.post("/", response_model=WorkspaceResponse)
async def create_workspace(
    data: WorkspaceCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    workspace = Workspace(name=data.name, owner_id=user.id)
    session.add(workspace)
    session.commit()
    session.refresh(workspace)

    # Add owner as member
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user.id,
        role="owner",
    )
    session.add(member)
    session.commit()

    return workspace


@router.get("/", response_model=list[WorkspaceResponse])
async def list_workspaces(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    stmt = (
        select(Workspace)
        .join(WorkspaceMember)
        .where(WorkspaceMember.user_id == user.id)
    )
    return session.exec(stmt).all()


@router.post("/{workspace_id}/invite")
async def invite_member(
    workspace_id: str,
    data: WorkspaceInvite,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check permission (owner or admin)
    member = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == user.id)
    ).first()
    if not member or member.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Find invited user
    invited_user = session.exec(
        select(User).where(User.email == data.email)
    ).first()
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check not already member
    existing = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == invited_user.id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=invited_user.id,
        role=data.role,
        invited_by=user.id,
    )
    session.add(new_member)
    session.commit()

    return {"ok": True, "message": f"Invited {data.email} as {data.role}"}


@router.patch("/{workspace_id}/members/{member_user_id}")
async def change_member_role(
    workspace_id: str,
    member_user_id: str,
    role: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only workspace owner can change roles")

    member = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == member_user_id)
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.role = role
    session.add(member)
    session.commit()
    return {"ok": True}


@router.delete("/{workspace_id}/members/{member_user_id}")
async def remove_member(
    workspace_id: str,
    member_user_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check permission
    caller = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == user.id)
    ).first()
    if not caller or caller.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Permission denied")

    if member_user_id == workspace.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove workspace owner")

    member = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == member_user_id)
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    session.delete(member)
    session.commit()
    return {"ok": True}


@router.get("/{workspace_id}/members", response_model=list[WorkspaceMemberResponse])
async def list_members(
    workspace_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    # Verify user is a member
    caller = session.exec(
        select(WorkspaceMember)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .where(WorkspaceMember.user_id == user.id)
    ).first()
    if not caller:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    stmt = select(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace_id)
    return session.exec(stmt).all()
