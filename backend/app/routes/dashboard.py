from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardLastUpload,
    DashboardRecentChat,
    DashboardResponse,
    DashboardStatistics,
)
from app.services.dashboard_service import DashboardService


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/",
    response_model=DashboardResponse,
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
) -> DashboardResponse:
    """
    Return dashboard information belonging to the current user.

    Statistics and activity are always scoped to the authenticated
    user to prevent cross-user data exposure.
    """

    try:
        statistics = DashboardService.get_statistics(
            db=db,
            user_id=current_user.id,
        )

        latest_document = DashboardService.get_latest_document(
            db=db,
            user_id=current_user.id,
        )

        recent_chats = DashboardService.get_recent_chats(
            db=db,
            user_id=current_user.id,
        )

    except SQLAlchemyError as exc:
        logger.exception(
            "Unable to build dashboard. user_id=%d",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve dashboard data.",
        ) from exc

    last_upload = (
        DashboardLastUpload(
            filename=latest_document.filename,
            uploaded_at=latest_document.uploaded_at,
        )
        if latest_document is not None
        else None
    )

    return DashboardResponse(
        statistics=DashboardStatistics(
            **statistics,
        ),
        last_upload=last_upload,
        recent_chats=[
            DashboardRecentChat(
                question=chat.question,
                created_at=chat.created_at,
            )
            for chat in recent_chats
        ],
    )
