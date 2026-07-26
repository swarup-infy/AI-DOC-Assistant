"""
Database model registry.

This module imports the SQLAlchemy Base and all application models.
It allows Alembic and other tools to discover every model by importing
a single module.
"""

from app.db.database import Base

# Import all models here so they are registered with SQLAlchemy metadata.
from app.models.chat_history import ChatHistory
from app.models.document import Document
from app.models.user import User

__all__ = (
    "Base",
    "User",
    "Document",
    "ChatHistory",
)