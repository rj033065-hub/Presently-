"""phase16_notifications

Revision ID: 008
Revises: 007
Create Date: 2026-08-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update user_profiles table with timezone
    with op.batch_alter_table('user_profiles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('timezone', sa.String(length=50), server_default='UTC', nullable=False))

    # 2. Update notifications table with missing fields and indexes
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.add_column(sa.Column('related_entity_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('related_entity_id', sa.UUID(), nullable=True))
        batch_op.add_column(sa.Column('read_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_index('idx_notifications_user_id', ['user_id'])
        batch_op.create_index('idx_notifications_type', ['type'])
        batch_op.create_index('idx_notifications_is_read', ['is_read'])
        batch_op.create_index('idx_notifications_created_at', ['created_at'])

    # 3. Update notification_preferences table with missing fields
    with op.batch_alter_table('notification_preferences', schema=None) as batch_op:
        batch_op.add_column(sa.Column('in_app_enabled', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('email_enabled', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('occasion_reminders', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('gift_plan_reminders', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('community_notifications', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('recommendation_notifications', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('marketing_notifications', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('frequency', sa.String(length=50), server_default='immediate', nullable=False))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False))

    # 4. Create reminder_executions table
    op.create_table(
        'reminder_executions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('gift_plan_id', sa.UUID(), nullable=True),
        sa.Column('reminder_type', sa.String(length=100), nullable=False),
        sa.Column('scheduled_for', sa.Date(), nullable=True),
        sa.Column('executed_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('channel', sa.String(length=50), server_default='both', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['gift_plan_id'], ['gift_plans.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('gift_plan_id', 'reminder_type', name='uq_gift_plan_reminder')
    )
    op.create_index('idx_reminder_executions_user_id', 'reminder_executions', ['user_id'])
    op.create_index('idx_reminder_executions_gift_plan_id', 'reminder_executions', ['gift_plan_id'])
    op.create_index('idx_reminder_executions_reminder_type', 'reminder_executions', ['reminder_type'])


def downgrade() -> None:
    # Drop reminder_executions indexes & table
    op.drop_index('idx_reminder_executions_reminder_type', table_name='reminder_executions')
    op.drop_index('idx_reminder_executions_gift_plan_id', table_name='reminder_executions')
    op.drop_index('idx_reminder_executions_user_id', table_name='reminder_executions')
    op.drop_table('reminder_executions')

    # Revert notification_preferences alterations
    with op.batch_alter_table('notification_preferences', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('frequency')
        batch_op.drop_column('marketing_notifications')
        batch_op.drop_column('recommendation_notifications')
        batch_op.drop_column('community_notifications')
        batch_op.drop_column('gift_plan_reminders')
        batch_op.drop_column('occasion_reminders')
        batch_op.drop_column('email_enabled')
        batch_op.drop_column('in_app_enabled')

    # Revert notifications alterations
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_index('idx_notifications_created_at')
        batch_op.drop_index('idx_notifications_is_read')
        batch_op.drop_index('idx_notifications_type')
        batch_op.drop_index('idx_notifications_user_id')
        batch_op.drop_column('read_at')
        batch_op.drop_column('related_entity_id')
        batch_op.drop_column('related_entity_type')

    # Revert user_profiles alterations
    with op.batch_alter_table('user_profiles', schema=None) as batch_op:
        batch_op.drop_column('timezone')
