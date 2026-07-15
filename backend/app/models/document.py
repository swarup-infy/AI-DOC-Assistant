from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    file_type = Column(String, nullable=False)

    file_size = Column(Integer, nullable=False)

    chroma_collection = Column(
        String,
        nullable=False,
        default="documents"
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )