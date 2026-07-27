from __future__ import annotations

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.chat_history import ChatHistory


DEFAULT_HISTORY_LIMIT = 5
MAX_HISTORY_LIMIT = 100


class ChatHistoryService:
    """
    Service layer for chat-history persistence and retrieval.

    Responsibilities:
    - Store user conversations.
    - Retrieve recent user conversations.
    - Optionally scope history to a document.
    - Delete user conversation history.
    - Handle database transaction failures safely.
    """

    # ==========================================================
    # Save
    # ==========================================================

    @staticmethod
    def save_chat(
        db: Session,
        user_id: int,
        question: str,
        answer: str,
        document_id: int | None = None,
    ) -> ChatHistory:
        """
        Persist a chat interaction.

        Args:
            db:
                Active SQLAlchemy session.

            user_id:
                Owner of the chat record.

            question:
                User's question.

            answer:
                Generated assistant response.

            document_id:
                Optional document associated with the interaction.

        Returns:
            The persisted ChatHistory model.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        normalized_question = question.strip()
        normalized_answer = answer.strip()

        if not normalized_question:
            raise ValueError(
                "question cannot be empty."
            )

        if not normalized_answer:
            raise ValueError(
                "answer cannot be empty."
            )

        try:
            chat = ChatHistory(
                user_id=user_id,
                document_id=document_id,
                question=normalized_question,
                answer=normalized_answer,
            )

            db.add(chat)
            db.commit()
            db.refresh(chat)

            logger.info(
                "Chat history saved. "
                "chat_id=%d user_id=%d document_id=%s.",
                chat.id,
                user_id,
                document_id,
            )

            return chat

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Database error while saving chat history "
                "for user %d.",
                user_id,
            )

            raise

    # ==========================================================
    # Retrieve
    # ==========================================================

    @staticmethod
    def get_chat_history(
        db: Session,
        user_id: int,
        limit: int = DEFAULT_HISTORY_LIMIT,
        document_id: int | None = None,
    ) -> list[ChatHistory]:
        """
        Return recent chat history belonging to a user.

        When document_id is supplied, only conversations associated
        with that document are returned.

        Results are returned oldest-to-newest so they can be passed
        directly into conversational LLM context.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        if limit <= 0:
            raise ValueError(
                "limit must be greater than zero."
            )

        safe_limit = min(
            limit,
            MAX_HISTORY_LIMIT,
        )

        try:
            query = (
                db.query(ChatHistory)
                .filter(
                    ChatHistory.user_id == user_id
                )
            )

            if document_id is not None:
                query = query.filter(
                    ChatHistory.document_id
                    == document_id
                )

            chats = (
                query
                .order_by(
                    ChatHistory.created_at.desc(),
                    ChatHistory.id.desc(),
                )
                .limit(safe_limit)
                .all()
            )

            return list(
                reversed(chats)
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while fetching chat history "
                "for user %d.",
                user_id,
            )

            raise

    # ==========================================================
    # Delete
    # ==========================================================

    @staticmethod
    def delete_chat_history(
        db: Session,
        user_id: int,
        document_id: int | None = None,
    ) -> int:
        """
        Delete chat history belonging to a user.

        When document_id is supplied, only history associated with
        that document is deleted.

        Returns:
            Number of deleted records.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        try:
            query = (
                db.query(ChatHistory)
                .filter(
                    ChatHistory.user_id == user_id
                )
            )

            if document_id is not None:
                query = query.filter(
                    ChatHistory.document_id
                    == document_id
                )

            deleted_count = query.delete(
                synchronize_session=False
            )

            db.commit()

            logger.info(
                "Deleted %d chat history records. "
                "user_id=%d document_id=%s.",
                deleted_count,
                user_id,
                document_id,
            )

            return deleted_count

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Database error while deleting chat history "
                "for user %d.",
                user_id,
            )

            raise

    # ==========================================================
    # Count
    # ==========================================================

    @staticmethod
    def count_chat_history(
        db: Session,
        user_id: int,
        document_id: int | None = None,
    ) -> int:
        """
        Count chat records belonging to a user.

        Optionally restrict the count to one document.
        """

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        try:
            query = (
                db.query(ChatHistory)
                .filter(
                    ChatHistory.user_id == user_id
                )
            )

            if document_id is not None:
                query = query.filter(
                    ChatHistory.document_id
                    == document_id
                )

            return query.count()

        except SQLAlchemyError:
            logger.exception(
                "Database error while counting chat history "
                "for user %d.",
                user_id,
            )

            raise