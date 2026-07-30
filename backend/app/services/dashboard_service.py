from __future__ import annotations

from typing import Final

from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.chat_history import ChatHistory
from app.models.document import Document
from app.services.chat_history_service import MAX_HISTORY_LIMIT


RECENT_CHAT_LIMIT: Final[int] = 5


class DashboardService:
    """
    Service responsible for retrieving dashboard statistics
    and recent activity.

    All queries are scoped to the authenticated user's ID.
    """

    # ==========================================================
    # Validation
    # ==========================================================

    @staticmethod
    def _validate_user_id(
        user_id: int,
    ) -> None:
        """
        Validate a user ID.
        """

        if isinstance(user_id, bool) or not isinstance(user_id, int):
            raise TypeError(
                "user_id must be an integer."
            )

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

    @staticmethod
    def _validate_limit(
        limit: int,
    ) -> int:
        """
        Validate and safely cap a dashboard query limit.
        """

        if isinstance(limit, bool) or not isinstance(limit, int):
            raise TypeError(
                "limit must be an integer."
            )

        if limit <= 0:
            raise ValueError(
                "limit must be greater than zero."
            )

        return min(
            limit,
            MAX_HISTORY_LIMIT,
        )

    # ==========================================================
    # Statistics
    # ==========================================================

    @classmethod
    def get_statistics(
        cls,
        db: Session,
        user_id: int,
    ) -> dict[str, int | float]:
        """
        Return aggregate document, chat, and storage statistics
        belonging to the user.
        """

        cls._validate_user_id(user_id)

        document_statement = select(
            func.count(Document.id),
            func.coalesce(
                func.sum(Document.file_size),
                0,
            ),
        ).where(
            Document.user_id == user_id
        )

        chat_statement = select(
            func.count(ChatHistory.id)
        ).where(
            ChatHistory.user_id == user_id
        )

        try:
            document_result = db.execute(
                document_statement
            ).one()

            total_chats = db.scalar(
                chat_statement
            )

        except SQLAlchemyError:
            logger.exception(
                "Failed to retrieve dashboard statistics. "
                "user_id=%d",
                user_id,
            )

            raise

        total_documents = int(
            document_result[0] or 0
        )

        storage_used_bytes = int(
            document_result[1] or 0
        )

        return {
            "total_documents": total_documents,
            "total_chats": int(total_chats or 0),
            "storage_used_bytes": storage_used_bytes,
            "storage_used_mb": round(
                storage_used_bytes / (1024 * 1024),
                2,
            ),
        }

    # ==========================================================
    # Latest Upload
    # ==========================================================

    @classmethod
    def get_latest_document(
        cls,
        db: Session,
        user_id: int,
    ) -> Document | None:
        """
        Return the user's most recently uploaded document.
        """

        cls._validate_user_id(user_id)

        statement = (
            select(Document)
            .where(
                Document.user_id == user_id
            )
            .order_by(
                Document.uploaded_at.desc(),
                Document.id.desc(),
            )
            .limit(1)
        )

        try:
            return db.scalars(
                statement
            ).first()

        except SQLAlchemyError:
            logger.exception(
                "Failed to retrieve latest dashboard document. "
                "user_id=%d",
                user_id,
            )

            raise

    # ==========================================================
    # Recent Chats
    # ==========================================================

    @classmethod
    def get_recent_chats(
        cls,
        db: Session,
        user_id: int,
        limit: int = RECENT_CHAT_LIMIT,
    ) -> list[ChatHistory]:
        """
        Return the user's most recent chat interactions.

        The requested limit is capped to the application's maximum
        history limit to protect the service from oversized queries.
        """

        cls._validate_user_id(user_id)

        safe_limit = cls._validate_limit(
            limit
        )

        statement = (
            select(ChatHistory)
            .where(
                ChatHistory.user_id == user_id
            )
            .order_by(
                ChatHistory.created_at.desc(),
                ChatHistory.id.desc(),
            )
            .limit(safe_limit)
        )

        try:
            return list(
                db.scalars(statement).all()
            )

        except SQLAlchemyError:
            logger.exception(
                "Failed to retrieve recent dashboard chats. "
                "user_id=%d limit=%d",
                user_id,
                safe_limit,
            )

            raise