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
# Base Schema
# ==========================================================


class UserBase(BaseModel):
    """
    Common public user fields shared across user schemas.
    """

    username: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Unique username.",
    )

    email: EmailStr = Field(
        ...,
        description="User email address.",
    )

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(
        cls,
        value: object,
    ) -> object:
        """
        Trim surrounding whitespace before normal validation.
        """

        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(
        cls,
        value: object,
    ) -> object:
        """
        Normalize email casing and surrounding whitespace.

        EmailStr performs the actual email-address validation.
        """

        if isinstance(value, str):
            return value.strip().lower()

        return value


# ==========================================================
# Registration
# ==========================================================


class UserCreate(UserBase):
    """
    User registration request.
    """

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Account password.",
    )


# ==========================================================
# User Response
# ==========================================================


class UserResponse(UserBase):
    """
    Public representation of a user account.

    Sensitive authentication data such as hashed_password is
    intentionally excluded.
    """

    id: int = Field(
        ...,
        gt=0,
    )

    is_active: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        frozen=True,
    )


# ==========================================================
# Registration Response
# ==========================================================


class RegisterResponse(BaseModel):
    """
    Successful user-registration response.
    """

    status: Literal["success"]

    message: str = Field(
        ...,
        min_length=1,
    )

    user: UserResponse

    model_config = ConfigDict(
        frozen=True,
    )


# ==========================================================
# Login Response
# ==========================================================


class TokenResponse(BaseModel):
    """
    Successful authentication response.
    """

    status: Literal["success"]

    message: str = Field(
        ...,
        min_length=1,
    )

    access_token: str = Field(
        ...,
        min_length=1,
    )

    token_type: Literal["bearer"]

    user: UserResponse

    model_config = ConfigDict(
        frozen=True,
    )