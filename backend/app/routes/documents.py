from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.document_service import DocumentService
from app.vector_db.chroma_service import ChromaService

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = DocumentService.get_document_by_id(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    chroma_service = ChromaService()

    deleted_chunks = chroma_service.delete_document_chunks(
        document.id
    )

    DocumentService.delete_document(
        db=db,
        document=document,
    )

    return {
        "status": "success",
        "message": "Document deleted successfully.",
        "deleted_chunks": deleted_chunks,
    }