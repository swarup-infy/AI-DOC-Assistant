from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import add_exception_handlers
from app.core.logger import logger
from app.db.database import Base, engine

# Import all models before create_all()
from app.db.base import *

# Routers
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router
from app.routes.dashboard import router as dashboard_router
from app.routes.documents import router as document_router
from app.routes.history import router as history_router
from app.routes.search import router as search_router
from app.routes.upload import router as upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """

    logger.info("Starting %s...", settings.PROJECT_NAME)

    # Create tables automatically.
    # Remove this line if using Alembic migrations.
    Base.metadata.create_all(bind=engine)

    logger.info("Application started successfully.")

    yield

    logger.info("Application shutting down...")


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


@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint.
    """

    return {
        "status": "success",
        "message": f"{settings.PROJECT_NAME} is running.",
        "version": settings.VERSION,
    }


@app.get("/health", tags=["Health"])
async def health():
    """
    Health check endpoint.
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