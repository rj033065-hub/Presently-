"""phase15_dashboard_planner

Revision ID: 007
Revises: 006
Create Date: 2026-08-08 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extend wishlists table
    with op.batch_alter_table('wishlists', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('share_token', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_index('idx_wishlists_share_token', ['share_token'], unique=True)

    # 2. Extend wishlist_items table
    with op.batch_alter_table('wishlist_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('notes', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('priority', sa.String(length=20), server_default='medium', nullable=False))
        batch_op.add_column(sa.Column('target_price', sa.Numeric(precision=10, scale=2), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(length=50), server_default='considering', nullable=False))
        batch_op.add_column(sa.Column('display_order', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_index('idx_wishlist_items_priority', ['priority'])
        batch_op.create_index('idx_wishlist_items_status', ['status'])

    # 3. Create gift_plans table
    op.create_table(
        'gift_plans',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('recipient_name', sa.String(length=255), nullable=False),
        sa.Column('recipient_relationship', sa.String(length=100), nullable=True),
        sa.Column('occasion', sa.String(length=100), nullable=False),
        sa.Column('event_date', sa.Date(), nullable=False),
        sa.Column('planned_budget', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=False),
        sa.Column('actual_spending', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='USD', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='planning', nullable=False),
        sa.Column('gift_idea', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_gift_plans_user_id', 'gift_plans', ['user_id'])
    op.create_index('idx_gift_plans_event_date', 'gift_plans', ['event_date'])
    op.create_index('idx_gift_plans_status', 'gift_plans', ['status'])

    # 4. Create user_activities table
    op.create_table(
        'user_activities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('target_url', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_user_activities_user_id', 'user_activities', ['user_id'])
    op.create_index('idx_user_activities_type', 'user_activities', ['activity_type'])
    op.create_index('idx_user_activities_created_at', 'user_activities', ['created_at'])


def downgrade() -> None:
    op.drop_table('user_activities')
    op.drop_table('gift_plans')

    with op.batch_alter_table('wishlist_items', schema=None) as batch_op:
        batch_op.drop_index('idx_wishlist_items_status')
        batch_op.drop_index('idx_wishlist_items_priority')
        batch_op.drop_column('updated_at')
        batch_op.drop_column('display_order')
        batch_op.drop_column('status')
        batch_op.drop_column('target_price')
        batch_op.drop_column('priority')
        batch_op.drop_column('notes')

    with op.batch_alter_table('wishlists', schema=None) as batch_op:
        batch_op.drop_index('idx_wishlists_share_token')
        batch_op.drop_column('updated_at')
        batch_op.drop_column('share_token')
        batch_op.drop_column('description')
