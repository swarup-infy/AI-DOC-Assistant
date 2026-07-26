from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration.

    All settings are loaded from the .env file and can be overridden
    by environment variables.
    """

    # ==========================================================
    # Project
    # ==========================================================

    PROJECT_NAME: str = "AI Document Assistant"

    VERSION: str = "1.0.0"

    API_V1_STR: str = "/api"

    ENVIRONMENT: str = "development"

    DEBUG: bool = False

    # ==========================================================
    # Database
    # ==========================================================

    DATABASE_URL: str

    # ==========================================================
    # Security / JWT
    # ==========================================================

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        gt=0,
    )

    # ==========================================================
    # AI / Embeddings
    # ==========================================================

    EMBEDDING_MODEL: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    EMBEDDING_BATCH_SIZE: int = Field(
        default=32,
        gt=0,
    )

    # ==========================================================
    # Text Chunking
    # ==========================================================

    CHUNK_SIZE: int = Field(
        default=500,
        gt=0,
    )

    CHUNK_OVERLAP: int = Field(
        default=100,
        ge=0,
    )

    # ==========================================================
    # ChromaDB
    # ==========================================================

    CHROMA_DB_DIR: Path = Path("./app/vector_db")

    CHROMA_COLLECTION_NAME: str = "documents"

    # ==========================================================
    # LLM Provider
    # ==========================================================

    LLM_PROVIDER: str = "groq"

    # ==========================================================
    # Gemini
    # ==========================================================

    GEMINI_API_KEY: str = ""

    GEMINI_MODEL: str = "gemini-2.5-flash"

    GEMINI_TEMPERATURE: float = Field(
        default=0.3,
        ge=0.0,
        le=2.0,
    )

    GEMINI_MAX_OUTPUT_TOKENS: int = Field(
        default=1024,
        gt=0,
    )

    GEMINI_TOP_P: float = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
    )

    # ==========================================================
    # Groq
    # ==========================================================

    GROQ_API_KEY: str = ""

    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    GROQ_TEMPERATURE: float = Field(
        default=0.3,
        ge=0.0,
        le=2.0,
    )

    GROQ_MAX_OUTPUT_TOKENS: int = Field(
        default=1024,
        gt=0,
    )

    GROQ_TOP_P: float = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
    )

    # ==========================================================
    # File Upload
    # ==========================================================

    UPLOAD_DIR: Path = Path("./uploads")

    MAX_UPLOAD_SIZE: int = Field(
        default=20 * 1024 * 1024,
        gt=0,
    )

    # ==========================================================
    # Frontend
    # ==========================================================

    FRONTEND_URL: str = "http://localhost:5173"

    # ==========================================================
    # CORS
    # ==========================================================

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # ==========================================================
    # Pydantic Settings
    # ==========================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return a cached Settings instance.
    """
    return Settings()


settings = get_settings()