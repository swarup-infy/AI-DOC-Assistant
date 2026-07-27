"""
Database package.

Database infrastructure is intentionally not imported here to avoid
side effects and circular imports during package initialization.

Use explicit imports instead:

    from app.db.database import Base, SessionLocal, engine, get_db

For SQLAlchemy and Alembic model registration:

    from app.db.base import Base
"""

__all__: tuple[str, ...] = ()