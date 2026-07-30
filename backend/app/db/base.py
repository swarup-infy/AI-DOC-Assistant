"""
SQLAlchemy model registry.

This module exposes the shared declarative Base together with every
application ORM model.

Importing this module guarantees that all mapped classes are registered
with SQLAlchemy metadata, which is required by Alembic and other
metadata-aware tooling.
"""

from app.db.database import Base
from app.models import ChatHistory, Document, User


__all__ = (
    "Base",
    "User",
    "Document",
    "ChatHistory",
)