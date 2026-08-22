"""add updated_at to users

Revision ID: f3b8a4c9d7e1
Revises: de8003da2886
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f3b8a4c9d7e1"
down_revision: Union[str, Sequence[str], None] = "de8003da2886"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the users.updated_at column."""

    op.add_column(
        "users",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    """Remove the users.updated_at column."""

    op.drop_column("users", "updated_at")
