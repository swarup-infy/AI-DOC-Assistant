"""Add case-insensitive unique user filename constraint.

Revision ID: d24d5dc0b8f1
Revises: de8003da2886
Create Date: 2026-07-27 08:21:05.098129
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d24d5dc0b8f1"
down_revision: str | Sequence[str] | None = "de8003da2886"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


INDEX_NAME = "uq_documents_user_id_filename_lower"


def upgrade() -> None:
    """
    Prevent a user from storing duplicate filenames.

    The filename comparison is case-insensitive so values such as
    ``Report.pdf`` and ``report.pdf`` are considered duplicates for
    the same user.

    Different users may still use the same filename.
    """

    op.execute(
        f"""
        CREATE UNIQUE INDEX {INDEX_NAME}
        ON documents (user_id, LOWER(filename))
        """
    )


def downgrade() -> None:
    """
    Remove the case-insensitive filename uniqueness constraint.
    """

    op.execute(
        f"DROP INDEX IF EXISTS {INDEX_NAME}"
    )