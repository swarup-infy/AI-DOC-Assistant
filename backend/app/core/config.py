from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -------------------------
    # Project
    # -------------------------
    PROJECT_NAME: str = "AI Document Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # -------------------------
    # Database
    # -------------------------
    DATABASE_URL: str

    # -------------------------
    # JWT
    # -------------------------
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # -------------------------
    # AI
    # -------------------------
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHROMA_DB_DIR: str = "./app/vector_db"

    # -------------------------
    # File Upload
    # -------------------------
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024  # 20 MB

    # -------------------------
    # CORS
    # -------------------------
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()