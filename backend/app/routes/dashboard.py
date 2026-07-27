from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.chat_history import ChatHistory
from app.models.document import Document
from app.models.user import User


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/",
    summary="Get dashboard",
    description=(
        "Return dashboard statistics and recent activity "
        "for the authenticated user."
    ),
)
def dashboard(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> dict:
    """
    Return dashboard information belonging to the current user.

    Statistics and activity are always scoped to the authenticated
    user to prevent cross-user data exposure.
    """

    user_id = current_user.id

    # ==========================================================
    # Document Statistics
    # ==========================================================

    total_documents = (
        db.query(func.count(Document.id))
        .filter(
            Document.user_id == user_id
        )
        .scalar()
        or 0
    )

    storage_used = (
        db.query(
            func.coalesce(
                func.sum(Document.file_size),
                0,
            )
        )
        .filter(
            Document.user_id == user_id
        )
        .scalar()
        or 0
    )

    # ==========================================================
    # Chat Statistics
    # ==========================================================

    total_chats = (
        db.query(func.count(ChatHistory.id))
        .filter(
            ChatHistory.user_id == user_id
        )
        .scalar()
        or 0
    )

    # ==========================================================
    # Latest Upload
    # ==========================================================

    latest_document = (
        db.query(Document)
        .filter(
            Document.user_id == user_id
        )
        .order_by(
            Document.uploaded_at.desc(),
            Document.id.desc(),
        )
        .first()
    )

    last_upload = None

    if latest_document is not None:
        last_upload = {
            "filename": latest_document.filename,
            "uploaded_at": latest_document.uploaded_at,
        }

    # ==========================================================
    # Recent Chats
    # ==========================================================

    recent_chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == user_id
        )
        .order_by(
            ChatHistory.created_at.desc(),
            ChatHistory.id.desc(),
        )
        .limit(5)
        .all()
    )

    # ==========================================================
    # Response
    # ==========================================================

    storage_used_bytes = int(storage_used)

    return {
        "status": "success",
        "statistics": {
            "total_documents": int(total_documents),
            "total_chats": int(total_chats),
            "storage_used_bytes": storage_used_bytes,
            "storage_used_mb": round(
                storage_used_bytes / (1024 * 1024),
                2,
            ),
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