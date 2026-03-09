from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ....dependencies import get_current_user
from ....models import UploadResponse
from ....core.s3 import s3_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=UploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    user: str = Depends(get_current_user)
):
    # Validation taille (50MB)
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")
    await file.seek(0)

    try:
        result = await s3_service.upload_file(
            file.file, 
            file.filename, 
            file.content_type
        )
        return result
    except Exception as e:
        logger.error(f"Upload Route Error: {e}")
        raise HTTPException(status_code=500, detail="Internal upload error")
