from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User


# ==========================================================
# Password Hashing
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ==========================================================
# OAuth2
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
)


# ==========================================================
# Authentication Exception
# ==========================================================


def _credentials_exception() -> HTTPException:
    """
    Create a fresh authentication exception.
    """

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


# ==========================================================
# Password Utilities
# ==========================================================


def hash_password(
    password: str,
) -> str:
    """
    Hash a plain-text password.

    The password must not be empty.
    """

    if not password:
        raise ValueError(
            "Password cannot be empty."
        )

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against a stored password hash.
    """

    if not plain_password or not hashed_password:
        return False

    try:
        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    except (ValueError, TypeError):
        return False


# ==========================================================
# JWT Utilities
# ==========================================================


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create and sign a JWT access token.
    """

    if not data:
        raise ValueError(
            "Token payload cannot be empty."
        )

    subject = data.get("sub")

    if not isinstance(subject, str) or not subject.strip():
        raise ValueError(
            "Token payload must contain a valid 'sub' claim."
        )

    now = datetime.now(timezone.utc)

    expires_at = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    if expires_at <= now:
        raise ValueError(
            "Token expiration must be in the future."
        )

    payload = data.copy()

    payload.update(
        {
            "sub": subject.strip(),
            "iat": now,
            "exp": expires_at,
            "type": "access",
        }
    )

    secret_key = (
        settings.SECRET_KEY
        .get_secret_value()
    )

    return jwt.encode(
        payload,
        secret_key,
        algorithm=settings.ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any] | None:
    """
    Decode and validate a JWT access token.

    Return None when the token is invalid, malformed, expired,
    or is not an access token.
    """

    if not token:
        return None

    secret_key = (
        settings.SECRET_KEY
        .get_secret_value()
    )

    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[
                settings.ALGORITHM,
            ],
            options={
                "verify_signature": True,
                "verify_exp": True,
            },
        )

    except JWTError:
        return None

    if payload.get("type") != "access":
        return None

    subject = payload.get("sub")

    if not isinstance(subject, str) or not subject.strip():
        return None

    return payload


# ==========================================================
# Current User Dependency
# ==========================================================


def get_current_user(
    token: Annotated[
        str,
        Depends(oauth2_scheme),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> User:
    """
    Resolve and return the authenticated active user.
    """

    payload = decode_access_token(
        token,
    )

    if payload is None:
        raise _credentials_exception()

    email = payload.get("sub")

    if not isinstance(email, str):
        raise _credentials_exception()

    user = (
        db.query(User)
        .filter(
            User.email == email.lower().strip()
        )
        .first()
    )

    if user is None:
        raise _credentials_exception()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user