from __future__ import annotations

from typing import Annotated

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
