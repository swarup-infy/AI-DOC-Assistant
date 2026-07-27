from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    SourceDocument,
)
from app.services.chat_history_service import ChatHistoryService
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.vector_db.chroma_service import ChromaService


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"],
)


# ==========================================================
# Metadata Helpers
# ==========================================================


def _metadata_int(
    value: Any,
) -> int | None:
    """
    Convert ChromaDB metadata to a positive integer.
    """

    if value is None:
        return None

    try:
        result = int(value)
    except (TypeError, ValueError):
        return None

    if result <= 0:
        return None

    return result


def _metadata_string(
    value: Any,
) -> str | None:
    """
    Convert ChromaDB metadata to a non-empty string.
    """

    if value is None:
        return None

    result = str(value).strip()

    return result or None


# ==========================================================
# Similarity
# ==========================================================


def _cosine_distance_to_similarity(
    distance: float,
) -> float:
    """
    Convert Chroma cosine distance to normalized similarity.

    For cosine distance:

        distance = 1 - cosine_similarity

    Negative cosine similarity is treated as zero for the API
    response because SourceDocument exposes similarity in [0, 1].
    """

    similarity = 1.0 - distance

    return max(
        0.0,
        min(
            1.0,
            similarity,
        ),
    )


# ==========================================================
# Search Filter
# ==========================================================


