from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.chat_history_service import ChatHistoryService
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.vector_db.chroma_service import ChromaService

router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"],
)


class ChatRequest(BaseModel):
    question: str
    mode: Literal["document", "gemini", "smart"] = "document"


SIMILARITY_THRESHOLD = 1.20


@router.post("/")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    embedding_service = EmbeddingService()
    chroma_service = ChromaService()
    llm_service = LLMService()

    # ============================================================
    # GEMINI MODE
    # ============================================================
    if request.mode == "gemini":

        answer = llm_service.generate_response(
            question=request.question,
            context="",
        )

        ChatHistoryService.save_chat(
            db=db,
            user_id=current_user.id,
            question=request.question,
            answer=answer,
        )

        return {
            "status": "success",
            "question": request.question,
            "answer": answer,
            "retrieved_chunks": [],
            "sources": [],
        }

    # ============================================================
    # CREATE QUERY EMBEDDING
    # ============================================================
    query_embedding = embedding_service.create_embeddings(
        [request.question]
    )[0]

    # ============================================================
    # SEARCH CHROMADB
    # ============================================================
    search_results = chroma_service.search(
        query_embedding=query_embedding,
        n_results=3,
    )

    documents = search_results.get("documents", [])
    distances = search_results.get("distances", [])
    metadatas = search_results.get("metadatas", [])

    relevant_documents = []
    sources = []
    seen_sources = set()

    if documents and distances and metadatas:

        for doc, distance, metadata in zip(
            documents[0],
            distances[0],
            metadatas[0],
        ):

            print(f"Distance = {distance}")

            if distance > SIMILARITY_THRESHOLD:
                continue

            relevant_documents.append(doc)

            if metadata:

                source = {
                    "document_name": metadata.get("document_name"),
                    "page": metadata.get("page"),
                }

                source_key = (
                    source["document_name"],
                    source["page"],
                )

                if source_key not in seen_sources:
                    seen_sources.add(source_key)
                    sources.append(source)

    # ============================================================
    # NO RELEVANT DOCUMENT FOUND
    # ============================================================
    if len(relevant_documents) == 0:

        # -----------------------
        # SMART MODE
        # -----------------------
        if request.mode == "smart":

            answer = llm_service.generate_response(
                question=request.question,
                context="",
            )

            ChatHistoryService.save_chat(
                db=db,
                user_id=current_user.id,
                question=request.question,
                answer=answer,
            )

            return {
                "status": "success",
                "question": request.question,
                "answer": answer,
                "retrieved_chunks": [],
                "sources": [],
            }

        # -----------------------
        # DOCUMENT MODE
        # -----------------------
        return {
            "status": "success",
            "question": request.question,
            "answer": "No relevant information found in the uploaded documents.",
            "retrieved_chunks": [],
            "sources": [],
        }

    # ============================================================
    # LOAD CHAT HISTORY
    # ============================================================
    previous_chats = ChatHistoryService.get_chat_history(
        db=db,
        user_id=current_user.id,
        limit=5,
    )

    history = ""

    for chat in previous_chats:

        history += (
            f"User: {chat.question}\n"
            f"Assistant: {chat.answer}\n\n"
        )

    # ============================================================
    # BUILD CONTEXT
    # ============================================================
    context = (
        "Previous Conversation:\n"
        + history
        + "\nRelevant Documents:\n\n"
        + "\n\n".join(relevant_documents)
    )

    # ============================================================
    # ASK LLM
    # ============================================================
    answer = llm_service.generate_response(
        question=request.question,
        context=context,
    )

    # ============================================================
    # SAVE CHAT
    # ============================================================
    ChatHistoryService.save_chat(
        db=db,
        user_id=current_user.id,
        question=request.question,
        answer=answer,
    )

    # ============================================================
    # RESPONSE
    # ============================================================
    return {
        "status": "success",
        "question": request.question,
        "answer": answer,
        "retrieved_chunks": relevant_documents,
        "sources": sources,
    }