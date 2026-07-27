from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.vector_db.chroma_service import ChromaService


router = APIRouter(
    prefix="/api/search",
    tags=["Search"],
)


# ==========================================================
# Request Schema
# ==========================================================


class SearchRequest(BaseModel):
    """
    Semantic search request.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Text to search for in the user's documents.",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of search results to return.",
    )

    document_id: int | None = Field(
        default=None,
        gt=0,
        description="Optional document ID to restrict the search.",
    )

    @field_validator("query")
    @classmethod
    def validate_query(
        cls,
        value: str,
    ) -> str:
        """
        Normalize and validate the search query.
        """

        value = value.strip()

        if not value:
            raise ValueError(
                "Search query cannot be empty."
            )

        return value

    model_config = ConfigDict(
        extra="forbid",
    )


# ==========================================================
# Response Schemas
# ==========================================================


class SearchResult(BaseModel):
    """
    One semantic search result.
    """

    text: str

    document_id: int | None = None

    document_name: str | None = None

    page: int | None = None

    chunk_index: int | None = None

    distance: float | None = None


class SearchResponse(BaseModel):
    """
    Semantic search response.
    """

    status: str

    query: str

    total_results: int

    results: list[SearchResult]


# ==========================================================
# Metadata Helpers
# ==========================================================


def _optional_int(
    value: Any,
) -> int | None:
    """
    Convert a metadata value to a positive integer when possible.
    """

    if value is None:
        return None

    try:
        result = int(value)

    except (TypeError, ValueError):
        return None

    return result if result > 0 else None


def _optional_string(
    value: Any,
) -> str | None:
    """
    Convert a metadata value to a non-empty string.
    """

    if value is None:
        return None

    result = str(value).strip()

    return result or None


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
    Verify that the requested document belongs to the current user.

    Return 404 when the document does not exist or belongs to
    another user. This avoids exposing document ownership details.
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
# Search Filter
# ==========================================================


def _build_search_filter(
    *,
    user_id: int,
    document_id: int | None,
) -> dict[str, Any]:
    """
    Build the ChromaDB ownership filter.

    Every search is restricted to the authenticated user.
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
# Route
# ==========================================================


@router.post(
    "/",
    response_model=SearchResponse,
    summary="Semantic document search",
    description=(
        "Search documents belonging to the authenticated user "
        "using vector similarity."
    ),
)
def semantic_search(
    request: SearchRequest,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> SearchResponse:
    """
    Perform an ownership-isolated semantic search.

    Searches are always restricted to vectors belonging to the
    authenticated user. When document_id is supplied, ownership
    is verified before the vector search is performed.
    """

    logger.info(
        "Processing semantic search. "
        "user_id=%d document_id=%s top_k=%d.",
        current_user.id,
        request.document_id,
        request.top_k,
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

        # ======================================================
        # Services
        # ======================================================

        embedding_service = EmbeddingService()
        chroma_service = ChromaService()

        # ======================================================
        # Query Embedding
        # ======================================================

        query_embedding = (
            embedding_service.create_embedding(
                request.query
            )
        )

        if not query_embedding:
            raise RuntimeError(
                "Embedding service returned no query embedding."
            )

        # ======================================================
        # Ownership Filter
        # ======================================================

        where = _build_search_filter(
            user_id=current_user.id,
            document_id=request.document_id,
        )

        # ======================================================
        # ChromaDB Search
        # ======================================================

        search_results = chroma_service.search(
            query_embedding=query_embedding,
            n_results=request.top_k,
            where=where,
        )

        documents = (
            search_results.get("documents")
            or [[]]
        )

        metadatas = (
            search_results.get("metadatas")
            or [[]]
        )

        distances = (
            search_results.get("distances")
            or [[]]
        )

        document_values = (
            documents[0]
            if documents
            else []
        )

        metadata_values = (
            metadatas[0]
            if metadatas
            else []
        )

        distance_values = (
            distances[0]
            if distances
            else []
        )

        # ======================================================
        # Response Construction
        # ======================================================

        results: list[SearchResult] = []

        for index, text in enumerate(
            document_values
        ):
            if not isinstance(text, str):
                continue

            text = text.strip()

            if not text:
                continue

            metadata: dict[str, Any] = {}

            if index < len(metadata_values):
                raw_metadata = metadata_values[index]

                if isinstance(
                    raw_metadata,
                    dict,
                ):
                    metadata = raw_metadata

            distance: float | None = None

            if index < len(distance_values):
                raw_distance = distance_values[index]

                if raw_distance is not None:
                    try:
                        distance = float(
                            raw_distance
                        )

                    except (TypeError, ValueError):
                        logger.warning(
                            "Ignoring invalid ChromaDB distance "
                            "at result index %d.",
                            index,
                        )

            results.append(
                SearchResult(
                    text=text,
                    document_id=_optional_int(
                        metadata.get("document_id")
                    ),
                    document_name=_optional_string(
                        metadata.get("document_name")
                    ),
                    page=_optional_int(
                        metadata.get("page")
                    ),
                    chunk_index=_optional_int(
                        metadata.get("chunk_index")
                    ),
                    distance=distance,
                )
            )

        logger.info(
            "Semantic search completed. "
            "user_id=%d document_id=%s results=%d.",
            current_user.id,
            request.document_id,
            len(results),
        )

        return SearchResponse(
            status="success",
            query=request.query,
            total_results=len(results),
            results=results,
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Semantic search failed. "
            "user_id=%d document_id=%s.",
            current_user.id,
            request.document_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform semantic search.",
        ) from exc