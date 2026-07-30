from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.user import User


class ChatHistory(Base):
    """
    Persisted user/assistant chat interaction.

    A chat belongs to exactly one user and may optionally be associated
    with a document.

    Referential integrity and cascade deletion are enforced by the
    database foreign-key constraints.
    """

    __tablename__ = "chat_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
            name="chat_history_user_id_fkey",
        ),
        nullable=False,
        index=True,
    )

    document_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
            name="fk_chat_history_document_id",
        ),
        nullable=True,
        index=True,
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    mode: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="document",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="chat_history",
    )

    document: Mapped["Document | None"] = relationship(
        "Document",
        back_populates="chat_history",
    )

    def __repr__(self) -> str:
        return (
            f"<ChatHistory("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"document_id={self.document_id}, "
            f"mode={self.mode!r}"
            f")>"
        )