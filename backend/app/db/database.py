from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    sessionmaker,
)

from app.core.config import settings
from app.core.logger import logger


# ==========================================================
# Declarative Base
# ==========================================================


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    """

    pass


# ==========================================================
# Database URL
# ==========================================================

DATABASE_URL = (
    settings.DATABASE_URL
    .get_secret_value()
    .strip()
)

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured."
    )


# ==========================================================
# SQLAlchemy Engine
# ==========================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_timeout=30,
    echo=settings.DEBUG,
)


# ==========================================================
# Session Factory
# ==========================================================

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ==========================================================
# FastAPI Database Dependency
# ==========================================================


def get_db() -> Generator[Session, None, None]:
    """
    Provide a SQLAlchemy session for a FastAPI request.

    A new session is created for each dependency invocation.

    If request processing raises an exception, any pending
    transaction is rolled back before the session is closed.
    """

    db = SessionLocal()

    try:
        yield db

    except Exception:
        db.rollback()

        logger.debug(
            "Database session rolled back after request failure."
        )

        raise

    finally:
        db.close()