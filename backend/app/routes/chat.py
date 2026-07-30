from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, SourceDocument
from app.services.chat_history_service import ChatHistoryService, ChatMode
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


def _metadata_int(value: Any) -> int | None:
    """Convert metadata to a positive integer when possible."""

    if value is None or isinstance(value, bool):
        return None

    try:
        result = int(value)
    except (TypeError, ValueError, OverflowError):
        return None

    return result if result > 0 else None


def _metadata_string(value: Any) -> str | None:
    """Convert metadata to a non-empty normalized string."""

    if value is None:
        return None

    result = str(value).strip()
    return result or None


# ==========================================================
# Similarity
# ==========================================================


def _cosine_distance_to_similarity(distance: float) -> float:
    """
    Convert cosine distance to normalized similarity.

    Chroma cosine distance is typically:

        distance = 1 - cosine_similarity

    API similarity values are clamped to [0, 1].
    """

    similarity = 1.0 - distance

    return max(
        0.0,
        min(1.0, similarity),
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
    Build a Chroma ownership filter.

    Retrieval is always restricted to the authenticated user.
    """

    if document_id is None:
        return {
            "user_id": user_id,
        }

    return {
        "$and": [
            {"user_id": user_id},
            {"document_id": document_id},
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
    Ensure the requested document belongs to the current user.

    A 404 is intentionally returned for inaccessible documents to
    avoid revealing whether another user's document exists.
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
) -> tuple[list[str], list[SourceDocument]]:
    """
    Extract usable document chunks and source metadata.

    Results below the configured minimum similarity threshold are
    discarded.
    """

    documents = search_results.get("documents") or [[]]
    distances = search_results.get("distances") or [[]]
    metadatas = search_results.get("metadatas") or [[]]

    document_values = documents[0] if documents else []
    distance_values = distances[0] if distances else []
    metadata_values = metadatas[0] if metadatas else []

    relevant_documents: list[str] = []
    sources: list[SourceDocument] = []

    seen_sources: set[tuple[int, str, int | None]] = set()

    for index, raw_document in enumerate(document_values):
        if not isinstance(raw_document, str):
            continue

        document = raw_document.strip()

        if not document:
            continue

        if index >= len(distance_values):
            continue

        try:
            distance = float(distance_values[index])
        except (TypeError, ValueError, OverflowError):
            continue

        similarity = _cosine_distance_to_similarity(distance)

        logger.debug(
            "RAG candidate evaluated. "
            "distance=%.4f similarity=%.4f threshold=%.4f",
            distance,
            similarity,
            settings.RAG_MIN_SIMILARITY,
        )

        if similarity < settings.RAG_MIN_SIMILARITY:
            continue

        metadata: dict[str, Any] = {}

        if index < len(metadata_values):
            raw_metadata = metadata_values[index]

            if isinstance(raw_metadata, dict):
                metadata = raw_metadata

        document_id = _metadata_int(
            metadata.get("document_id")
        )

        filename = (
            _metadata_string(metadata.get("document_name"))
            or _metadata_string(metadata.get("filename"))
        )

        page = _metadata_int(
            metadata.get("page")
        )

        if document_id is None or filename is None:
            logger.warning(
                "Skipping RAG result with incomplete metadata. "
                "document_id=%s filename=%s",
                document_id,
                filename,
            )
            continue

        relevant_documents.append(document)

        source_key = (
            document_id,
            filename,
            page,
        )

        if source_key in seen_sources:
            continue

        seen_sources.add(source_key)

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
    """Build recent conversation context for the LLM."""

    if settings.CHAT_HISTORY_LIMIT <= 0:
        return ""

    previous_chats = ChatHistoryService.get_chat_history(
        db=db,
        user_id=user_id,
        limit=settings.CHAT_HISTORY_LIMIT,
        document_id=document_id,
    )

    if not previous_chats:
        return ""

    history_parts = [
        (
            f"User: {chat_item.question}\n"
            f"Assistant: {chat_item.answer}"
        )
        for chat_item in previous_chats
    ]

    return "\n\n".join(history_parts)


# ==========================================================
# RAG Context
# ==========================================================


def _build_rag_context(
    *,
    history: str,
    documents: list[str],
) -> str:
    """Build grounded document context for the LLM."""

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
                "Use this section only for conversational continuity. "
                "Do not treat it as evidence from the uploaded "
                "document.\n\n"
                f"{history}"
            )
        )

    return "\n\n".join(context_parts)


# ==========================================================
# Persistence
# ==========================================================


def _save_chat(
    db: Session,
    *,
    user_id: int,
    question: str,
    answer: str,
    mode: ChatMode,
    document_id: int | None,
) -> None:
    """Persist a successfully completed chat interaction."""

    ChatHistoryService.save_chat(
        db=db,
        user_id=user_id,
        question=question,
        answer=answer,
        mode=mode,
        document_id=document_id,
    )


# ==========================================================
# Direct LLM Response
# ==========================================================


def _generate_direct_response(
    *,
    llm_service: LLMService,
    question: str,
) -> str:
    """Generate a direct LLM response without document context."""

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
    status_code=status.HTTP_200_OK,
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
    """Process an authenticated AI chat request."""

    user_id = current_user.id
    document_id = request.document_id
    mode = request.mode

    logger.info(
        "Processing chat request. "
        "user_id=%d mode=%s document_id=%s",
        user_id,
        mode,
        document_id,
    )

    try:
        _validate_document_access(
            db=db,
            user_id=user_id,
            document_id=document_id,
        )

        llm_service = LLMService()

        # ======================================================
        # Groq Mode
        # ======================================================

        if mode == "groq":
            answer = _generate_direct_response(
                llm_service=llm_service,
                question=request.question,
            )

            _save_chat(
                db=db,
                user_id=user_id,
                question=request.question,
                answer=answer,
                mode=mode,
                document_id=document_id,
            )

            return ChatResponse(
                status="success",
                message="Response generated successfully.",
                answer=answer,
                mode=mode,
                sources=[],
            )

        # ======================================================
        # Query Embedding
        # ======================================================

        embedding_service = EmbeddingService()

        embeddings = embedding_service.create_embeddings(
            [request.question]
        )

        if not embeddings:
            raise RuntimeError(
                "Embedding service returned no query embedding."
            )

        query_embedding = embeddings[0]

        # ======================================================
        # Vector Retrieval
        # ======================================================

        search_filter = _build_search_filter(
            user_id=user_id,
            document_id=document_id,
        )

        chroma_service = ChromaService()

        search_results = chroma_service.search(
            query_embedding=query_embedding,
            n_results=settings.RAG_TOP_K,
            where=search_filter,
        )

        relevant_documents, sources = _extract_relevant_results(
            search_results
        )

        logger.info(
            "RAG retrieval completed. "
            "user_id=%d document_id=%s "
            "relevant_chunks=%d sources=%d",
            user_id,
            document_id,
            len(relevant_documents),
            len(sources),
        )

        # ======================================================
        # No Relevant Evidence
        # ======================================================

        if not relevant_documents:
            if mode == "smart":
                logger.info(
                    "No relevant document context found; "
                    "using direct LLM fallback. "
                    "user_id=%d document_id=%s",
                    user_id,
                    document_id,
                )

                answer = _generate_direct_response(
                    llm_service=llm_service,
                    question=request.question,
                )

                message = (
                    "No sufficiently relevant document context "
                    "was found. Response generated using Groq."
                )

            else:
                answer = (
                    "I couldn't find sufficiently relevant "
                    "information in the uploaded documents "
                    "to answer that question."
                )

                message = (
                    "No sufficiently relevant document "
                    "context was found."
                )

            _save_chat(
                db=db,
                user_id=user_id,
                question=request.question,
                answer=answer,
                mode=mode,
                document_id=document_id,
            )

            return ChatResponse(
                status="success",
                message=message,
                answer=answer,
                mode=mode,
                sources=[],
            )

        # ======================================================
        # Conversation History
        # ======================================================

        history = _build_chat_history(
            db=db,
            user_id=user_id,
            document_id=document_id,
        )

        # ======================================================
        # RAG Context
        # ======================================================

        context = _build_rag_context(
            history=history,
            documents=relevant_documents,
        )

        # ======================================================
        # Grounded LLM Response
        # ======================================================

        answer = llm_service.generate_response(
            question=request.question,
            context=context,
        )

        # ======================================================
        # Persistence
        # ======================================================

        _save_chat(
            db=db,
            user_id=user_id,
            question=request.question,
            answer=answer,
            mode=mode,
            document_id=document_id,
        )

        return ChatResponse(
            status="success",
            message="Response generated from document context.",
            answer=answer,
            mode=mode,
            sources=sources,
        )

    except HTTPException:
        raise

    except SQLAlchemyError as exc:
        logger.exception(
            "Database failure while processing chat request. "
            "user_id=%d mode=%s document_id=%s",
            user_id,
            mode,
            document_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process chat request.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Chat request failed. "
            "user_id=%d mode=%s document_id=%s",
            user_id,
            mode,
            document_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process chat request.",
        ) from exc