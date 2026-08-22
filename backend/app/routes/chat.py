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
from app.services.llm_service import LLMService


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"],
)


def _metadata_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        result = int(value)
    except (TypeError, ValueError, OverflowError):
        return None
    return result if result > 0 else None


def _metadata_string(value: Any) -> str | None:
    if value is None:
        return None
    result = str(value).strip()
    return result or None


def _build_search_filter(*, user_id: int, document_id: int | None) -> dict[str, Any]:
    if document_id is None:
        return {"user_id": user_id}
    return {
        "$and": [
            {"user_id": user_id},
            {"document_id": document_id},
        ]
    }


def _validate_document_access(
    db: Session,
    *,
    user_id: int,
    document_id: int | None,
) -> None:
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


def _cosine_distance_to_similarity(distance: float) -> float:
    similarity = 1.0 - distance
    return max(0.0, min(1.0, similarity))


def _extract_relevant_results(
    search_results: dict[str, Any],
) -> tuple[list[str], list[SourceDocument]]:
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
        if not document or index >= len(distance_values):
            continue

        try:
            distance = float(distance_values[index])
        except (TypeError, ValueError, OverflowError):
            continue

        similarity = _cosine_distance_to_similarity(distance)

        if similarity < settings.RAG_MIN_SIMILARITY:
            continue

        metadata: dict[str, Any] = {}
        if index < len(metadata_values) and isinstance(metadata_values[index], dict):
            metadata = metadata_values[index]

        document_id = _metadata_int(metadata.get("document_id"))
        filename = (
            _metadata_string(metadata.get("document_name"))
            or _metadata_string(metadata.get("filename"))
        )
        page = _metadata_int(metadata.get("page"))

        if document_id is None or filename is None:
            continue

        relevant_documents.append(document)
        source_key = (document_id, filename, page)

        if source_key not in seen_sources:
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


def _build_chat_history(
    db: Session,
    *,
    user_id: int,
    document_id: int | None,
) -> str:
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

    return "\n\n".join(
        f"User: {chat_item.question}\nAssistant: {chat_item.answer}"
        for chat_item in previous_chats
    )


def _build_rag_context(*, history: str, documents: list[str]) -> str:
    document_context = "\n\n".join(
        f"[Document Chunk {index}]\n{document}"
        for index, document in enumerate(documents, start=1)
    )

    context_parts = [
        "RETRIEVED DOCUMENT EVIDENCE\n"
        "===========================\n"
        f"{document_context}"
    ]

    if history:
        context_parts.append(
            "PREVIOUS CONVERSATION\n"
            "=====================\n"
            "Use this section only for conversational continuity. "
            "Do not treat it as evidence from the uploaded document.\n\n"
            f"{history}"
        )

    return "\n\n".join(context_parts)


def _save_chat(
    db: Session,
    *,
    user_id: int,
    question: str,
    answer: str,
    mode: ChatMode,
    document_id: int | None,
) -> None:
    ChatHistoryService.save_chat(
        db=db,
        user_id=user_id,
        question=question,
        answer=answer,
        mode=mode,
        document_id=document_id,
    )


def _generate_direct_response(*, llm_service: LLMService, question: str) -> str:
    return llm_service.generate_response(question=question, context="")


@router.post(
    "/",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with AI",
    description=(
        "Answer questions using uploaded documents, Groq directly, "
        "or smart retrieval with Groq fallback."
    ),
)
def chat(
    request: ChatRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ChatResponse:
    user_id = current_user.id
    document_id = request.document_id
    mode = request.mode

    logger.info(
        "Processing chat request. user_id=%d mode=%s document_id=%s",
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

        # Heavy ML/vector dependencies are imported only when RAG is requested.
        from app.services.embedding_service import EmbeddingService
        from app.vector_db.chroma_service import ChromaService

        embedding_service = EmbeddingService()
        embeddings = embedding_service.create_embeddings([request.question])

        if not embeddings:
            raise RuntimeError("Embedding service returned no query embedding.")

        search_filter = _build_search_filter(
            user_id=user_id,
            document_id=document_id,
        )

        chroma_service = ChromaService()
        search_results = chroma_service.search(
            query_embedding=embeddings[0],
            n_results=settings.RAG_TOP_K,
            where=search_filter,
        )

        relevant_documents, sources = _extract_relevant_results(search_results)

        if not relevant_documents:
            if mode == "smart":
                answer = _generate_direct_response(
                    llm_service=llm_service,
                    question=request.question,
                )
                message = (
                    "No sufficiently relevant document context was found. "
                    "Response generated using Groq."
                )
            else:
                answer = (
                    "I couldn't find sufficiently relevant information in "
                    "the uploaded documents to answer that question."
                )
                message = "No sufficiently relevant document context was found."

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

        history = _build_chat_history(
            db=db,
            user_id=user_id,
            document_id=document_id,
        )
        context = _build_rag_context(
            history=history,
            documents=relevant_documents,
        )
        answer = llm_service.generate_response(
            question=request.question,
            context=context,
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
            "Chat request failed. user_id=%d mode=%s document_id=%s",
            user_id,
            mode,
            document_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process chat request.",
        ) from exc
