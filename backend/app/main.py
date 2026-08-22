from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import add_exception_handlers
from app.core.logger import logger

from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router
from app.routes.dashboard import router as dashboard_router
from app.routes.documents import router as document_router
from app.routes.history import router as history_router
from app.routes.search import router as search_router
from app.routes.upload import router as upload_router


# ==========================================================
# Application Lifespan
# ==========================================================


@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    """
    Manage application startup and shutdown.

    Run pending Alembic migrations before accepting requests.
    This keeps the deployed database schema synchronized with
    the application models.
    """

    logger.info(
        "Starting %s version %s...",
        settings.PROJECT_NAME,
        settings.VERSION,
    )

    try:
        logger.info("Running database migrations...")

        alembic_config = Config("alembic.ini")
        command.upgrade(
            alembic_config,
            "head",
        )

        logger.info(
            "Database migrations completed successfully."
        )

    except Exception:
        logger.exception(
            "Database migration failed during application startup."
        )
        raise

    logger.info(
        "Application started successfully."
    )

    try:
        yield

    finally:
        logger.info(
            "Application shutting down..."
        )


# ==========================================================
# Application
# ==========================================================


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Backend API for AI-powered document processing, "
        "semantic search, document management, and chat."
    ),
    lifespan=lifespan,
)


# ==========================================================
# Exception Handlers
# ==========================================================


add_exception_handlers(app)


# ==========================================================
# CORS
# ==========================================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# Health
# ==========================================================


@app.get(
    "/",
    tags=["Health"],
    summary="API status",
)
async def root() -> dict[str, str]:
    """
    Return basic API status information.
    """

    return {
        "status": "success",
        "message": (
            f"{settings.PROJECT_NAME} is running."
        ),
        "version": settings.VERSION,
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
)
async def health() -> dict[str, str]:
    """
    Return the application health status.
    """

    return {
        "status": "healthy",
    }


# ==========================================================
# Routers
# ==========================================================


app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(history_router)
app.include_router(dashboard_router)
