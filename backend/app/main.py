from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logger import logger

# Import all routers
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router
from app.routes.dashboard import router as dashboard_router
from app.routes.document import router as document_router
from app.routes.history import router as history_router
from app.routes.search import router as search_router
from app.routes.upload import router as upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """
    logger.info("======================================")
    logger.info("Starting AI Document Assistant API...")
    logger.info("Application started successfully.")
    logger.info("======================================")

    yield

    logger.info("======================================")
    logger.info("Shutting down AI Document Assistant...")
    logger.info("Application stopped.")
    logger.info("======================================")


app = FastAPI(
    title="AI Document Assistant API",
    description="Backend API for AI-powered document processing, semantic search, and chat.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "success",
        "message": "AI Document Assistant API is running."
    }


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy"
    }


# Register Routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(history_router)
app.include_router(dashboard_router)