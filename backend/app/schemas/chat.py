from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


ChatMode = Literal["document", "groq", "smart"]


# ==========================================================
# Chat Request
# ==========================================================


class ChatRequest(BaseModel):
    """
    Request payload for AI chat.

    Modes:
    - document: Answer using uploaded document context.
    - groq: Answer directly using the configured Groq LLM.
    - smart: Use document context when relevant and Groq otherwise.
    """

    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User question.",
    )

    mode: ChatMode = Field(
        default="document",
        description="Chat processing mode.",
    )

    document_id: int | None = Field(
        default=None,
        gt=0,
        description=(
            "Optional document ID used to restrict chat "
            "to a specific uploaded document."
        ),
    )

    @field_validator("question")
    @classmethod
    def validate_question(
        cls,
        value: str,
    ) -> str:
        """
        Normalize and validate the user question.
        """

        value = value.strip()

        if not value:
            raise ValueError("Question cannot be empty.")

        return value

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Source Document
# ==========================================================


class SourceDocument(BaseModel):
    """
    Document source used to generate an AI response.
    """

    document_id: int = Field(
        ...,
        gt=0,
    )

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    page: int | None = Field(
        default=None,
        ge=1,
    )

    similarity: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    @field_validator("filename")
    @classmethod
    def validate_filename(
        cls,
        value: str,
    ) -> str:
        """
        Normalize and validate the source filename.
        """

        value = value.strip()

        if not value:
            raise ValueError("Filename cannot be empty.")

        return value

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Chat Response
# ==========================================================


class ChatResponse(BaseModel):
    """
    Response returned by the AI chat endpoint.
    """

    status: Literal["success", "error"]

    message: str = Field(
        ...,
        min_length=1,
    )

    answer: str = Field(
        ...,
        min_length=1,
    )

    mode: ChatMode

    sources: list[SourceDocument] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Chat History Record
# ==========================================================


class ChatHistoryResponse(BaseModel):
    """
    Public representation of one stored chat interaction.
    """

    id: int = Field(
        ...,
        gt=0,
    )

    user_id: int = Field(
        ...,
        gt=0,
    )

    document_id: int | None = Field(
        default=None,
        gt=0,
    )

    question: str = Field(
        ...,
        min_length=1,
    )

    answer: str = Field(
        ...,
        min_length=1,
    )

    mode: ChatMode

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        frozen=True,
    )


# ==========================================================
# Chat History List
# ==========================================================


class ChatHistoryListResponse(BaseModel):
    """
    Collection of stored chat-history records.
    """

    status: Literal["success"] = "success"

    total: int = Field(
        ...,
        ge=0,
    )

    history: list[ChatHistoryResponse] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Clear Chat History Response
# ==========================================================


class ClearChatHistoryResponse(BaseModel):
    """
    Response returned after clearing chat history.
    """

    status: Literal["success"] = "success"

    message: str = Field(
        ...,
        min_length=1,
    )

    deleted_records: int = Field(
        ...,
        ge=0,
    )

    model_config = ConfigDict(
        frozen=True,
    )