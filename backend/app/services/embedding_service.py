from __future__ import annotations

import gc
import time
import threading

from fastembed import TextEmbedding

from app.core.config import settings
from app.core.logger import logger


# The old SentenceTransformers model is kept as a compatibility alias so
# an existing Render environment variable does not accidentally bring the
# heavyweight PyTorch stack back into production.
_LEGACY_MODEL_ALIASES = {
    "sentence-transformers/all-MiniLM-L6-v2": "BAAI/bge-small-en-v1.5",
}


class EmbeddingService:
    """
    Lightweight embedding service for production deployments.

    FastEmbed uses quantized ONNX models instead of PyTorch and
    SentenceTransformers, which dramatically reduces RAM usage on
    small instances such as Render's 512 MB free tier.

    The model is initialized once per application process and shared
    by all service instances.
    """

    _model: TextEmbedding | None = None
    _model_name: str | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._ensure_model_loaded()
        self.model = EmbeddingService._model

        if self.model is None:
            raise RuntimeError("Embedding model failed to initialize.")

    @classmethod
    def _resolve_model_name(cls) -> str:
        configured_name = settings.EMBEDDING_MODEL.strip()
        return _LEGACY_MODEL_ALIASES.get(
            configured_name,
            configured_name,
        )

    @classmethod
    def _ensure_model_loaded(cls) -> None:
        if cls._model is not None:
            return

        with cls._lock:
            if cls._model is not None:
                return

            model_name = cls._resolve_model_name()
            attempts = settings.EMBEDDING_LOAD_RETRIES
            last_error: Exception | None = None

            for attempt in range(1, attempts + 1):
                try:
                    logger.info(
                        "Loading lightweight embedding model '%s' "
                        "with FastEmbed (attempt %d/%d).",
                        model_name,
                        attempt,
                        attempts,
                    )

                    model = TextEmbedding(
                        model_name=model_name,
                        threads=1,
                        lazy_load=True,
                    )

                    cls._model = model
                    cls._model_name = model_name

                    logger.info(
                        "FastEmbed model initialized successfully. "
                        "dimension=%d.",
                        model.embedding_size,
                    )
                    return

                except Exception as exc:
                    last_error = exc
                    cls._model = None
                    cls._model_name = None

                    logger.exception(
                        "FastEmbed model initialization attempt %d/%d failed.",
                        attempt,
                        attempts,
                    )

                    gc.collect()

                    if attempt < attempts:
                        time.sleep(min(2**attempt, 6))

            raise RuntimeError(
                f"Unable to load embedding model '{model_name}' after "
                f"{attempts} attempts."
            ) from last_error

    @staticmethod
    def _clean_chunks(chunks: list[str]) -> list[str]:
        return [
            chunk.strip()
            for chunk in chunks
            if chunk and chunk.strip()
        ]

    def create_embeddings(self, chunks: list[str]) -> list[list[float]]:
        """Generate passage embeddings for document chunks."""

        if not chunks:
            return []

        cleaned_chunks = self._clean_chunks(chunks)

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
                "Generating FastEmbed passage embeddings for %d chunks.",
                len(cleaned_chunks),
            )

            vectors = self.model.passage_embed(
                cleaned_chunks,
                batch_size=settings.EMBEDDING_BATCH_SIZE,
                parallel=None,
            )

            return [
                vector.tolist()
                for vector in vectors
            ]

        except Exception:
            logger.exception("Failed to generate FastEmbed embeddings.")
            raise

    def create_embedding(self, text: str) -> list[float]:
        """Generate a query embedding for one search/chat query."""

        if not text or not text.strip():
            return []

        if self.model is None:
            raise RuntimeError("Embedding model is not initialized.")

        try:
            vectors = self.model.query_embed(
                text.strip(),
            )
            vector = next(iter(vectors), None)

            if vector is None:
                return []

            return vector.tolist()

        except Exception:
            logger.exception("Failed to generate FastEmbed query embedding.")
            raise

    @property
    def dimension(self) -> int:
        if self.model is None:
            raise RuntimeError("Embedding model is not initialized.")

        return self.model.embedding_size

    @property
    def model_name(self) -> str:
        return EmbeddingService._model_name or self._resolve_model_name()

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def reload_model(self) -> None:
        with self._lock:
            EmbeddingService._model = None
            EmbeddingService._model_name = None

        gc.collect()
        self._ensure_model_loaded()
        self.model = EmbeddingService._model

        if self.model is None:
            raise RuntimeError("Embedding model failed to reload.")
