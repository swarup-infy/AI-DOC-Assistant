from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


# ==========================================================
# Base Schemas
# ==========================================================

class UserBase(BaseModel):
    """
    Common user fields.
    """

    username: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Unique username",
    )

    email: EmailStr = Field(
        ...,
        description="User email address",
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Username cannot be empty.")

        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> EmailStr:
        return value.lower()


# ==========================================================
# Authentication
# ==========================================================

class UserCreate(UserBase):
    """
    User registration schema.
    """

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Account password",
    )


class UserLogin(BaseModel):
    """
    User login schema.
    """

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> EmailStr:
        return value.lower()


# ==========================================================
# User Response
# ==========================================================

class UserResponse(UserBase):
    """
    User response schema.
    """

    id: int

    is_active: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        frozen=True,
    )


# ==========================================================
# JWT Token
# ==========================================================

class Token(BaseModel):
    """
    JWT token.
    """

    access_token: str = Field(
        ...,
        min_length=1,
    )

    token_type: Literal["bearer"]


# ==========================================================
# Login Response
# ==========================================================

class TokenResponse(BaseModel):
    """
    Authentication response.
    """

    status: str

    message: str

    access_token: str

    token_type: Literal["bearer"]

    user: UserResponse