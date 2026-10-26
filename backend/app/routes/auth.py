from __future__ import annotations

from typing import Annotated
import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import create_access_token, get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    RegisterResponse,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserProfileUpdate,
)
from app.services.auth_service import (
    AuthService,
    DuplicateEmailError,
    DuplicateUsernameError,
    InactiveUserError,
    InvalidCredentialsError,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ==========================================================
# Authentication Health
# ==========================================================


@router.get(
    "/",
    summary="Authentication health check",
    description="Confirm that the authentication routes are available.",
)
def auth_home() -> dict[str, str]:
    """
    Return a simple authentication-route health response.
    """

    return {
        "status": "success",
        "message": "Authentication route is working.",
    }


# ==========================================================
# Register
# ==========================================================


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register user",
    description="Create a new user account.",
)
def register(
    user: UserCreate,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> RegisterResponse:
    """
    Register a new user account.
    """

    try:
        new_user = AuthService.register_user(
            db=db,
            username=user.username,
            email=str(user.email),
            password=user.password,
        )

        return RegisterResponse(
            status="success",
            message="User registered successfully.",
            user=UserResponse.model_validate(
                new_user
            ),
        )

    except DuplicateUsernameError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        ) from exc

    except DuplicateEmailError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        ) from exc

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while processing registration."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user.",
        ) from exc

    except Exception as exc:
        logger.exception(
            "Unexpected error while processing registration."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user.",
        ) from exc


# ==========================================================
# Login
# ==========================================================


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
    description=(
        "Authenticate using an email address and password "
        "and return a JWT access token."
    ),
)
def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> TokenResponse:
    """
    Authenticate an active user and issue an access token.

    OAuth2PasswordRequestForm uses the field name `username`.
    For this application that field contains the user's email.
    """

    try:
        user = AuthService.authenticate_user(
            db=db,
            email=form_data.username,
            password=form_data.password,
        )

    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except InactiveUserError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        ) from exc

    except SQLAlchemyError as exc:
        logger.exception(
            "Database error while processing login."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to authenticate user.",
        ) from exc

    access_token = create_access_token(
        data={
            "sub": user.email,
        }
    )

    logger.info(
        "User logged in successfully. user_id=%d.",
        user.id,
    )

    return TokenResponse(
        status="success",
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(
            user
        ),
    )


# ==========================================================
# Current User
# ==========================================================


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Return the authenticated user's account information.",
)
def get_me(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> UserResponse:
    """
    Return the currently authenticated active user.
    """

    return UserResponse.model_validate(
        current_user
    )


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
    description="Update the authenticated user's display name and profile picture.",
)
def update_me(
    payload: UserProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Persist profile changes for the authenticated user only."""
    if "username" in payload.model_fields_set:
        username = (payload.username or "").strip()
        if len(username) < 3:
            raise HTTPException(status_code=422, detail="Name must contain at least 3 characters.")
        duplicate = db.query(User).filter(
            User.username == username,
            User.id != current_user.id,
        ).first()
        if duplicate:
            raise HTTPException(status_code=409, detail="That name is already in use.")
        current_user.username = username

    if "avatar_url" in payload.model_fields_set:
        avatar = payload.avatar_url
        if avatar is not None:
            if len(avatar) > 2_800_000 or not re.fullmatch(
                r"data:image/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}",
                avatar,
            ):
                raise HTTPException(
                    status_code=422,
                    detail="Profile picture must be a PNG, JPEG, or WebP image under 2 MB.",
                )
        current_user.avatar_url = avatar

    try:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Database error while updating profile. user_id=%d.", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save profile changes.",
        ) from exc

    return UserResponse.model_validate(current_user)
