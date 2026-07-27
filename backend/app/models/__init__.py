"""
SQLAlchemy ORM models package.

Individual models should be imported directly from their modules.

Examples:
    from app.models.user import User
    from app.models.document import Document
    from app.models.chat_history import ChatHistory

Model registration for SQLAlchemy metadata and Alembic is handled by
``app.db.base``.
"""

__all__: tuple[str, ...] = ()