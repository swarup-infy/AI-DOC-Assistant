"""
Application SQLAlchemy ORM model registry.

Importing ``app.models`` registers every ORM model with the shared
SQLAlchemy declarative registry. This allows string-based relationship
targets such as ``"Document"`` and ``"ChatHistory"`` to be resolved
reliably during mapper configuration.

Alembic and application startup may import this package when complete
model registration is required.
"""

from app.models.chat_history import ChatHistory
from app.models.document import Document
from app.models.user import User


__all__ = (
    "User",
    "Document",
    "ChatHistory",
)