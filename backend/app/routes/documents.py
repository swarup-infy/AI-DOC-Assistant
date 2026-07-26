from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.document_service import DocumentService
from app.vector_db.chroma_service import ChromaService

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.get(
    "/",
    summary="Get user documents",
    description="Return all documents uploaded by the authenticated user.",
)
def get_documents(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Retrieve all documents belonging to the current user.
    """

    documents = DocumentService.get_documents(
        db=db,
        user_id=current_user.id,
    )

    return {
        "status": "success",
        "documents": [
            {
                "id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "file_size": doc.file_size,
                "uploaded_at": doc.uploaded_at,
            }
            for doc in documents
        ],
    }


@router.delete(
    "/{document_id}",
    summary="Delete document",
    description="Delete a document and its associated embeddings.",
)
def delete_document(
    document_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Delete a document uploaded by the current user.
    """

    document = DocumentService.get_document_by_id(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        file_path = Path(document.file_path)

        if file_path.exists():
            file_path.unlink()

        chroma_service = ChromaService()

        deleted_chunks = chroma_service.delete_document_chunks(
            document.id,
        )

        DocumentService.delete_document(
            db=db,
            document=document,
        )

        logger.info(
            "User %s deleted document %s",
            current_user.id,
            document.id,
        )

        return {
            "status": "success",
            "message": "Document deleted successfully.",
            "deleted_chunks": deleted_chunks,
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Unexpected error while deleting document %s.",
            document_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )