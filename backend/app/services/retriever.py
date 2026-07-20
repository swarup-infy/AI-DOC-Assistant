from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.services.embedding_service import EmbeddingService
from app.vector_db.chroma_service import ChromaService


class Retriever:
    """
    Retrieval service for semantic search.

    Responsibilities:
    - Embed the user query
    - Search ChromaDB
    - Remove duplicate chunks
    - Return ranked context
    - Build LLM-ready context from chunks
    """

    def __init__(self) -> None:
        self.embedding_service = EmbeddingService()
        self.chroma = ChromaService()

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """
        Retrieve the most relevant chunks.
        """

        if not query.strip():
            return []

        if top_k <= 0:
            logger.warning("retrieve() called with non-positive top_k=%d.", top_k)
            return []

        try:
            logger.info(
                "Retrieving context for query: %s",
                query,
            )

            query_embedding = self.embedding_service.create_embedding(query)

            results = self.chroma.search(
                query_embedding=query_embedding,
                n_results=top_k,
            )

            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            retrieved = []
            seen_keys = set()

            for document, metadata, distance in zip(
                documents,
                metadatas,
                distances,
            ):
                metadata = metadata or {}

                dedupe_key = (
                    metadata.get("document_id"),
                    metadata.get("chunk_index"),
                )
                if dedupe_key in seen_keys:
                    continue
                seen_keys.add(dedupe_key)

                similarity = 1.0 - float(distance)

                retrieved.append(
                    {
                        "text": document,
                        "metadata": metadata,
                        "score": similarity,
                        "distance": float(distance),
                    }
                )

            logger.info(
                "Retrieved %d unique chunks.",
                len(retrieved),
            )

            return retrieved

        except Exception:
            logger.exception("Retrieval failed.")
            raise

    def build_context_from_chunks(
        self,
        chunks: list[dict[str, Any]],
        include_source_labels: bool = True,
    ) -> str:
        """
        Build LLM-ready context from chunks already retrieved.

        Kept separate from retrieve() so callers that need both the
        raw chunks (e.g. for source metadata) and the formatted
        context string don't have to search twice.
        """

        if not chunks:
            return ""

        context = []

        for i, chunk in enumerate(chunks, start=1):

            if include_source_labels:
                metadata = chunk.get("metadata") or {}
                doc_name = metadata.get("document_name", "Unknown document")
                page = metadata.get("page")
                page_label = f", page {page}" if page is not None else ""
                header = f"[Source {i}: {doc_name}{page_label}]"
            else:
                header = f"[Source {i}]"

            context.append(f"{header}\n{chunk['text']}")

        return "\n\n".join(context)

    def build_context(
        self,
        query: str,
        top_k: int = 5,
        include_source_labels: bool = True,
    ) -> str:
        """
        Convenience wrapper: retrieve chunks and build context in one
        call. Prefer build_context_from_chunks() directly if you
        already have the chunks (e.g. from a prior retrieve() call)
        and want to avoid a duplicate search.
        """

        chunks = self.retrieve(
            query=query,
            top_k=top_k,
        )

        return self.build_context_from_chunks(
            chunks,
            include_source_labels=include_source_labels,
        )