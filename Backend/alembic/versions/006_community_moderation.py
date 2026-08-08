"""community_moderation

Revision ID: 006
Revises: 005
Create Date: 2026-08-07 05:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to reports table
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.add_column(sa.Column('details', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('resolved_by', sa.UUID(), nullable=True))
        batch_op.add_column(sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_foreign_key('fk_reports_resolved_by', 'users', ['resolved_by'], ['id'], ondelete='SET NULL')

    # Create moderation_audit_logs table
    op.create_table(
        'moderation_audit_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('moderator_id', sa.UUID(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('target_type', sa.String(length=50), nullable=False),
        sa.Column('target_id', sa.UUID(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['moderator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_mod_audit_moderator_id', 'moderation_audit_logs', ['moderator_id'])
    op.create_index('idx_mod_audit_target_id', 'moderation_audit_logs', ['target_id'])


def downgrade() -> None:
    op.drop_index('idx_mod_audit_target_id', table_name='moderation_audit_logs')
    op.drop_index('idx_mod_audit_moderator_id', table_name='moderation_audit_logs')
    op.drop_table('moderation_audit_logs')

    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_constraint('fk_reports_resolved_by', type_='foreignkey')
        batch_op.drop_column('resolved_at')
        batch_op.drop_column('resolved_by')
        batch_op.drop_column('details')
