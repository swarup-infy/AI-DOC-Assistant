from __future__ import annotations

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Document(Base):
    """
    Document model.

    Stores metadata for uploaded documents.

    The actual file is stored on disk while embeddings are stored
    in ChromaDB. This table maintains the metadata linking all
    parts of the document pipeline.
    """

    __tablename__ = "documents"

    __table_args__ = (
        Index(
            "uq_documents_user_id_filename_lower",
            "user_id",
            func.lower(Column("filename")),
            unique=True,
        ),
    )

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

    filename = Column(
        String(255),
        nullable=False,
    )

    file_path = Column(
        String(500),
        nullable=False,
    )

    file_type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    chroma_collection = Column(
        String(255),
        nullable=False,
        default="documents",
        server_default="documents",
    )

    uploaded_at = Column(
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
        back_populates="documents",
        lazy="selectin",
    )

    chat_history = relationship(
        "ChatHistory",
        back_populates="document",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Document("
            f"id={self.id}, "
            f"filename={self.filename!r}, "
            f"user_id={self.user_id}"
            f")>"
        )