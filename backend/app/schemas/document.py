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
# Base Schema
# ==========================================================


class DocumentBase(BaseModel):
    """
    Common document fields exposed through the API.
    """

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Original uploaded filename.",
    )

    file_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Document file extension.",
    )

    file_size: int = Field(
        ...,
        ge=0,
        description="File size in bytes.",
    )

    @field_validator("filename")
    @classmethod
    def normalize_filename(
        cls,
        value: str,
    ) -> str:
        """
        Remove surrounding whitespace and reject empty filenames.
        """

        value = value.strip()

        if not value:
            raise ValueError(
                "Filename cannot be empty."
            )

        return value

    @field_validator("file_type")
    @classmethod
    def normalize_file_type(
        cls,
        value: str,
    ) -> str:
        """
        Normalize file extensions to lowercase without a leading dot.
        """

        value = value.strip().lower()

        if value.startswith("."):
            value = value[1:]

        if not value:
            raise ValueError(
                "File type cannot be empty."
            )

        return value


# ==========================================================
# Document Response
# ==========================================================


class DocumentResponse(DocumentBase):
    """
    Public representation of an uploaded document.
    """

    id: int = Field(
        ...,
        gt=0,
    )

    uploaded_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        frozen=True,
    )


# ==========================================================
# Upload Response
# ==========================================================


class UploadResponse(BaseModel):
    """
    Response returned after a successful document upload.
    """

    status: Literal["success"] = "success"

    message: str = Field(
        ...,
        min_length=1,
    )

    document: DocumentResponse

    chunks: int = Field(
        ...,
        ge=0,
        description="Number of document chunks created.",
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Document List Response
# ==========================================================


class DocumentListResponse(BaseModel):
    """
    Response containing the authenticated user's documents.
    """

    status: Literal["success"] = "success"

    documents: list[DocumentResponse] = Field(
        default_factory=list,
    )

    total: int = Field(
        ...,
        ge=0,
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Delete Response
# ==========================================================


class DeleteDocumentResponse(BaseModel):
    """
    Response returned after deleting a document.

    file_deleted may be False when database metadata and vectors
    were successfully removed but physical-file cleanup could not
    be completed.
    """

    status: Literal["success"] = "success"

    message: str = Field(
        ...,
        min_length=1,
    )

    deleted_chunks: int = Field(
        ...,
        ge=0,
        description="Number of ChromaDB chunks deleted.",
    )

    file_deleted: bool = Field(
        ...,
        description=(
            "Whether the stored physical file was successfully deleted."
        ),
    )

    model_config = ConfigDict(
        frozen=True,
    )