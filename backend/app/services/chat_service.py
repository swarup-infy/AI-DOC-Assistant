from __future__ import annotations

from typing import Any

from app.core.logger import logger
from app.services.llm_service import LLMService
from app.services.retriever import Retriever


class ChatService:
    """
    Orchestrates a chat turn: validates the question, retrieves
    relevant document context, calls the LLM, and returns the
    final response.

    Keeps business logic out of this layer — retrieval logic lives
    in Retriever, generation logic lives in LLMService. ChatService
    only sequences the calls between them.
    """

    DEFAULT_TOP_K = 5

    def __init__(self) -> None:
        self.retriever = Retriever()
        self.llm_service = LLMService()

    def ask(
        self,
        question: str,
        top_k: int = DEFAULT_TOP_K,
    ) -> dict[str, Any]:
        """
        Handle a single chat turn.

        Returns:
            {
                "answer": str,
                "sources": list[dict],  # metadata for cited chunks
            }
        """

        if not question or not question.strip():
            return {
                "answer": "Please enter a question.",
                "sources": [],
            }

        if top_k <= 0:
            logger.warning(
                "ask() called with non-positive top_k=%d; falling back to default.",
                top_k,
            )
            top_k = self.DEFAULT_TOP_K

        try:
            chunks = self.retriever.retrieve(
                query=question,
                top_k=top_k,
            )

            context = self.retriever.build_context_from_chunks(chunks)

            answer = self.llm_service.generate_response(
                question=question,
                context=context,
            )

            sources = [chunk.get("metadata", {}) for chunk in chunks]

            return {
                "answer": answer,
                "sources": sources,
            }

        except Exception:
            logger.exception(
                "Chat turn failed (question_length=%d).",
                len(question),
            )
            raise