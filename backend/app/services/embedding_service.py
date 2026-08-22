from __future__ import annotations

import gc
import time
import threading

from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.core.logger import logger


class EmbeddingService:
    """
    Service responsible for generating sentence embeddings.

    The model is loaded once per application process and shared by
    all EmbeddingService instances. Loading is protected by a lock
    because uploads can arrive concurrently.
    """

    _model: SentenceTransformer | None = None
    _model_name: str | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._ensure_model_loaded()
        self.model = EmbeddingService._model

        if self.model is None:
            raise RuntimeError("Embedding model failed to initialize.")

    @classmethod
    def _ensure_model_loaded(cls) -> None:
        if cls._model is not None:
            return

        with cls._lock:
            if cls._model is not None:
                return

            model_name = settings.EMBEDDING_MODEL
            attempts = settings.EMBEDDING_LOAD_RETRIES
            last_error: Exception | None = None

            for attempt in range(1, attempts + 1):
                try:
                    logger.info(
                        "Loading embedding model '%s' on %s (attempt %d/%d).",
                        model_name,
                        settings.EMBEDDING_DEVICE,
                        attempt,
                        attempts,
                    )

                    model = SentenceTransformer(
                        model_name,
                        device=settings.EMBEDDING_DEVICE,
                    )

                    cls._model = model
                    cls._model_name = model_name

                    logger.info(
                        "Embedding model loaded successfully. dimension=%d.",
                        model.get_embedding_dimension(),
                    )
                    return

                except Exception as exc:
                    last_error = exc
                    logger.exception(
                        "Embedding model load attempt %d/%d failed.",
                        attempt,
                        attempts,
                    )

                    cls._model = None
                    cls._model_name = None
                    gc.collect()

                    if attempt < attempts:
                        time.sleep(min(2**attempt, 8))

            raise RuntimeError(
                f"Unable to load embedding model '{model_name}' after "
                f"{attempts} attempts."
            ) from last_error

    def create_embeddings(self, chunks: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple text chunks."""

        if not chunks:
            return []

        cleaned_chunks = [
            chunk.strip()
            for chunk in chunks
            if chunk and chunk.strip()
        ]

        if not cleaned_chunks:
            return []

        if len(cleaned_chunks) != len(chunks):
            logger.warning(
                "Ignored %d empty text chunks.",
                len(chunks) - len(cleaned_chunks),
            )

        if self.model is None:
            raise RuntimeError("Embedding model is not initialized.")

        try:
            logger.info(
                "Generating embeddings for %d chunks.",
                len(cleaned_chunks),
            )

            embeddings = self.model.encode(
                cleaned_chunks,
                batch_size=settings.EMBEDDING_BATCH_SIZE,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )

            return embeddings.tolist()

        except Exception:
            logger.exception("Failed to generate embeddings.")
            raise

    def create_embedding(self, text: str) -> list[float]:
        """Generate an embedding for a single piece of text."""

        if not text or not text.strip():
            return []

        embeddings = self.create_embeddings([text])
        return embeddings[0] if embeddings else []

    @property
    def dimension(self) -> int:
        if self.model is None:
            raise RuntimeError("Embedding model is not initialized.")

        dimension = self.model.get_embedding_dimension()
        if dimension is None:
            raise RuntimeError("Unable to determine embedding dimension.")

        return dimension

    @property
    def model_name(self) -> str:
        return EmbeddingService._model_name or settings.EMBEDDING_MODEL

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def reload_model(self) -> None:
        with self._lock:
            EmbeddingService._model = None
            EmbeddingService._model_name = None

        self._ensure_model_loaded()
        self.model = EmbeddingService._model

        if self.model is None:
            raise RuntimeError("Embedding model failed to reload.")
