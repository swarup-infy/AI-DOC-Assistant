from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
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


@router.post("/")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    embedding_service = EmbeddingService()
    chroma_service = ChromaService()
    llm_service = LLMService()

    query_embedding = embedding_service.create_embeddings(
        [request.question]
    )[0]

    search_results = chroma_service.search(
        query_embedding=query_embedding,
        n_results=3,
    )

    documents = search_results.get("documents", [])

    if not documents or not documents[0]:
        return {
            "status": "success",
            "question": request.question,
            "answer": "No relevant information found in the uploaded documents.",
        }

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

    context = (
        "Previous Conversation:\n"
        + history
        + "\nRelevant Documents:\n\n"
        + "\n\n".join(documents[0])
    )

    answer = llm_service.generate_response(
        question=request.question,
        context=context,
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
        "retrieved_chunks": documents[0],
    }