from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.services.llm_service import LLMService
from app.services.retriever import Retriever


class ChatService:
    """
    Orchestrate a single AI chat turn.

    Responsibilities:
    - Validate the user's question.
    - Retrieve document context belonging to the authenticated user.
    - Optionally restrict retrieval to one document.
    - Build LLM-ready RAG context.
    - Generate the final LLM response.
    - Return source metadata with the answer.

    Retrieval logic lives in Retriever.
    Generation logic lives in LLMService.
    """

    DEFAULT_TOP_K = 5
    MAX_TOP_K = 20

    def __init__(self) -> None:
        self.retriever = Retriever()
        self.llm_service = LLMService()

    def ask(
        self,
        question: str,
        user_id: int,
        top_k: int = DEFAULT_TOP_K,
        document_id: int | None = None,
    ) -> dict[str, Any]:
        """
        Handle a single document-grounded chat turn.

        Args:
            question:
                User's question.

            user_id:
                Authenticated user ID used to enforce vector
                ownership during retrieval.

            top_k:
                Maximum number of relevant chunks to retrieve.

            document_id:
                Optional document ID. When supplied, retrieval is
                restricted to that document.

        Returns:
            A dictionary containing the generated answer and
            metadata for the retrieved source chunks.
        """

        if not isinstance(question, str):
            raise TypeError(
                "question must be a string."
            )

        normalized_question = question.strip()

        if not normalized_question:
            return {
                "answer": "Please enter a question.",
                "sources": [],
            }

        if user_id <= 0:
            raise ValueError(
                "user_id must be greater than zero."
            )

        if document_id is not None and document_id <= 0:
            raise ValueError(
                "document_id must be greater than zero."
            )

        if top_k <= 0:
            logger.warning(
                "Invalid top_k=%d. Using default=%d.",
                top_k,
                self.DEFAULT_TOP_K,
            )

            top_k = self.DEFAULT_TOP_K

        safe_top_k = min(
            top_k,
            self.MAX_TOP_K,
        )

        try:
            logger.info(
                "Processing chat turn. "
                "user_id=%d document_id=%s "
                "question_length=%d top_k=%d.",
                user_id,
                document_id,
                len(normalized_question),
                safe_top_k,
            )

            chunks = self.retriever.retrieve(
                query=normalized_question,
                user_id=user_id,
                top_k=safe_top_k,
                document_id=document_id,
            )

            context = (
                self.retriever.build_context_from_chunks(
                    chunks=chunks,
                    include_source_labels=True,
                )
            )

            answer = (
                self.llm_service.generate_response(
                    question=normalized_question,
                    context=context,
                )
            )

            sources = [
                self._build_source(
                    chunk
                )
                for chunk in chunks
            ]

            logger.info(
                "Chat turn completed. "
                "user_id=%d document_id=%s sources=%d.",
                user_id,
                document_id,
                len(sources),
            )

            return {
                "answer": answer,
                "sources": sources,
            }

        except Exception:
            logger.exception(
                "Chat turn failed. "
                "user_id=%d document_id=%s "
                "question_length=%d.",
                user_id,
                document_id,
                len(normalized_question),
            )
            raise

    @staticmethod
    def _build_source(
        chunk: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Build safe source information from a retrieved chunk.
        """

        metadata = chunk.get(
            "metadata"
        )

        if not isinstance(metadata, dict):
            metadata = {}

        source = dict(
            metadata
        )

        score = chunk.get(
            "score"
        )

        distance = chunk.get(
            "distance"
        )

        if isinstance(
            score,
            (int, float),
        ):
            source["score"] = float(
                score
            )

        if isinstance(
            distance,
            (int, float),
        ):
            source["distance"] = float(
                distance
            )

        return source