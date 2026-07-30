from __future__ import annotations

from typing import Final, Literal, cast

from sqlalchemy import delete, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.chat_history import ChatHistory


ChatMode = Literal[
    "document",
    "groq",
    "smart",
]

VALID_CHAT_MODES: Final[frozenset[str]] = frozenset(
    {
        "document",
        "groq",
        "smart",
    }
)

DEFAULT_HISTORY_LIMIT: Final[int] = 5
MAX_HISTORY_LIMIT: Final[int] = 100


class ChatHistoryService:
    """
    Service responsible for chat-history persistence and retrieval.

    All operations are scoped to a user and can optionally be scoped
    to a specific document.

    The service performs input validation, database operations,
    transaction rollback for failed writes, and structured logging.
    """

    # ==========================================================
    # Validation
    # ==========================================================

    @staticmethod
    def _validate_positive_int(
        value: int,
        *,
        field_name: str,
    ) -> None:
        if isinstance(value, bool) or not isinstance(value, int):
            raise TypeError(
                f"{field_name} must be an integer."
            )

        if value <= 0:
            raise ValueError(
                f"{field_name} must be greater than zero."
            )

    @classmethod
    def _validate_user_id(
        cls,
        user_id: int,
    ) -> None:
        cls._validate_positive_int(
            user_id,
            field_name="user_id",
        )

    @classmethod
    def _validate_document_id(
        cls,
        document_id: int | None,
    ) -> None:
        if document_id is None:
            return

        cls._validate_positive_int(
            document_id,
            field_name="document_id",
        )

    @classmethod
    def _validate_limit(
        cls,
        limit: int,
    ) -> int:
        cls._validate_positive_int(
            limit,
            field_name="limit",
        )

        return min(
            limit,
            MAX_HISTORY_LIMIT,
        )

    @staticmethod
    def _normalize_text(
        value: str,
        *,
        field_name: str,
    ) -> str:
        if not isinstance(value, str):
            raise TypeError(
                f"{field_name} must be a string."
            )

        normalized = value.strip()

        if not normalized:
            raise ValueError(
                f"{field_name} cannot be empty."
            )

        return normalized

    @staticmethod
    def _normalize_mode(
        mode: str,
    ) -> ChatMode:
        if not isinstance(mode, str):
            raise TypeError(
                "mode must be a string."
            )

        normalized = mode.strip().lower()

        if normalized not in VALID_CHAT_MODES:
            allowed_modes = ", ".join(
                sorted(VALID_CHAT_MODES)
            )

            raise ValueError(
                f"mode must be one of: {allowed_modes}."
            )

        return cast(
            ChatMode,
            normalized,
        )

    # ==========================================================
    # Save
    # ==========================================================

    @classmethod
    def save_chat(
        cls,
        db: Session,
        user_id: int,
        question: str,
        answer: str,
        mode: ChatMode,
        document_id: int | None = None,
    ) -> ChatHistory:
        """
        Persist a chat interaction.

        Returns:
            Persisted ChatHistory instance.

        Raises:
            TypeError:
                When an argument has an invalid type.

            ValueError:
                When an argument has an invalid value.

            SQLAlchemyError:
                When the database operation fails.
        """

        cls._validate_user_id(user_id)
        cls._validate_document_id(document_id)

        normalized_question = cls._normalize_text(
            question,
            field_name="question",
        )

        normalized_answer = cls._normalize_text(
            answer,
            field_name="answer",
        )

        normalized_mode = cls._normalize_mode(
            mode
        )

        chat = ChatHistory(
            user_id=user_id,
            document_id=document_id,
            question=normalized_question,
            answer=normalized_answer,
            mode=normalized_mode,
        )

        try:
            db.add(chat)
            db.commit()
            db.refresh(chat)

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Failed to save chat history. "
                "user_id=%d document_id=%s mode=%s",
                user_id,
                document_id,
                normalized_mode,
            )

            raise

        logger.info(
            "Chat history saved. "
            "chat_id=%d user_id=%d document_id=%s mode=%s",
            chat.id,
            user_id,
            document_id,
            normalized_mode,
        )

        return chat

    # ==========================================================
    # Retrieve
    # ==========================================================

    @classmethod
    def get_chat_history(
        cls,
        db: Session,
        user_id: int,
        limit: int = DEFAULT_HISTORY_LIMIT,
        document_id: int | None = None,
    ) -> list[ChatHistory]:
        """
        Return the user's most recent chat history.

        If document_id is supplied, only chats associated with that
        document are returned.

        Records are selected newest-first to correctly apply the
        limit, then returned oldest-to-newest for conversational
        context.
        """

        cls._validate_user_id(user_id)
        cls._validate_document_id(document_id)

        safe_limit = cls._validate_limit(
            limit
        )

        statement = select(
            ChatHistory
        ).where(
            ChatHistory.user_id == user_id
        )

        if document_id is not None:
            statement = statement.where(
                ChatHistory.document_id == document_id
            )

        statement = statement.order_by(
            ChatHistory.created_at.desc(),
            ChatHistory.id.desc(),
        ).limit(
            safe_limit
        )

        try:
            chats = list(
                db.scalars(statement).all()
            )

        except SQLAlchemyError:
            logger.exception(
                "Failed to retrieve chat history. "
                "user_id=%d document_id=%s limit=%d",
                user_id,
                document_id,
                safe_limit,
            )

            raise

        chats.reverse()

        return chats

    # ==========================================================
    # Delete
    # ==========================================================

    @classmethod
    def delete_chat_history(
        cls,
        db: Session,
        user_id: int,
        document_id: int | None = None,
    ) -> int:
        """
        Delete chat history belonging to a user.

        If document_id is supplied, only records associated with that
        document are deleted.

        Returns:
            Number of deleted records.
        """

        cls._validate_user_id(user_id)
        cls._validate_document_id(document_id)

        statement = delete(
            ChatHistory
        ).where(
            ChatHistory.user_id == user_id
        )

        if document_id is not None:
            statement = statement.where(
                ChatHistory.document_id == document_id
            )

        try:
            result = db.execute(statement)

            deleted_count = (
                result.rowcount
                if result.rowcount is not None
                else 0
            )

            db.commit()

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Failed to delete chat history. "
                "user_id=%d document_id=%s",
                user_id,
                document_id,
            )

            raise

        logger.info(
            "Chat history deleted. "
            "deleted_count=%d user_id=%d document_id=%s",
            deleted_count,
            user_id,
            document_id,
        )

        return deleted_count

    # ==========================================================
    # Count
    # ==========================================================

    @classmethod
    def count_chat_history(
        cls,
        db: Session,
        user_id: int,
        document_id: int | None = None,
    ) -> int:
        """
        Count chat-history records belonging to a user.

        If document_id is supplied, only records associated with that
        document are counted.
        """

        cls._validate_user_id(user_id)
        cls._validate_document_id(document_id)

        statement = select(
            func.count(ChatHistory.id)
        ).where(
            ChatHistory.user_id == user_id
        )

        if document_id is not None:
            statement = statement.where(
                ChatHistory.document_id == document_id
            )

        try:
            count = db.scalar(statement)

        except SQLAlchemyError:
            logger.exception(
                "Failed to count chat history. "
                "user_id=%d document_id=%s",
                user_id,
                document_id,
            )

            raise

        return int(
            count or 0
        )