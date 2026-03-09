from fastapi import APIRouter, Depends
from ....dependencies import get_current_user
from ....models import UserResponse, User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(user: User = Depends(get_current_user)):
    return user
