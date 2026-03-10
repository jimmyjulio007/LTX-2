from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user
from ....models import LoraModel, LoraTrainingImage, LoraModelCreate, LoraModelResponse, User
from ....config import settings

router = APIRouter()


@router.post("/train", response_model=LoraModelResponse)
async def start_lora_training(
    data: LoraModelCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Start LoRA model training (requires uploaded images)."""
    cost = settings.CREDIT_COST_LORA_TRAINING
    if user.credits < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. LoRA training costs {cost} credits.",
        )

    user.credits -= cost
    session.add(user)

    model = LoraModel(
        name=data.name,
        trigger_word=data.trigger_word,
        user_id=user.id,
        status="PENDING",
    )
    session.add(model)
    session.commit()
    session.refresh(model)

    return model


@router.get("/models", response_model=list[LoraModelResponse])
async def list_lora_models(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    stmt = select(LoraModel).where(LoraModel.user_id == user.id)
    return session.exec(stmt).all()


@router.get("/models/{model_id}", response_model=LoraModelResponse)
async def get_lora_model(
    model_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    model = session.get(LoraModel, model_id)
    if not model or model.user_id != user.id:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.delete("/models/{model_id}")
async def delete_lora_model(
    model_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    model = session.get(LoraModel, model_id)
    if not model or model.user_id != user.id:
        raise HTTPException(status_code=404, detail="Model not found")

    # Delete associated training images
    stmt = select(LoraTrainingImage).where(LoraTrainingImage.lora_model_id == model_id)
    images = session.exec(stmt).all()
    for img in images:
        session.delete(img)

    session.delete(model)
    session.commit()
    return {"ok": True}
