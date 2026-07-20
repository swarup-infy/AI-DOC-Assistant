from __future__ import annotations

import threading
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

from app.core.config import settings
from app.core.logger import logger


class ChromaService:
    """
    Production-ready ChromaDB service.

    Features:
    - Thread-safe singleton client
    - Singleton collection
    - Logging
    - Error handling
    - Search
    - Add
    - Delete by IDs
    - Delete by document
    - Collection statistics
    """

    _client = None
    _collection: Collection | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:

        if ChromaService._client is None:

            with ChromaService._lock:

                if ChromaService._client is None:

                    logger.info(
                        "Initializing ChromaDB at %s",
                        settings.CHROMA_DB_DIR,
                    )

                    try:
                        ChromaService._client = chromadb.PersistentClient(
                            path=settings.CHROMA_DB_DIR,
                        )

                        collection_name = getattr(
                            settings, "CHROMA_COLLECTION_NAME", "documents"
                        )

                        ChromaService._collection = (
                            ChromaService._client.get_or_create_collection(
                                name=collection_name,
                                # Embeddings are normalized upstream
                                # (EmbeddingService), so cosine is the
                                # correct distance metric — Chroma's
                                # default is L2, which isn't guaranteed
                                # to rank identically.
                                metadata={"hnsw:space": "cosine"},
                            )
                        )

                        logger.info("ChromaDB initialized successfully.")

                    except Exception:
                        logger.exception("Failed to initialize ChromaDB.")
                        raise

        self.client = ChromaService._client
        self.collection = ChromaService._collection

    # -------------------------------------------------------
    # Insert
    # -------------------------------------------------------

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict] | None = None,
    ) -> None:

        if not ids:
            logger.warning("add_documents called with an empty ids list.")
            return

        lengths = {
            "ids": len(ids),
            "documents": len(documents),
            "embeddings": len(embeddings),
        }
        if metadatas is not None:
            lengths["metadatas"] = len(metadatas)

        if len(set(lengths.values())) > 1:
            raise ValueError(
                f"Mismatched lengths passed to add_documents: {lengths}"
            )

        try:

            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            logger.info(
                "Added %d document chunks to ChromaDB.",
                len(ids),
            )

        except Exception:
            logger.exception(
                "Failed to add documents to ChromaDB."
            )
            raise

    # -------------------------------------------------------
    # Search
    # -------------------------------------------------------

    def search(
        self,
        query_embedding: list[float],
        n_results: int = 5,
    ) -> dict[str, Any]:

        try:

            return self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=[
                    "documents",
                    "metadatas",
                    "distances",
                ],
            )

        except Exception:
            logger.exception(
                "ChromaDB search failed."
            )
            raise

    # -------------------------------------------------------
    # Delete by IDs
    # -------------------------------------------------------

    def delete_documents(
        self,
        ids: list[str],
    ) -> None:

        if not ids:
            return

        try:

            self.collection.delete(ids=ids)

            logger.info(
                "Deleted %d vectors.",
                len(ids),
            )

        except Exception:
            logger.exception(
                "Failed to delete vectors."
            )
            raise

    # -------------------------------------------------------
    # Delete by document
    # -------------------------------------------------------

    def delete_document_chunks(
        self,
        document_id: int,
    ) -> int:

        try:

            result = self.collection.get(
                where={
                    "document_id": document_id
                }
            )

            ids = result.get("ids", [])

            if ids:
                self.collection.delete(ids=ids)

            logger.info(
                "Deleted %d chunks for document %d.",
                len(ids),
                document_id,
            )

            return len(ids)

        except Exception:
            logger.exception(
                "Failed to delete document chunks."
            )
            raise

    # -------------------------------------------------------
    # Statistics
    # -------------------------------------------------------

    def count(self) -> int:

        return self.collection.count()

    def is_empty(self) -> bool:

        return self.count() == 0

    def collection_info(self) -> dict:

        return {
            "name": self.collection.name,
            "documents": self.collection.count(),
        }