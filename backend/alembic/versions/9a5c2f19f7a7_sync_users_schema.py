"""Synchronize users table schema.

Revision ID: 9a5c2f19f7a7
Revises: d24d5dc0b8f1
Create Date: 2026-07-27 21:26:41.098262
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.

revision: str = "9a5c2f19f7a7"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "d24d5dc0b8f1"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    """
    Synchronize users.is_active and users.created_at with
    the current SQLAlchemy User model.

    Existing NULL values are backfilled before NOT NULL
    constraints are applied.
    """

    # ======================================================
    # Backfill Existing NULL Values
    # ======================================================

    op.execute(
        """
        UPDATE users
        SET is_active = TRUE
        WHERE is_active IS NULL
        """
    )

    op.execute(
        """
        UPDATE users
        SET created_at = NOW()
        WHERE created_at IS NULL
        """
    )

    # ======================================================
    # is_active
    # ======================================================

    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.text("true"),
    )

    # ======================================================
    # created_at
    # ======================================================

    op.alter_column(
        "users",
        "created_at",
        existing_type=postgresql.TIMESTAMP(
            timezone=False
        ),
        type_=sa.DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=sa.text("now()"),
        postgresql_using=(
            "created_at AT TIME ZONE 'UTC'"
        ),
    )


def downgrade() -> None:
    """
    Restore the users columns to their previous database schema.
    """

    # ======================================================
    # created_at
    # ======================================================

    op.alter_column(
        "users",
        "created_at",
        existing_type=sa.DateTime(
            timezone=True
        ),
        type_=postgresql.TIMESTAMP(
            timezone=False
        ),
        nullable=True,
        server_default=None,
        postgresql_using=(
            "created_at AT TIME ZONE 'UTC'"
        ),
    )

    # ======================================================
    # is_active
    # ======================================================

    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )