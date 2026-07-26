from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

"""
Database configuration.

This module provides:
- SQLAlchemy engine
- Session factory
- Declarative base
- FastAPI database dependency
"""

# ==========================================================
# Database Engine
# ==========================================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
    future=True,
)

# ==========================================================
# Session Factory
# ==========================================================

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# ==========================================================
# Declarative Base
# ==========================================================

Base = declarative_base()

# ==========================================================
# Database Dependency
# ==========================================================


def get_db() -> Generator[Session, None, None]:
    """
    Provide a database session for each request.

    The session is automatically closed after the request
    finishes, even if an exception occurs.
    """
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()