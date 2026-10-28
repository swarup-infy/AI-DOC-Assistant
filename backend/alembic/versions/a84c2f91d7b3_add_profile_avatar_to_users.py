"""add profile avatar to users

Revision ID: a84c2f91d7b3
Revises: merge_149_f3_heads
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a84c2f91d7b3"
down_revision: Union[str, Sequence[str], None] = "merge_149_f3_heads"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("avatar_url", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "avatar_url")
