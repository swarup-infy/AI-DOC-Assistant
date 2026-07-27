from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import (
    Field,
    SecretStr,
    field_validator,
    model_validator,
)
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """
    Central application configuration.

    Settings are loaded from environment variables and the local
    `.env` file during development. Environment variables override
    values defined in `.env`.
    """

    # ==========================================================
    # Application
    # ==========================================================

    PROJECT_NAME: str = "AI Document Assistant"

    VERSION: str = "1.0.0"

    ENVIRONMENT: Literal[
        "development",
        "testing",
        "staging",
        "production",
    ] = "development"

    DEBUG: bool = False

    API_V1_STR: str = "/api"

    # ==========================================================
    # Database
    # ==========================================================

    DATABASE_URL: SecretStr

    # ==========================================================
    # Security / JWT
    # ==========================================================

    SECRET_KEY: SecretStr

    ALGORITHM: Literal[
        "HS256",
        "HS384",
        "HS512",
    ] = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        gt=0,
        le=1440,
    )

    # ==========================================================
    # Embeddings
    # ==========================================================

    EMBEDDING_MODEL: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    EMBEDDING_BATCH_SIZE: int = Field(
        default=32,
        gt=0,
        le=512,
    )

    # ==========================================================
    # Text Chunking
    # ==========================================================

    CHUNK_SIZE: int = Field(
        default=500,
        gt=0,
        le=10000,
    )

    CHUNK_OVERLAP: int = Field(
        default=100,
        ge=0,
        le=5000,
    )

    # ==========================================================
    # RAG / Retrieval
    # ==========================================================

    RAG_TOP_K: int = Field(
        default=5,
        gt=0,
        le=20,
    )

    RAG_MIN_SIMILARITY: float = Field(
        default=0.20,
        ge=0.0,
        le=1.0,
    )

    CHAT_HISTORY_LIMIT: int = Field(
        default=5,
        ge=0,
        le=50,
    )

    # ==========================================================
    # ChromaDB
    # ==========================================================

    CHROMA_DB_DIR: Path = Path(
        "./app/vector_db/chroma_data"
    )

    CHROMA_COLLECTION_NAME: str = "documents"

    # ==========================================================
    # LLM Provider
    # ==========================================================

    LLM_PROVIDER: Literal[
        "groq",
    ] = "groq"

    # ==========================================================
    # Groq
    # ==========================================================

    GROQ_API_KEY: SecretStr

    GROQ_MODEL: str = (
        "llama-3.3-70b-versatile"
    )

    GROQ_TEMPERATURE: float = Field(
        default=0.3,
        ge=0.0,
        le=2.0,
    )

    GROQ_MAX_OUTPUT_TOKENS: int = Field(
        default=1024,
        gt=0,
        le=32768,
    )

    GROQ_TOP_P: float = Field(
        default=0.95,
        gt=0.0,
        le=1.0,
    )

    # ==========================================================
    # File Upload
    # ==========================================================

    UPLOAD_DIR: Path = Path(
        "./uploads"
    )

    MAX_UPLOAD_SIZE: int = Field(
        default=20 * 1024 * 1024,
        gt=0,
    )

    # ==========================================================
    # Frontend
    # ==========================================================

    FRONTEND_URL: str = (
        "http://localhost:5173"
    )

    # ==========================================================
    # CORS
    # ==========================================================

    BACKEND_CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    # ==========================================================
    # Logging
    # ==========================================================

    LOG_LEVEL: Literal[
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
        "CRITICAL",
    ] = "INFO"

    LOG_DIR: Path = Path(
        "./logs"
    )

    # ==========================================================
    # String Normalization
    # ==========================================================

    @field_validator(
        "PROJECT_NAME",
        "VERSION",
        "EMBEDDING_MODEL",
        "CHROMA_COLLECTION_NAME",
        "GROQ_MODEL",
        mode="before",
    )
    @classmethod
    def normalize_required_string(
        cls,
        value: object,
    ) -> str:
        """
        Normalize required string settings and reject empty values.
        """

        if not isinstance(value, str):
            raise ValueError(
                "Setting must be a string."
            )

        normalized = value.strip()

        if not normalized:
            raise ValueError(
                "Setting cannot be empty."
            )

        return normalized

    @field_validator(
        "API_V1_STR",
        mode="before",
    )
    @classmethod
    def normalize_api_prefix(
        cls,
        value: object,
    ) -> str:
        """
        Normalize the API route prefix.
        """

        if not isinstance(value, str):
            raise ValueError(
                "API_V1_STR must be a string."
            )

        normalized = value.strip()

        if not normalized:
            raise ValueError(
                "API_V1_STR cannot be empty."
            )

        if not normalized.startswith("/"):
            normalized = f"/{normalized}"

        if len(normalized) > 1:
            normalized = normalized.rstrip("/")

        return normalized

    @field_validator(
        "FRONTEND_URL",
        mode="before",
    )
    @classmethod
    def normalize_frontend_url(
        cls,
        value: object,
    ) -> str:
        """
        Normalize the configured frontend URL.
        """

        if not isinstance(value, str):
            raise ValueError(
                "FRONTEND_URL must be a string."
            )

        normalized = value.strip().rstrip("/")

        if not normalized:
            raise ValueError(
                "FRONTEND_URL cannot be empty."
            )

        if not normalized.startswith(
            ("http://", "https://")
        ):
            raise ValueError(
                "FRONTEND_URL must use HTTP or HTTPS."
            )

        return normalized

    @field_validator(
        "BACKEND_CORS_ORIGINS",
        mode="after",
    )
    @classmethod
    def normalize_cors_origins(
        cls,
        origins: list[str],
    ) -> list[str]:
        """
        Normalize, validate, and deduplicate CORS origins.
        """

        normalized_origins: list[str] = []

        for origin in origins:
            normalized = origin.strip().rstrip("/")

            if not normalized:
                continue

            if not normalized.startswith(
                ("http://", "https://")
            ):
                raise ValueError(
                    "CORS origins must use HTTP or HTTPS."
                )

            if normalized not in normalized_origins:
                normalized_origins.append(
                    normalized
                )

        if not normalized_origins:
            raise ValueError(
                "BACKEND_CORS_ORIGINS cannot be empty."
            )

        return normalized_origins

    @field_validator(
        "CHROMA_DB_DIR",
        "UPLOAD_DIR",
        "LOG_DIR",
        mode="after",
    )
    @classmethod
    def normalize_directory(
        cls,
        value: Path,
    ) -> Path:
        """
        Normalize configured filesystem directories.
        """

        return value.expanduser()

    # ==========================================================
    # Cross-Field Validation
    # ==========================================================

    @model_validator(mode="after")
    def validate_settings(
        self,
    ) -> Settings:
        """
        Validate relationships and security-sensitive settings.
        """

        if self.CHUNK_OVERLAP >= self.CHUNK_SIZE:
            raise ValueError(
                "CHUNK_OVERLAP must be smaller than CHUNK_SIZE."
            )

        database_url = (
            self.DATABASE_URL
            .get_secret_value()
            .strip()
        )

        if not database_url:
            raise ValueError(
                "DATABASE_URL cannot be empty."
            )

        secret_key = (
            self.SECRET_KEY
            .get_secret_value()
            .strip()
        )

        if not secret_key:
            raise ValueError(
                "SECRET_KEY cannot be empty."
            )

        groq_api_key = (
            self.GROQ_API_KEY
            .get_secret_value()
            .strip()
        )

        if not groq_api_key:
            raise ValueError(
                "GROQ_API_KEY cannot be empty."
            )

        if (
            self.ENVIRONMENT == "production"
            and self.DEBUG
        ):
            raise ValueError(
                "DEBUG must be disabled in production."
            )

        if (
            self.ENVIRONMENT == "production"
            and len(secret_key) < 32
        ):
            raise ValueError(
                "SECRET_KEY must contain at least 32 characters "
                "in production."
            )

        return self

    # ==========================================================
    # Pydantic Settings
    # ==========================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        validate_default=True,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the cached application settings instance.
    """

    return Settings()


settings = get_settings()