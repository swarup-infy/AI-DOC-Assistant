from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


# ==========================================================
# Chat Request
# ==========================================================

class ChatRequest(BaseModel):
    """
    Chat request schema.
    """

    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User question.",
    )

    mode: Literal[
        "document",
        "gemini",
        "smart",
    ] = Field(
        default="document",
        description="Chat mode.",
    )

    document_id: int | None = Field(
        default=None,
        description="Optional document ID for document-specific chat.",
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Question cannot be empty."
            )

        return value


# ==========================================================
# Source Document
# ==========================================================

class SourceDocument(BaseModel):
    """
    Source used to generate the answer.
    """

    document_id: int

    filename: str

    page: int | None = None

    similarity: float | None = None


# ==========================================================
# Chat Response
# ==========================================================

class ChatResponse(BaseModel):
    """
    AI chat response.
    """

    status: str

    message: str

    answer: str

    mode: Literal[
        "document",
        "gemini",
        "smart",
    ]

    sources: list[SourceDocument] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Chat History
# ==========================================================

class ChatHistoryResponse(BaseModel):
    """
    Stored chat history.
    """

    id: int

    user_id: int

    document_id: int | None = None

    question: str

    answer: str

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        frozen=True,
    )


# ==========================================================
# Chat History List
# ==========================================================

class ChatHistoryListResponse(BaseModel):
    """
    List of chat history records.
    """

    history: list[ChatHistoryResponse]

    total: int

    model_config = ConfigDict(
        frozen=True,
    )