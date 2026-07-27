from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.services.embedding_service import EmbeddingService
from app.vector_db.chroma_service import ChromaService


DEFAULT_TOP_K = 5
MAX_TOP_K = 20


class Retriever:
    """
    Retrieval service for semantic document search.

    Responsibilities:
    - Embed user queries.
    - Search ChromaDB.
    - Enforce user-level isolation.
    - Optionally restrict retrieval to one document.
    - Remove duplicate chunks.
    - Return ranked retrieval results.
    - Build LLM-ready document context.
    """

    def __init__(self) -> None:
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    # ==========================================================
    # Retrieval
    # ==========================================================

    def retrieve(
        self,
        query: str,
        user_id: int,
        top_k: int = DEFAULT_TOP_K,
        document_id: int | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve relevant document chunks belonging to a user.

        When document_id is supplied, retrieval is restricted to
        that specific document.
        """

        if not isinstance(query, str):
            raise TypeError(
                "query must be a string."
            )

        normalized_query = query.strip()

        if not normalized_query:
            return []

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        if top_k <= 0:
            raise ValueError(
                "top_k must be greater than zero."
            )

        safe_top_k = min(
            top_k,
            MAX_TOP_K,
        )

        where = self._build_where_filter(
            user_id=user_id,
            document_id=document_id,
        )

        try:
            logger.info(
                "Retrieving document context. "
                "user_id=%d document_id=%s top_k=%d.",
                user_id,
                document_id,
                safe_top_k,
            )

            query_embedding = (
                self.embedding_service.create_embedding(
                    normalized_query
                )
            )

            if not query_embedding:
                logger.warning(
                    "Query embedding was empty. "
                    "user_id=%d.",
                    user_id,
                )
                return []

            results = self.chroma.search(
                query_embedding=query_embedding,
                n_results=safe_top_k,
                where=where,
            )

            retrieved = self._parse_results(
                results
            )

            logger.info(
                "Retrieved %d unique chunks. "
                "user_id=%d document_id=%s.",
                len(retrieved),
                user_id,
                document_id,
            )

            return retrieved

        except Exception:
            logger.exception(
                "Document retrieval failed. "
                "user_id=%d document_id=%s.",
                user_id,
                document_id,
            )
            raise

    # ==========================================================
    # Chroma Filter
    # ==========================================================

    @staticmethod
    def _build_where_filter(
        user_id: int,
        document_id: int | None,
    ) -> dict[str, Any]:
        """
        Build the ChromaDB metadata filter used for ownership
        and optional document isolation.
        """

        if document_id is None:
            return {
                "user_id": user_id,
            }

        return {
            "$and": [
                {
                    "user_id": user_id,
                },
                {
                    "document_id": document_id,
                },
            ]
        }

    # ==========================================================
    # Result Parsing
    # ==========================================================

    @staticmethod
    def _parse_results(
        results: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """
        Convert raw ChromaDB query output into normalized results.
        """

        documents_groups = (
            results.get("documents")
            or [[]]
        )

        metadata_groups = (
            results.get("metadatas")
            or [[]]
        )

        distance_groups = (
            results.get("distances")
            or [[]]
        )

        documents = (
            documents_groups[0]
            if documents_groups
            else []
        )

        metadatas = (
            metadata_groups[0]
            if metadata_groups
            else []
        )

        distances = (
            distance_groups[0]
            if distance_groups
            else []
        )

        retrieved: list[dict[str, Any]] = []
        seen_keys: set[tuple[Any, ...]] = set()

        for document, metadata, distance in zip(
            documents,
            metadatas,
            distances,
        ):
            if not isinstance(document, str):
                continue

            normalized_document = (
                document.strip()
            )

            if not normalized_document:
                continue

            metadata = (
                metadata
                if isinstance(metadata, dict)
                else {}
            )

            dedupe_key = (
                metadata.get("user_id"),
                metadata.get("document_id"),
                metadata.get("chunk_index"),
                normalized_document,
            )

            if dedupe_key in seen_keys:
                continue

            seen_keys.add(
                dedupe_key
            )

            try:
                normalized_distance = float(
                    distance
                )

            except (TypeError, ValueError):
                logger.warning(
                    "Ignoring retrieval result with "
                    "invalid distance value: %r.",
                    distance,
                )
                continue

            similarity = max(
                -1.0,
                min(
                    1.0,
                    1.0 - normalized_distance,
                ),
            )

            retrieved.append(
                {
                    "text": normalized_document,
                    "metadata": metadata,
                    "score": similarity,
                    "distance": normalized_distance,
                }
            )

        return retrieved

    # ==========================================================
    # Context Builder
    # ==========================================================

    def build_context_from_chunks(
        self,
        chunks: list[dict[str, Any]],
        include_source_labels: bool = True,
    ) -> str:
        """
        Build LLM-ready context from retrieved chunks.

        This method does not perform another vector search.
        """

        if not chunks:
            return ""

        context_sections: list[str] = []

        for index, chunk in enumerate(
            chunks,
            start=1,
        ):
            text = chunk.get(
                "text"
            )

            if not isinstance(text, str):
                continue

            text = text.strip()

            if not text:
                continue

            if include_source_labels:
                metadata = (
                    chunk.get("metadata")
                    or {}
                )

                document_name = metadata.get(
                    "document_name",
                    "Unknown document",
                )

                page = metadata.get(
                    "page"
                )

                if page is not None:
                    source_header = (
                        f"[Source {index}: "
                        f"{document_name}, "
                        f"page {page}]"
                    )
                else:
                    source_header = (
                        f"[Source {index}: "
                        f"{document_name}]"
                    )

            else:
                source_header = (
                    f"[Source {index}]"
                )

            context_sections.append(
                f"{source_header}\n{text}"
            )

        return "\n\n".join(
            context_sections
        )

    # ==========================================================
    # Convenience Context Retrieval
    # ==========================================================

    def build_context(
        self,
        query: str,
        user_id: int,
        top_k: int = DEFAULT_TOP_K,
        document_id: int | None = None,
        include_source_labels: bool = True,
    ) -> str:
        """
        Retrieve relevant chunks and build LLM-ready context.
        """

        chunks = self.retrieve(
            query=query,
            user_id=user_id,
            top_k=top_k,
            document_id=document_id,
        )

        return self.build_context_from_chunks(
            chunks=chunks,
            include_source_labels=include_source_labels,
        )