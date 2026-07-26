"""
Application Pydantic schemas.

This package exports all request and response schemas so they can
be imported directly from ``app.schemas``.

Example:
    from app.schemas import (
        UserCreate,
        UserLogin,
        UserResponse,
        DocumentResponse,
        UploadResponse,
        ChatRequest,
        ChatResponse,
    )
"""

from .chat import (
    ChatHistoryListResponse,
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    SourceDocument,
)
from .document import (
    DeleteDocumentResponse,
    DocumentBase,
    DocumentListResponse,
    DocumentResponse,
    UploadResponse,
)
from .user import (
    Token,
    TokenResponse,
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
)

__all__ = (
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenResponse",
    "DocumentBase",
    "DocumentResponse",
    "DocumentListResponse",
    "UploadResponse",
    "DeleteDocumentResponse",
    "ChatRequest",
    "ChatResponse",
    "SourceDocument",
    "ChatHistoryResponse",
    "ChatHistoryListResponse",
)