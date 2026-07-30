from __future__ import annotations

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.security import hash_password, verify_password
from app.models.user import User


class DuplicateUsernameError(Exception):
    """Raised when a username is already registered."""


class DuplicateEmailError(Exception):
    """Raised when an email address is already registered."""


class InvalidCredentialsError(Exception):
    """Raised when authentication credentials are invalid."""


class InactiveUserError(Exception):
    """Raised when authentication is attempted for an inactive user."""


class AuthService:
    """
    Service layer for user registration and authentication.

    Responsibilities:
    - Retrieve users by username or email.
    - Register users safely.
    - Hash passwords before persistence.
    - Authenticate credentials.
    - Reject inactive accounts.
    - Handle database transaction failures.
    """

    # ==========================================================
    # Retrieve by Username
    # ==========================================================

    @staticmethod
    def get_user_by_username(
        db: Session,
        username: str,
    ) -> User | None:
        """Return a user matching the supplied username."""

        normalized_username = username.strip()

        if not normalized_username:
            raise ValueError(
                "username cannot be empty."
            )

        try:
            return (
                db.query(User)
                .filter(
                    User.username == normalized_username
                )
                .first()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while retrieving username='%s'.",
                normalized_username,
            )
            raise

    # ==========================================================
    # Retrieve by Email
    # ==========================================================

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:
        """Return a user matching the normalized email address."""

        normalized_email = email.strip().lower()

        if not normalized_email:
            raise ValueError(
                "email cannot be empty."
            )

        try:
            return (
                db.query(User)
                .filter(
                    User.email == normalized_email
                )
                .first()
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while retrieving user by email."
            )
            raise

    # ==========================================================
    # Register
    # ==========================================================

    @staticmethod
    def register_user(
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> User:
        """Create and persist a new user account."""

        normalized_username = username.strip()
        normalized_email = email.strip().lower()

        if not normalized_username:
            raise ValueError(
                "username cannot be empty."
            )

        if not normalized_email:
            raise ValueError(
                "email cannot be empty."
            )

        if not password:
            raise ValueError(
                "password cannot be empty."
            )

        if AuthService.get_user_by_username(
            db=db,
            username=normalized_username,
        ) is not None:
            raise DuplicateUsernameError

        if AuthService.get_user_by_email(
            db=db,
            email=normalized_email,
        ) is not None:
            raise DuplicateEmailError

        user = User(
            username=normalized_username,
            email=normalized_email,
            hashed_password=hash_password(password),
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)

            logger.info(
                "User registered successfully. user_id=%d.",
                user.id,
            )

            return user

        except IntegrityError as exc:
            db.rollback()

            constraint_name = getattr(
                getattr(exc.orig, "diag", None),
                "constraint_name",
                None,
            )

            if constraint_name == "users_username_key":
                logger.warning(
                    "Concurrent duplicate username rejected. "
                    "username='%s'.",
                    normalized_username,
                )

                raise DuplicateUsernameError from exc

            if constraint_name == "users_email_key":
                logger.warning(
                    "Concurrent duplicate email rejected."
                )

                raise DuplicateEmailError from exc

            logger.exception(
                "Unexpected database integrity error "
                "while registering user."
            )

            raise

        except SQLAlchemyError:
            db.rollback()

            logger.exception(
                "Database error while registering user."
            )

            raise

    # ==========================================================
    # Authenticate
    # ==========================================================

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> User:
        """
        Authenticate an active user using email and password.
        """

        normalized_email = email.strip().lower()

        if not normalized_email or not password:
            raise InvalidCredentialsError

        user = AuthService.get_user_by_email(
            db=db,
            email=normalized_email,
        )

        if (
            user is None
            or not verify_password(
                password,
                user.hashed_password,
            )
        ):
            logger.warning(
                "Failed login attempt."
            )

            raise InvalidCredentialsError

        if not user.is_active:
            logger.warning(
                "Login rejected for inactive user_id=%d.",
                user.id,
            )

            raise InactiveUserError

        logger.info(
            "User authenticated successfully. user_id=%d.",
            user.id,
        )

        return user

