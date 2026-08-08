"""community_engagement

Revision ID: 004
Revises: 003
Create Date: 2026-08-07 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('comments') as batch_op:
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_index('idx_comments_deleted_at', ['deleted_at'])


def downgrade() -> None:
    with op.batch_alter_table('comments') as batch_op:
        batch_op.drop_index('idx_comments_deleted_at')
        batch_op.drop_column('deleted_at')
        batch_op.drop_column('updated_at')
