from __future__ import annotations

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ==========================================================
# Base Schema
# ==========================================================

class DocumentBase(BaseModel):
    """
    Common document fields.
    """

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Original uploaded filename.",
    )

    file_type: str = Field(
        ...,
        description="Document file extension.",
    )

    file_size: int = Field(
        ...,
        ge=0,
        description="File size in bytes.",
    )


# ==========================================================
# Document Response
# ==========================================================

class DocumentResponse(DocumentBase):
    """
    Document information returned to the client.
    """

    id: int

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
    Response returned after a successful upload.
    """

    status: str

    message: str

    document: DocumentResponse

    chunks: int

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Delete Response
# ==========================================================

class DeleteDocumentResponse(BaseModel):
    """
    Response after deleting a document.
    """

    status: str

    message: str

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Document List
# ==========================================================

class DocumentListResponse(BaseModel):
    """
    List of uploaded documents.
    """

    documents: list[DocumentResponse]

    total: int

    model_config = ConfigDict(
        frozen=True,
    )