def _build_search_filter(
    *,
    user_id: int,
    document_id: int | None,
) -> dict[str, Any]:
    """
    Build a ChromaDB ownership filter.

    Every retrieval is restricted to the authenticated user.
    When document_id is supplied, retrieval is further restricted
    to that specific document.
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
# Document Ownership
# ==========================================================


def _validate_document_access(
    db: Session,
    *,
    user_id: int,
    document_id: int | None,
) -> None:
    """
    Verify that a requested document belongs to the current user.

    A 404 response avoids exposing whether another user's document
    exists.
    """

    if document_id is None:
        return

    document = DocumentService.get_document_by_id(
        db=db,
        document_id=document_id,
        user_id=user_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )


# ==========================================================
# Retrieval Processing
# ==========================================================


def _extract_relevant_results(
    search_results: dict[str, Any],
) -> tuple[
    list[str],
    list[SourceDocument],
]:
    """
    Extract relevant chunks and source information from ChromaDB.

    Results below RAG_MIN_SIMILARITY are discarded.

    The returned document list contains only chunks that passed
    the configured similarity threshold.
    """

    documents = (
        search_results.get("documents")
        or [[]]
    )

    distances = (
        search_results.get("distances")
        or [[]]
    )

    metadatas = (
        search_results.get("metadatas")
        or [[]]
    )

    document_values = (
        documents[0]
        if documents
        else []
    )

    distance_values = (
        distances[0]
        if distances
        else []
    )

    metadata_values = (
        metadatas[0]
        if metadatas
        else []
    )

    relevant_documents: list[str] = []
    sources: list[SourceDocument] = []

    seen_sources: set[
        tuple[int, str, int | None]
    ] = set()

    for index, document in enumerate(
        document_values
    ):
        if not isinstance(document, str):
            continue

        document = document.strip()

        if not document:
            continue

        if index >= len(distance_values):
            continue

        try:
            distance = float(
                distance_values[index]
            )
        except (TypeError, ValueError):
            continue

        similarity = (
            _cosine_distance_to_similarity(
                distance
            )
        )

        logger.debug(
            "RAG candidate evaluated. "
            "distance=%.4f similarity=%.4f threshold=%.4f.",
            distance,
            similarity,
            settings.RAG_MIN_SIMILARITY,
        )

        if similarity < settings.RAG_MIN_SIMILARITY:
            continue

        metadata: dict[str, Any] = {}

        if index < len(metadata_values):
            raw_metadata = metadata_values[index]

            if isinstance(
                raw_metadata,
                dict,
            ):
                metadata = raw_metadata

        document_id = _metadata_int(
            metadata.get("document_id")
        )

        filename = _metadata_string(
            metadata.get("document_name")
        )

        if filename is None:
            filename = _metadata_string(
                metadata.get("filename")
            )

        page = _metadata_int(
            metadata.get("page")
        )

        if document_id is None or filename is None:
            logger.warning(
                "Skipping ChromaDB result with incomplete "
                "metadata. document_id=%s filename=%s.",
                document_id,
                filename,
            )
            continue

        relevant_documents.append(
            document
        )

        source_key = (
            document_id,
            filename,
            page,
        )

        if source_key in seen_sources:
            continue

        seen_sources.add(
            source_key
        )

        sources.append(
            SourceDocument(
                document_id=document_id,
                filename=filename,
                page=page,
                similarity=similarity,
            )
        )

    return relevant_documents, sources


# ==========================================================
# Chat History
# ==========================================================


def _build_chat_history(
    db: Session,
    *,
    user_id: int,
    document_id: int | None,
) -> str:
    """
    Build recent conversation history.

    When a document is selected, history is restricted to that
    document to prevent conversation context from leaking between
    different documents.
    """

    if settings.CHAT_HISTORY_LIMIT == 0:
        return ""

    previous_chats = (
        ChatHistoryService.get_chat_history(
            db=db,
            user_id=user_id,
            limit=settings.CHAT_HISTORY_LIMIT,
            document_id=document_id,
        )
    )

    if not previous_chats:
        return ""

    history_parts: list[str] = []

    for chat_item in previous_chats:
        history_parts.append(
            f"User: {chat_item.question}\n"
            f"Assistant: {chat_item.answer}"
        )

    return "\n\n".join(
        history_parts
    )


# ==========================================================
# RAG Context
# ==========================================================


def _build_rag_context(
    *,
    history: str,
    documents: list[str],
) -> str:
    """
    Build grounded context for the LLM.

    Retrieved evidence and previous conversation are explicitly
    separated so conversation history is not presented as source
    evidence.
    """

    document_context = "\n\n".join(
        (
            f"[Document Chunk {index}]\n"
            f"{document}"
        )
        for index, document in enumerate(
            documents,
            start=1,
        )
    )

    context_parts = [
        (
            "RETRIEVED DOCUMENT EVIDENCE\n"
            "===========================\n"
            f"{document_context}"
        )
    ]

    if history:
        context_parts.append(
            (
                "PREVIOUS CONVERSATION\n"
                "=====================\n"
                "Use this section only for conversational "
                "continuity. Do not treat it as evidence from "
                "the uploaded document.\n\n"
                f"{history}"
            )
        )

    return "\n\n".join(
        context_parts
    )


# ==========================================================
# Persistence
# ==========================================================


def _save_chat(
    db: Session,
    *,
    user_id: int,
    question: str,
    answer: str,
    document_id: int | None,
) -> None:
    """
    Persist a completed chat interaction.
    """

    ChatHistoryService.save_chat(
        db=db,
        user_id=user_id,
        question=question,
        answer=answer,
        document_id=document_id,
    )


# ==========================================================
# Direct Groq Response
# ==========================================================


def _generate_direct_response(
    *,
    llm_service: LLMService,
    question: str,
) -> str:
    """
    Generate a direct Groq response without document context.
    """

    return llm_service.generate_response(
        question=question,
        context="",
    )


# ==========================================================
# Chat Endpoint
# ==========================================================


@router.post(
    "/",
    response_model=ChatResponse,
    summary="Chat with AI",
    description=(
        "Answer questions using uploaded documents, "
        "Groq directly, or smart retrieval with Groq fallback."
    ),
)
def chat(
    request: ChatRequest,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ChatResponse:
    """
    Process an authenticated AI chat request.

    document:
        Search the authenticated user's documents and answer only
        when sufficiently relevant document evidence is found.

    groq:
        Generate a direct answer using the configured Groq model.

    smart:
        Search documents first. When sufficiently relevant evidence
        exists, use RAG. Otherwise fall back to direct Groq.
    """

    logger.info(
        "Processing chat request. "
        "user_id=%d mode=%s document_id=%s.",
        current_user.id,
        request.mode,
        request.document_id,
    )

    try:
        # ======================================================
        # Document Ownership
        # ======================================================

        _validate_document_access(
            db=db,
            user_id=current_user.id,
            document_id=request.document_id,
        )

        llm_service = LLMService()

        # ======================================================
        # Groq Mode
        # ======================================================

        if request.mode == "groq":
            answer = _generate_direct_response(
                llm_service=llm_service,
                question=request.question,
            )

            _save_chat(
                db=db,
                user_id=current_user.id,
                question=request.question,
                answer=answer,
                document_id=request.document_id,
            )

            return ChatResponse(
                status="success",
                message="Response generated successfully.",
                answer=answer,
                mode=request.mode,
                sources=[],
            )

        # ======================================================
        # Query Embedding
        # ======================================================

        embedding_service = (
            EmbeddingService()
        )

        embeddings = (
            embedding_service.create_embeddings(
                [request.question]
            )
        )

        if not embeddings:
            raise RuntimeError(
                "Embedding service returned no query embedding."
            )

        query_embedding = (
            embeddings[0]
        )

        # ======================================================
        # ChromaDB Retrieval
        # ======================================================

        search_filter = (
            _build_search_filter(
                user_id=current_user.id,
                document_id=request.document_id,
            )
        )

        chroma_service = (
            ChromaService()
        )

        search_results = (
            chroma_service.search(
                query_embedding=query_embedding,
                n_results=settings.RAG_TOP_K,
                where=search_filter,
            )
        )

        (
            relevant_documents,
            sources,
        ) = _extract_relevant_results(
            search_results
        )

        logger.info(
            "RAG retrieval completed. "
            "user_id=%d document_id=%s "
            "relevant_chunks=%d sources=%d.",
            current_user.id,
            request.document_id,
            len(relevant_documents),
            len(sources),
        )

        # ======================================================
        # No Relevant Evidence
        # ======================================================

        if not relevant_documents:

            # --------------------------------------------------
            # Smart -> Groq Fallback
            # --------------------------------------------------

            if request.mode == "smart":
                logger.info(
                    "No sufficiently relevant document context "
                    "found. Falling back to Groq. "
                    "user_id=%d document_id=%s.",
                    current_user.id,
                    request.document_id,
                )

                answer = (
                    _generate_direct_response(
                        llm_service=llm_service,
                        question=request.question,
                    )
                )

                _save_chat(
                    db=db,
                    user_id=current_user.id,
                    question=request.question,
                    answer=answer,
                    document_id=request.document_id,
                )

                return ChatResponse(
                    status="success",
                    message=(
                        "No sufficiently relevant document "
                        "context was found. Response generated "
                        "using Groq."
                    ),
                    answer=answer,
                    mode=request.mode,
                    sources=[],
                )

            # --------------------------------------------------
            # Document Mode
            # --------------------------------------------------

            answer = (
                "I couldn't find sufficiently relevant "
                "information in the uploaded documents "
                "to answer that question."
            )

            _save_chat(
                db=db,
                user_id=current_user.id,
                question=request.question,
                answer=answer,
                document_id=request.document_id,
            )

            return ChatResponse(
                status="success",
                message=(
                    "No sufficiently relevant document "
                    "context was found."
                ),
                answer=answer,
                mode=request.mode,
                sources=[],
            )

        # ======================================================
        # Conversation History
        # ======================================================

        history = (
            _build_chat_history(
                db=db,
                user_id=current_user.id,
                document_id=request.document_id,
            )
        )

        # ======================================================
        # RAG Context
        # ======================================================

        context = (
            _build_rag_context(
                history=history,
                documents=relevant_documents,
            )
        )

        # ======================================================
        # Grounded LLM Response
        # ======================================================

        answer = (
            llm_service.generate_response(
                question=request.question,
                context=context,
            )
        )

        # ======================================================
        # Persistence
        # ======================================================

        _save_chat(
            db=db,
            user_id=current_user.id,
            question=request.question,
            answer=answer,
            document_id=request.document_id,
        )

        # ======================================================
        # Response
        # ======================================================

        return ChatResponse(
            status="success",
            message=(
                "Response generated from document context."
            ),
            answer=answer,
            mode=request.mode,
            sources=sources,
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Chat request failed. "
            "user_id=%d mode=%s document_id=%s.",
            current_user.id,
            request.mode,
            request.document_id,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail="Unable to process chat request.",
        ) from exc