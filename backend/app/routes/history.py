from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.chat_history_service import ChatHistoryService

router = APIRouter(
    prefix="/api/history",
    tags=["Chat History"],
)


@router.get("/")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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


@router.delete("/")
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = ChatHistoryService.get_chat_history(
        db=db,
        user_id=current_user.id,
        limit=100000,
    )

    deleted = len(history)

    for chat in history:
        db.delete(chat)

    db.commit()

    return {
        "status": "success",
        "message": "Chat history cleared successfully.",
        "deleted_records": deleted,
    }
    