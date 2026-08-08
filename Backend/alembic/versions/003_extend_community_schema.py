"""extend_community_schema

Revision ID: 003
Revises: 002
Create Date: 2026-08-07 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Community Categories Table
    op.create_table(
        'community_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=100), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_community_categories_slug', 'community_categories', ['slug'])

    # 2. Community Tags Table
    op.create_table(
        'community_tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=50), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=50), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_community_tags_slug', 'community_tags', ['slug'])

    # 3. Association Tables
    op.create_table(
        'community_post_categories',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_categories.id', ondelete='CASCADE'), primary_key=True),
    )

    op.create_table(
        'community_post_tags',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_tags.id', ondelete='CASCADE'), primary_key=True),
    )

    # 4. Alter community_posts Table
    with op.batch_alter_table('community_posts') as batch_op:
        batch_op.alter_column('user_id', new_column_name='author_id')
        batch_op.add_column(sa.Column('slug', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('excerpt', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('cover_image_url', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False, server_default='Draft'))
        batch_op.add_column(sa.Column('visibility', sa.String(length=20), nullable=False, server_default='Public'))
        batch_op.add_column(sa.Column('reading_time', sa.Integer(), nullable=False, server_default='1'))
        batch_op.add_column(sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'))
        batch_op.create_index('idx_community_posts_slug', ['slug'], unique=True)
        batch_op.create_index('idx_community_posts_status', ['status'])
        batch_op.create_index('idx_community_posts_visibility', ['visibility'])

    # 5. Alter post_images Table
    with op.batch_alter_table('post_images') as batch_op:
        batch_op.add_column(sa.Column('alt_text', sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('post_images') as batch_op:
        batch_op.drop_column('alt_text')

    with op.batch_alter_table('community_posts') as batch_op:
        batch_op.drop_index('idx_community_posts_visibility')
        batch_op.drop_index('idx_community_posts_status')
        batch_op.drop_index('idx_community_posts_slug')
        batch_op.drop_column('view_count')
        batch_op.drop_column('reading_time')
        batch_op.drop_column('visibility')
        batch_op.drop_column('status')
        batch_op.drop_column('cover_image_url')
        batch_op.drop_column('excerpt')
        batch_op.drop_column('slug')
        batch_op.alter_column('author_id', new_column_name='user_id')

    op.drop_table('community_post_tags')
    op.drop_table('community_post_categories')
    op.drop_index('idx_community_tags_slug', table_name='community_tags')
    op.drop_table('community_tags')
    op.drop_index('idx_community_categories_slug', table_name='community_categories')
    op.drop_table('community_categories')
