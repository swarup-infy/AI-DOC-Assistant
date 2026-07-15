from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.exceptions import add_exception_handlers
from app.core.logger import logger
from app.db.database import Base, engine
from app.routes import (
    auth,
    upload,
    documents,
    chat,
    history,
    search,
    dashboard,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Document Assistant...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Stopping AI Document Assistant...")


app = FastAPI(
    title="AI Document Assistant API",
    version="1.0.0",
    description="Backend API for AI-powered document processing and RAG chatbot.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_exception_handlers(app)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(search.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "success",
        "message": "Welcome to AI Document Assistant API 🚀",
        "version": "1.0.0",
    }