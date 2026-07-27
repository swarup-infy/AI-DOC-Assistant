from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.chat_history_service import ChatHistoryService


router = APIRouter(
    prefix="/api/history",
    tags=["Chat History"],
)


@router.get(
    "/",
    summary="Get chat history",
    description=(
        "Return chat history belonging to the authenticated user."
    ),
)
def get_history(
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
    Retrieve chat history belonging to the current user.
    """

    history = ChatHistoryService.get_chat_history(
        db=db,
        user_id=current_user.id,
        limit=100,
    )

    return {
        "status": "success",
        "total": len(history),
        "history": [
            {
                "id": chat.id,
                "question": chat.question,
                "answer": chat.answer,
                "created_at": chat.created_at,
            }
            for chat in history
        ],
    }


@router.delete(
    "/",
    summary="Clear chat history",
    description=(
        "Delete all chat history belonging to the authenticated user."
    ),
)
def clear_history(
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
    Delete all chat history belonging to the current user.
    """

    deleted_records = ChatHistoryService.delete_chat_history(
        db=db,
        user_id=current_user.id,
    )

    return {
        "status": "success",
        "message": "Chat history cleared successfully.",
        "deleted_records": deleted_records,
    }