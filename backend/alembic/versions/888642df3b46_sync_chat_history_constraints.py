"""sync chat history constraints

Revision ID: 888642df3b46
Revises: dfeab0e3e1c7
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "888642df3b46"
down_revision: Union[str, Sequence[str], None] = "dfeab0e3e1c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Synchronize chat_history constraints with the ORM model."""

    # Match ChatHistory.created_at nullable=False.
    op.alter_column(
        "chat_history",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    # Add the index required by user_id index=True.
    op.create_index(
        "ix_chat_history_user_id",
        "chat_history",
        ["user_id"],
        unique=False,
    )

    # Add the missing ownership foreign key with cascade deletion.
    op.create_foreign_key(
        "chat_history_user_id_fkey",
        "chat_history",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Restore the previous chat_history schema."""

    op.drop_constraint(
        "chat_history_user_id_fkey",
        "chat_history",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_chat_history_user_id",
        table_name="chat_history",
    )

    op.alter_column(
        "chat_history",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )