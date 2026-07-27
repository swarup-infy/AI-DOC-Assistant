from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserResponse,
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
def auth_home() -> dict:
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
) -> dict:
    """
    Register a new user.

    Username and email uniqueness are checked before insertion,
    while database unique constraints provide final protection
    against concurrent registration attempts.
    """

    username = user.username.strip()
    email = str(user.email).lower().strip()

    try:
        existing_username = (
            db.query(User)
            .filter(
                User.username == username
            )
            .first()
        )

        if existing_username is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists.",
            )

        existing_email = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

        if existing_email is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )

        new_user = User(
            username=username,
            email=email,
            hashed_password=hash_password(
                user.password
            ),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(
            "User registered successfully. user_id=%d.",
            new_user.id,
        )

        return {
            "status": "success",
            "message": "User registered successfully.",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "is_active": new_user.is_active,
                "created_at": new_user.created_at,
                "updated_at": new_user.updated_at,
            },
        }

    except HTTPException:
        raise

    except IntegrityError as exc:
        db.rollback()

        logger.warning(
            "Registration failed because of a database "
            "uniqueness conflict for username='%s'.",
            username,
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered.",
        ) from exc

    except SQLAlchemyError as exc:
        db.rollback()

        logger.exception(
            "Database error while registering username='%s'.",
            username,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user.",
        ) from exc

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Unexpected error while registering username='%s'.",
            username,
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
    Authenticate a user and issue an access token.

    OAuth2PasswordRequestForm uses the field name `username`.
    For this application that field contains the user's email.
    """

    email = form_data.username.lower().strip()

    db_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if (
        db_user is None
        or not verify_password(
            form_data.password,
            db_user.hashed_password,
        )
    ):
        logger.warning(
            "Failed login attempt for email='%s'.",
            email,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not db_user.is_active:
        logger.warning(
            "Login rejected for inactive user_id=%d.",
            db_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
        }
    )

    logger.info(
        "User logged in successfully. user_id=%d.",
        db_user.id,
    )

    return TokenResponse(
        status="success",
        message="Login successful.",
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(
            db_user
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