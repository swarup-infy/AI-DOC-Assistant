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

# ==========================================================
# Account deletion
# ==========================================================


@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Delete current account",
    description=(
        "Permanently delete the authenticated account, its documents, "
        "uploaded files, vectors, and chat history."
    ),
)
def delete_current_account(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> dict[str, str]:
    """
    Delete only the authenticated user's account and associated content.

    Vector records and uploaded files are cleaned before the database
    transaction is committed. If vector cleanup fails, the account is
    retained so the operation can safely be retried.
    """
    from app.services.upload_service import delete_uploaded_file
    from app.vector_db.chroma_service import ChromaService

    try:
        documents = list(current_user.documents)
        chroma_service = ChromaService()

        # Remove vector records first. Keep the account intact if any
        # vector cleanup fails so this operation can be retried.
        for document in documents:
            chroma_service.delete_document_chunks(
                document_id=document.id,
                user_id=current_user.id,
            )

        # Remove database records (documents/chat history cascade from
        # the user model's relationships and database constraints).
        file_paths = [document.file_path for document in documents]
        db.delete(current_user)
        db.commit()

        # Physical files are removed after the database commit. A failed
        # disk cleanup is logged for operator follow-up; the account data
        # is no longer available through the application.
        for file_path in file_paths:
            if not delete_uploaded_file(file_path):
                logger.warning(
                    "Account deleted but uploaded file cleanup failed: %s",
                    file_path,
                )

        logger.info(
            "Account deletion completed. user_id=%d documents=%d.",
            current_user.id,
            len(documents),
        )
        return {"status": "success", "message": "Account and associated application data deleted."}

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.exception(
            "Account deletion failed. user_id=%d.",
            current_user.id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete account. No account deletion was confirmed.",
        ) from exc
