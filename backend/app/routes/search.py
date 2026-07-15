from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.security import get_current_user
from app.models.user import User
from app.services.embedding_service import EmbeddingService
from app.vector_db.chroma_service import ChromaService

router = APIRouter(
    prefix="/api/search",
    tags=["Search"],
)


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/")
def semantic_search(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
):
    embedding_service = EmbeddingService()
    chroma_service = ChromaService()

    query_embedding = embedding_service.create_embeddings(
        [request.query]
    )[0]

    results = chroma_service.search(
        query_embedding=query_embedding,
        n_results=request.top_k,
    )

    documents = results.get("documents", [[]])[0]

    return {
        "status": "success",
        "query": request.query,
        "total_results": len(documents),
        "results": documents,
    }