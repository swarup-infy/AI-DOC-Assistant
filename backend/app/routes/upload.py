from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
)
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.upload_service import save_uploaded_file

router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"],
)


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return save_uploaded_file(
            file=file,
            db=db,
            user_id=current_user.id,
        )

    except HTTPException:
        raise