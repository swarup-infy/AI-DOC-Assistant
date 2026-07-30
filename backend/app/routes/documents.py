from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.document import (
    DeleteDocumentResponse,
    DocumentListResponse,
    DocumentResponse,
)
from app.services.document_service import DocumentService
from app.services.upload_service import delete_uploaded_file
from app.vector_db.chroma_service import ChromaService


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


# ==========================================================
# Get Documents
# ==========================================================


@router.get(
    "/",
    response_model=DocumentListResponse,
    summary="Get user documents",
    description=(
        "Return all documents uploaded by the "
        "authenticated user."
    ),
)
def get_documents(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> DocumentListResponse:
    """
    Retrieve all documents belonging to the current user.
    """

    try:
        documents = DocumentService.get_documents(
            db=db,
            user_id=current_user.id,
        )

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while listing documents "
            "for user_id=%d.",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve documents.",
        ) from exc

    return DocumentListResponse(
        documents=[
            DocumentResponse.model_validate(
                document
            )
            for document in documents
        ],
        total=len(documents),
    )


# ==========================================================
# Delete Document
# ==========================================================


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
    summary="Delete document",
    description=(
        "Delete an authenticated user's document, "
        "its stored vectors, and its physical file."
    ),
)
def delete_document(
    document_id: Annotated[
        int,
        Path(
            gt=0,
            description="ID of the document to delete.",
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
) -> DeleteDocumentResponse:
    """
    Delete a document owned by the current user.

    Cleanup order:
    1. Verify document ownership.
    2. Delete ChromaDB vectors.
    3. Delete the PostgreSQL record.
    4. Delete the physical file.

    Vector deletion happens before database deletion so a
    ChromaDB failure does not leave orphaned vectors after the
    authoritative database record has disappeared.

    Physical-file deletion happens last because failure to remove
    a file is less harmful than leaving active database or vector
    records for a document the user requested to delete.
    """

    # ======================================================
    # Document Ownership
    # ======================================================

    try:
        document = DocumentService.get_document_by_id(
            db=db,
            document_id=document_id,
            user_id=current_user.id,
        )

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while retrieving document_id=%d "
            "for deletion by user_id=%d.",
            document_id,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve document.",
        ) from exc

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    file_path = document.file_path
    filename = document.filename

    # ======================================================
    # ChromaDB Cleanup
    # ======================================================

    try:
        chroma_service = ChromaService()

        deleted_chunks = (
            chroma_service.delete_document_chunks(
                document_id=document.id,
                user_id=current_user.id,
            )
        )

    except Exception as exc:
        logger.exception(
            "Failed to delete ChromaDB vectors. "
            "document_id=%d user_id=%d.",
            document.id,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to delete document vectors. "
                "Document was not deleted."
            ),
        ) from exc

    # ======================================================
    # Database Cleanup
    # ======================================================

    try:
        DocumentService.delete_document(
            db=db,
            document=document,
        )

    except SQLAlchemyError as exc:
        logger.exception(
            "Database deletion failed after ChromaDB cleanup. "
            "document_id=%d user_id=%d.",
            document_id,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete document record.",
        ) from exc

    # ======================================================
    # Physical File Cleanup
    # ======================================================

    file_deleted = delete_uploaded_file(
        file_path
    )

    if not file_deleted:
        logger.warning(
            "Document metadata and vectors were deleted, "
            "but physical file cleanup was unsuccessful. "
            "document_id=%d user_id=%d path='%s'.",
            document_id,
            current_user.id,
            file_path,
        )

    logger.info(
        "Document deletion completed. "
        "document_id=%d user_id=%d filename='%s' "
        "deleted_chunks=%d file_deleted=%s.",
        document_id,
        current_user.id,
        filename,
        deleted_chunks,
        file_deleted,
    )

    return DeleteDocumentResponse(
        message="Document deleted successfully.",
        deleted_chunks=deleted_chunks,
        file_deleted=file_deleted,
    )