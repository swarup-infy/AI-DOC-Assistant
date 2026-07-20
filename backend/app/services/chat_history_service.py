from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.chat_history import ChatHistory


class ChatHistoryService:
    """
    Service for storing and retrieving chat history.
    """

    @staticmethod
    def save_chat(
        db: Session,
        user_id: int,
        question: str,
        answer: str,
    ) -> ChatHistory:
        """
        Save a chat conversation.
        """

        try:
            chat = ChatHistory(
                user_id=user_id,
                question=question,
                answer=answer,
            )

            db.add(chat)
            db.commit()
            db.refresh(chat)

            logger.info("Chat history saved (user_id=%s)", user_id)

            return chat

        except SQLAlchemyError:
            db.rollback()
            logger.exception(
                "Database error while saving chat history."
            )
            raise

    @staticmethod
    def get_chat_history(
        db: Session,
        user_id: int,
        limit: int = 5,
    ) -> list[ChatHistory]:
        """
        Return the latest chat history for a user.
        """

        try:
            chats = (
                db.query(ChatHistory)
                .filter(ChatHistory.user_id == user_id)
                .order_by(ChatHistory.created_at.desc())
                .limit(limit)
                .all()
            )

            return list(reversed(chats))

        except SQLAlchemyError:
            logger.exception(
                "Database error while fetching chat history."
            )
            raise