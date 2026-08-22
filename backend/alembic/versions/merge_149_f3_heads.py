"""Merge the two existing Alembic migration heads.

Revision ID: merge_149_f3_heads
Revises: 149347156dc0, f3b8a4c9d7e1
"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "merge_149_f3_heads"
down_revision: Union[str, Sequence[str], None] = (
    "149347156dc0",
    "f3b8a4c9d7e1",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Merge the existing migration branches."""
    pass


def downgrade() -> None:
    """Split the migration graph back into its two heads."""
    pass
