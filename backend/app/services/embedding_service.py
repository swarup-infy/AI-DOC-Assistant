from __future__ import annotations

import threading
from typing import List

from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.core.logger import logger


class EmbeddingService:
    """
    Service responsible for generating sentence embeddings.
    The model is loaded only once (singleton) and reused
    throughout the application's lifetime.
    """

    _model: SentenceTransformer | None = None
    _model_name: str | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        if EmbeddingService._model is None:
            with EmbeddingService._lock:
                # Re-check inside the lock in case another thread
                # finished loading while we were waiting for it.
                if EmbeddingService._model is None:
                    logger.info(
                        "Loading embedding model: %s",
                        settings.EMBEDDING_MODEL,
                    )
                    try:
                        EmbeddingService._model = SentenceTransformer(
                            settings.EMBEDDING_MODEL
                        )
                        EmbeddingService._model_name = settings.EMBEDDING_MODEL
                        logger.info("Embedding model loaded successfully.")
                    except Exception:
                        logger.exception("Failed to load embedding model.")
                        raise

        self.model = EmbeddingService._model

    def create_embeddings(
        self,
        chunks: List[str],
    ) -> List[List[float]]:
        """
        Convert multiple text chunks into embeddings.
        """
        if not chunks:
            return []

        empty_count = sum(1 for c in chunks if not c or not c.strip())
        if empty_count:
            logger.warning(
                "%d of %d chunks are empty/whitespace; embeddings for "
                "these will be low-signal.",
                empty_count,
                len(chunks),
            )

        try:
            logger.info(
                "Generating embeddings for %d chunks.",
                len(chunks),
            )
            embeddings = self.model.encode(
                chunks,
                batch_size=32,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            return embeddings.tolist()
        except Exception:
            logger.exception("Failed to generate embeddings.")
            raise

    def create_embedding(
        self,
        text: str,
    ) -> List[float]:
        """
        Generate an embedding for a single piece of text.
        """
        result = self.create_embeddings([text])
        return result[0] if result else []

    @property
    def dimension(self) -> int:
        """
        Return embedding dimension.
        """
        return self.model.get_sentence_embedding_dimension()

    @property
    def model_name(self) -> str:
        """
        Return the name of the model that is actually loaded
        (captured at load time, not re-read from live settings).
        """
        return EmbeddingService._model_name or settings.EMBEDDING_MODEL