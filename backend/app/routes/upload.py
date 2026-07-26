from __future__ import annotations

from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.upload_service import save_uploaded_file

router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"],
)

# ==========================================================
# Supported File Types
# ==========================================================

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

# ==========================================================
# Upload Document
# ==========================================================


@router.post(
    "/file",
    status_code=status.HTTP_201_CREATED,
    summary="Upload Document",
    description="Upload a document for AI processing and semantic search.",
)
async def upload_file(
    file: Annotated[UploadFile, File(...)],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Upload a supported document.

    Supported file types:
    - PDF
    - DOCX
    - CSV
    - XLSX
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Unsupported file type. "
                "Only PDF, DOCX, CSV and XLSX files are allowed."
            ),
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"Maximum file size is "
                f"{settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
            ),
        )

    await file.seek(0)

    try:
        result = save_uploaded_file(
            file=file,
            db=db,
            user_id=current_user.id,
        )

        logger.info(
            "User %s uploaded document '%s'",
            current_user.id,
            file.filename,
        )

        return result

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Unexpected error while uploading '%s'.",
            file.filename,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )