"""add document_id and updated_at to chat_history

Revision ID: 600ede1b1129
Revises: d354f102ddfc
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "600ede1b1129"
down_revision: Union[str, Sequence[str], None] = "d354f102ddfc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add document_id column
    op.add_column(
        "chat_history",
        sa.Column(
            "document_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Add updated_at column
    op.add_column(
        "chat_history",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # Create index for document_id
    op.create_index(
        "ix_chat_history_document_id",
        "chat_history",
        ["document_id"],
        unique=False,
    )

    # Create foreign key to documents table
    op.create_foreign_key(
        "fk_chat_history_document_id",
        "chat_history",
        "documents",
        ["document_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Remove foreign key
    op.drop_constraint(
        "fk_chat_history_document_id",
        "chat_history",
        type_="foreignkey",
    )

    # Remove index
    op.drop_index(
        "ix_chat_history_document_id",
        table_name="chat_history",
    )

    # Remove columns
    op.drop_column(
        "chat_history",
        "updated_at",
    )

    op.drop_column(
        "chat_history",
        "document_id",
    )