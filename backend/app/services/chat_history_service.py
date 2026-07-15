from sqlalchemy.orm import Session

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
        answer: str
    ):
        chat = ChatHistory(
            user_id=user_id,
            question=question,
            answer=answer
        )

        db.add(chat)
        db.commit()
        db.refresh(chat)

        return chat

    @staticmethod
    def get_chat_history(
        db: Session,
        user_id: int,
        limit: int = 5
    ):
        """
        Return the latest chat history for a user.
        """

        chats = (
            db.query(ChatHistory)
            .filter(ChatHistory.user_id == user_id)
            .order_by(ChatHistory.created_at.desc())
            .limit(limit)
            .all()
        )

        return list(reversed(chats))