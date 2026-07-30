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

from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.document import UploadResponse
from app.services.upload_service import save_uploaded_file


router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"],
)


# ==========================================================
# Upload Document
# ==========================================================


@router.post(
    "/file",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload document",
    description=(
        "Upload a supported document for extraction, embedding, "
        "semantic search, and AI chat."
    ),
)
def upload_file(
    file: Annotated[
        UploadFile,
        File(
            description=(
                "Document to upload. Supported formats are "
                "PDF, DOCX, TXT, CSV, XLSX, and XLS."
            ),
        ),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> UploadResponse:
    """
    Process an authenticated document upload.

    Validation, size enforcement, storage, extraction, chunking,
    embedding generation, and ChromaDB persistence are delegated
    to the upload service.

    File extensions are validated by the service rather than
    relying solely on the client-provided MIME type.
    """

    filename = file.filename or "<unknown>"

    logger.info(
        "Upload request received. "
        "user_id=%d filename='%s' content_type='%s'.",
        current_user.id,
        filename,
        file.content_type,
    )

    try:
        result = save_uploaded_file(
            file=file,
            db=db,
            user_id=current_user.id,
        )

        response = UploadResponse.model_validate(result)

        logger.info(
            "Upload request completed successfully. "
            "user_id=%d filename='%s'.",
            current_user.id,
            filename,
        )

        return response

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Unexpected upload route failure. "
            "user_id=%d filename='%s'.",
            current_user.id,
            filename,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process uploaded document.",
        ) from exc
