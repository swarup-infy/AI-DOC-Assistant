from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
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
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    chroma_collection = Column(
        String(255),
        nullable=False,
        default="documents",
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="documents",
    )