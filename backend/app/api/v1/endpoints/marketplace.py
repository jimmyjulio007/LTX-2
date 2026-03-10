from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import (
    MarketplaceTemplate, TemplatePurchase, User,
    MarketplaceTemplateCreate, MarketplaceTemplateResponse,
)

router = APIRouter()


@router.get("/templates", response_model=list[MarketplaceTemplateResponse])
async def browse_templates(
    category: str = Query(None),
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session),
):
    """Browse approved marketplace templates (public)."""
    stmt = select(MarketplaceTemplate).where(MarketplaceTemplate.is_approved == True)
    if category:
        stmt = stmt.where(MarketplaceTemplate.category == category)
    stmt = stmt.offset(skip).limit(limit)
    return session.exec(stmt).all()


@router.get("/templates/{template_id}", response_model=MarketplaceTemplateResponse)
async def get_template(
    template_id: str,
    session: Session = Depends(get_session),
):
    """Get a specific template."""
    template = session.get(MarketplaceTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/templates", response_model=MarketplaceTemplateResponse)
async def submit_template(
    data: MarketplaceTemplateCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Submit a template to the marketplace (requires approval)."""
    template = MarketplaceTemplate(
        **data.dict(),
        creator_id=user.id,
        is_approved=False,
    )
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


@router.post("/templates/{template_id}/purchase")
async def purchase_template(
    template_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Purchase a template. Deducts credits, 50% royalty to creator."""
    template = session.get(MarketplaceTemplate, template_id)
    if not template or not template.is_approved:
        raise HTTPException(status_code=404, detail="Template not found")

    if template.creator_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own template")

    # Check already purchased
    existing = session.exec(
        select(TemplatePurchase)
        .where(TemplatePurchase.buyer_id == user.id)
        .where(TemplatePurchase.template_id == template_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already purchased")

    if user.credits < template.price_credits:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    # Deduct credits & pay royalty
    royalty = template.price_credits // 2
    user.credits -= template.price_credits
    session.add(user)

    creator = session.get(User, template.creator_id)
    if creator:
        creator.credits += royalty
        session.add(creator)

    # Record purchase
    purchase = TemplatePurchase(
        buyer_id=user.id,
        template_id=template_id,
        credits_paid=template.price_credits,
        creator_royalty=royalty,
    )
    session.add(purchase)

    template.total_sales += 1
    session.add(template)

    session.commit()

    return {
        "template_id": template_id,
        "credits_paid": template.price_credits,
        "prompt_text": template.prompt_text,
        "negative_prompt": template.negative_prompt,
    }


@router.get("/my-templates", response_model=list[MarketplaceTemplateResponse])
async def my_templates(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """List templates submitted by the current user."""
    stmt = select(MarketplaceTemplate).where(MarketplaceTemplate.creator_id == user.id)
    return session.exec(stmt).all()


@router.get("/earnings")
async def my_earnings(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get earnings summary for the current user."""
    stmt = (
        select(TemplatePurchase)
        .join(MarketplaceTemplate)
        .where(MarketplaceTemplate.creator_id == user.id)
    )
    purchases = session.exec(stmt).all()
    total_earnings = sum(p.creator_royalty for p in purchases)
    total_sales = len(purchases)

    return {
        "total_earnings": total_earnings,
        "total_sales": total_sales,
        "recent_sales": [
            {
                "id": p.id,
                "credits_earned": p.creator_royalty,
                "created_at": p.created_at,
            }
            for p in purchases[-10:]
        ],
    }
