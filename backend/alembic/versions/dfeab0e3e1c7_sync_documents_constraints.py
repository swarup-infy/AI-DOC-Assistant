"""sync documents constraints

Revision ID: dfeab0e3e1c7
Revises: 9a5c2f19f7a7
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dfeab0e3e1c7"
down_revision: Union[str, Sequence[str], None] = "9a5c2f19f7a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Synchronize document constraints with the ORM model."""

    # uploaded_at is non-nullable in the Document model.
    op.alter_column(
        "documents",
        "uploaded_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    # Recreate the user foreign key with ON DELETE CASCADE.
    op.drop_constraint(
        "documents_user_id_fkey",
        "documents",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "documents_user_id_fkey",
        "documents",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Restore the previous document constraints."""

    op.drop_constraint(
        "documents_user_id_fkey",
        "documents",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "documents_user_id_fkey",
        "documents",
        "users",
        ["user_id"],
        ["id"],
    )

    op.alter_column(
        "documents",
        "uploaded_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )