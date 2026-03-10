from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional
from ....dependencies import get_session, get_current_user
from ....models import User, PromptTemplate
from ....core.prompt_engine import enhance_prompt as enhance_prompt_fn
from ....core.moderation import moderate_prompt, ModerationFlag
from pydantic import BaseModel

router = APIRouter()


class EnhancePromptRequest(BaseModel):
    prompt: str
    style: Optional[str] = None


class EnhancedPromptResponse(BaseModel):
    original: str
    enhanced: str


@router.post("/enhance", response_model=EnhancedPromptResponse)
async def enhance_prompt(
    body: EnhancePromptRequest,
    user: User = Depends(get_current_user),
):
    """Enhance a simple prompt into a detailed cinematic description using AI."""
    # Moderate the input prompt first
    flag, reason = moderate_prompt(body.prompt)
    if flag == ModerationFlag.BLOCKED:
        raise HTTPException(status_code=400, detail=f"Content blocked: {reason}")

    enhanced = await enhance_prompt_fn(body.prompt, body.style)

    # Also moderate the enhanced output
    flag, reason = moderate_prompt(enhanced)
    if flag == ModerationFlag.BLOCKED:
        raise HTTPException(status_code=400, detail="Enhanced prompt was flagged by moderation")

    return EnhancedPromptResponse(original=body.prompt, enhanced=enhanced)


@router.get("/templates")
async def list_templates(
    category: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    """Return prompt style templates, optionally filtered by category."""
    statement = select(PromptTemplate).order_by(PromptTemplate.sort_order)
    if category:
        statement = statement.where(PromptTemplate.category == category)
    templates = session.exec(statement).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "name_fr": t.name_fr,
            "category": t.category,
            "prompt_text": t.prompt_text,
            "thumbnail_url": t.thumbnail_url,
        }
        for t in templates
    ]


@router.get("/templates/{template_id}")
async def get_template(
    template_id: str,
    session: Session = Depends(get_session),
):
    """Return a single template by ID."""
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return {
        "id": template.id,
        "name": template.name,
        "name_fr": template.name_fr,
        "category": template.category,
        "prompt_text": template.prompt_text,
        "thumbnail_url": template.thumbnail_url,
    }
