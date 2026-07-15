from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.chat_history import ChatHistory

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_documents = (
        db.query(func.count(Document.id))
        .filter(Document.user_id == current_user.id)
        .scalar()
    )

    total_chats = (
        db.query(func.count(ChatHistory.id))
        .filter(ChatHistory.user_id == current_user.id)
        .scalar()
    )

    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .all()
    )

    storage_used = sum(
        doc.file_size or 0
        for doc in documents
    )

    last_upload = None

    if documents:
        latest = max(
            documents,
            key=lambda x: x.uploaded_at,
        )

        last_upload = {
            "filename": latest.filename,
            "uploaded_at": latest.uploaded_at,
        }

    recent_chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "status": "success",
        "statistics": {
            "total_documents": total_documents,
            "total_chats": total_chats,
            "storage_used_bytes": storage_used,
            "storage_used_mb": round(storage_used / (1024 * 1024), 2),
        },
        "last_upload": last_upload,
        "recent_chats": [
            {
                "question": chat.question,
                "created_at": chat.created_at,
            }
            for chat in recent_chats
        ],
    }