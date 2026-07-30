from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.chat import (
    ChatHistoryListResponse,
    ChatHistoryResponse,
    ClearChatHistoryResponse,
)
from app.services.chat_history_service import (
    DEFAULT_HISTORY_LIMIT,
    MAX_HISTORY_LIMIT,
    ChatHistoryService,
)


router = APIRouter(
    prefix="/api/history",
    tags=["Chat History"],
)


# ==========================================================
# Get Chat History
# ==========================================================


@router.get(
    "/",
    response_model=ChatHistoryListResponse,
    summary="Get chat history",
    description=(
        "Return chat history belonging to the authenticated user. "
        "Results may optionally be restricted to one document."
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
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=MAX_HISTORY_LIMIT,
            description="Maximum number of chat records to return.",
        ),
    ] = DEFAULT_HISTORY_LIMIT,
    document_id: Annotated[
        int | None,
        Query(
            gt=0,
            description=(
                "Optional document ID used to restrict history "
                "to one document."
            ),
        ),
    ] = None,
) -> ChatHistoryListResponse:
    """
    Retrieve recent chat history belonging to the current user.

    The service enforces user ownership and returns records in
    chronological order.
    """

    history = ChatHistoryService.get_chat_history(
        db=db,
        user_id=current_user.id,
        limit=limit,
        document_id=document_id,
    )

    return ChatHistoryListResponse(
        total=len(history),
        history=[
            ChatHistoryResponse.model_validate(chat)
            for chat in history
        ],
    )


# ==========================================================
# Clear Chat History
# ==========================================================


@router.delete(
    "/",
    response_model=ClearChatHistoryResponse,
    summary="Clear chat history",
    description=(
        "Delete chat history belonging to the authenticated user. "
        "Deletion may optionally be restricted to one document."
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
    document_id: Annotated[
        int | None,
        Query(
            gt=0,
            description=(
                "Optional document ID used to clear history "
                "for one document only."
            ),
        ),
    ] = None,
) -> ClearChatHistoryResponse:
    """
    Delete chat history belonging to the current user.

    When document_id is supplied, only history associated with
    that document is removed.
    """

    deleted_records = ChatHistoryService.delete_chat_history(
        db=db,
        user_id=current_user.id,
        document_id=document_id,
    )

    return ClearChatHistoryResponse(
        message="Chat history cleared successfully.",
        deleted_records=deleted_records,
    )