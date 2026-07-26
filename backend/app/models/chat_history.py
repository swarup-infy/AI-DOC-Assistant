from __future__ import annotations

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ChatHistory(Base):
    """
    Chat history model.

    Stores conversations between a user and the AI assistant.
    Each conversation may optionally be associated with a specific
    uploaded document.
    """

    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    document_id = Column(
        Integer,
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    question = Column(
        Text,
        nullable=False,
    )

    answer = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="chat_history",
        lazy="selectin",
    )

    document = relationship(
        "Document",
        back_populates="chat_history",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<ChatHistory("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"document_id={self.document_id}"
            f")>"
        )