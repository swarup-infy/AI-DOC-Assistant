"""
Application Pydantic schema registry.

Exports the public request and response schemas used by the API.
Application modules may import schemas either from their individual
modules or directly from ``app.schemas``.
"""

from .chat import (
    ChatHistoryListResponse,
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    ClearChatHistoryResponse,
    SourceDocument,
)
from .dashboard import (
    DashboardLastUpload,
    DashboardRecentChat,
    DashboardResponse,
    DashboardStatistics,
)
from .document import (
    DeleteDocumentResponse,
    DocumentBase,
    DocumentListResponse,
    DocumentResponse,
    UploadResponse,
)
from .user import (
    RegisterResponse,
    TokenResponse,
    UserBase,
    UserCreate,
    UserResponse,
)


__all__ = (
    # User
    "UserBase",
    "UserCreate",
    "UserResponse",
    "RegisterResponse",
    "TokenResponse",

    # Document
    "DocumentBase",
    "DocumentResponse",
    "DocumentListResponse",
    "UploadResponse",
    "DeleteDocumentResponse",

    # Chat
    "ChatRequest",
    "ChatResponse",
    "SourceDocument",
    "ChatHistoryResponse",
    "ChatHistoryListResponse",
    "ClearChatHistoryResponse",

    # Dashboard
    "DashboardStatistics",
    "DashboardLastUpload",
    "DashboardRecentChat",
    "DashboardResponse",
)
