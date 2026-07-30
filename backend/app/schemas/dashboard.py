from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Dashboard Statistics
# ==========================================================


class DashboardStatistics(BaseModel):
    """
    Aggregate statistics for the authenticated user's dashboard.
    """

    total_documents: int = Field(
        ...,
        ge=0,
        description="Total number of documents owned by the user.",
    )

    total_chats: int = Field(
        ...,
        ge=0,
        description="Total number of stored chat interactions.",
    )

    storage_used_bytes: int = Field(
        ...,
        ge=0,
        description="Total document storage used in bytes.",
    )

    storage_used_mb: float = Field(
        ...,
        ge=0.0,
        description="Total document storage used in megabytes.",
    )

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Last Upload
# ==========================================================


class DashboardLastUpload(BaseModel):
    """
    Most recently uploaded document.
    """

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    uploaded_at: datetime

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Recent Chat
# ==========================================================


class DashboardRecentChat(BaseModel):
    """
    Recent chat activity shown on the dashboard.
    """

    question: str = Field(
        ...,
        min_length=1,
    )

    created_at: datetime

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Dashboard Response
# ==========================================================


class DashboardResponse(BaseModel):
    """
    Dashboard data returned for the authenticated user.
    """

    status: Literal["success"] = "success"

    statistics: DashboardStatistics

    last_upload: DashboardLastUpload | None = None

    recent_chats: list[DashboardRecentChat] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        frozen=True,
    )
