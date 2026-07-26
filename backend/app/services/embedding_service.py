from __future__ import annotations

import threading

from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.core.logger import logger


class EmbeddingService:
    """
    Service responsible for generating sentence embeddings.

    The embedding model is loaded once and shared across the
    entire application (singleton pattern).
    """

    _model: SentenceTransformer | None = None
    _model_name: str | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        """
        Load the embedding model if it has not already been loaded.
        """

        if EmbeddingService._model is None:
            with EmbeddingService._lock:

                if EmbeddingService._model is None:
                    logger.info(
                        "Loading embedding model: %s",
                        settings.EMBEDDING_MODEL,
                    )

                    try:
                        EmbeddingService._model = (
                            SentenceTransformer(
                                settings.EMBEDDING_MODEL
                            )
                        )

                        EmbeddingService._model_name = (
                            settings.EMBEDDING_MODEL
                        )

                        logger.info(
                            "Embedding model loaded successfully."
                        )

                    except Exception:
                        logger.exception(
                            "Failed to load embedding model."
                        )
                        raise

        self.model = EmbeddingService._model

        if self.model is None:
            raise RuntimeError(
                "Embedding model failed to initialize."
            )

    def create_embeddings(
        self,
        chunks: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple text chunks.
        """

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
                "Ignored %s empty text chunks.",
                len(chunks) - len(cleaned_chunks),
            )

        try:
            logger.info(
                "Generating embeddings for %s chunks.",
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
            logger.exception(
                "Failed to generate embeddings."
            )
            raise

            
    def create_embedding(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding for a single piece of text.
        """

        if not text or not text.strip():
            return []

        embeddings = self.create_embeddings([text])

        return embeddings[0] if embeddings else []

    @property
    def dimension(self) -> int:
        """
        Return the embedding dimension.
        """

        if self.model is None:
            raise RuntimeError(
                "Embedding model is not initialized."
            )

        return self.model.get_sentence_embedding_dimension()

    @property
    def model_name(self) -> str:
        """
        Return the loaded model name.
        """

        return (
            EmbeddingService._model_name
            or settings.EMBEDDING_MODEL
        )

    @property
    def is_loaded(self) -> bool:
        """
        Check whether the embedding model has been loaded.
        """

        return self.model is not None

    def reload_model(self) -> None:
        """
        Reload the embedding model from configuration.

        Mainly useful for testing or when changing models.
        """

        with EmbeddingService._lock:

            logger.info(
                "Reloading embedding model: %s",
                settings.EMBEDDING_MODEL,
            )

            EmbeddingService._model = SentenceTransformer(
                settings.EMBEDDING_MODEL
            )

            EmbeddingService._model_name = (
                settings.EMBEDDING_MODEL
            )

            self.model = EmbeddingService._model

            logger.info(
                "Embedding model reloaded successfully."
            )        