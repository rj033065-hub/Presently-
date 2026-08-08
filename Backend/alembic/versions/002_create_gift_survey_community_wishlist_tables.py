"""create_gift_survey_community_wishlist_tables

Revision ID: 002
Revises: 001
Create Date: 2026-08-07 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Gift Categories & Tags
    op.create_table(
        'gift_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=100), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon_name', sa.String(length=50), nullable=True),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_gift_categories_slug', 'gift_categories', ['slug'])

    op.create_table(
        'gift_tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=50), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=50), nullable=False, unique=True),
    )
    op.create_index('idx_gift_tags_slug', 'gift_tags', ['slug'])

    # 2. Gift Items
    op.create_table(
        'gift_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('estimated_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_categories.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('affiliate_url', sa.Text(), nullable=False),
        sa.Column('merchant_name', sa.String(length=100), nullable=False, server_default='Amazon'),
        sa.Column('primary_image_url', sa.Text(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('rating_avg', sa.Numeric(precision=3, scale=2), nullable=False, server_default='0.00'),
        sa.Column('rating_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_gift_items_title', 'gift_items', ['title'])
    op.create_index('idx_gift_items_price', 'gift_items', ['estimated_price'])
    op.create_index('idx_gift_items_category_id', 'gift_items', ['category_id'])
    op.create_index('idx_gift_items_merchant_name', 'gift_items', ['merchant_name'])
    op.create_index('idx_gift_items_deleted_at', 'gift_items', ['deleted_at'])

    op.create_table(
        'gift_item_tags',
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_tags.id', ondelete='CASCADE'), primary_key=True),
    )

    op.create_table(
        'gift_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'gift_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('review_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # 3. Recipients & Surveys
    op.create_table(
        'recipients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('relationship', sa.String(length=100), nullable=False),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_recipients_user_id', 'recipients', ['user_id'])
    op.create_index('idx_recipients_relationship', 'recipients', ['relationship'])

    op.create_table(
        'surveys',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('recipients.id', ondelete='SET NULL'), nullable=True),
        sa.Column('occasion', sa.String(length=100), nullable=False),
        sa.Column('min_budget', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('max_budget', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('survey_payload', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_surveys_user_id', 'surveys', ['user_id'])
    op.create_index('idx_surveys_occasion', 'surveys', ['occasion'])

    op.create_table(
        'survey_questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('input_type', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
    )

    op.create_table(
        'survey_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('surveys.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('survey_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answer_value', sa.JSON(), nullable=False),
    )

    # 4. AI Recommendations & Chat
    op.create_table(
        'ai_recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('survey_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('surveys.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('ai_model_used', sa.String(length=50), nullable=False, server_default='gpt-4o'),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('execution_time_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'ai_recommendation_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('recommendation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('ai_recommendations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('match_score', sa.Integer(), nullable=False),
        sa.Column('strategy_label', sa.String(length=100), nullable=False),
        sa.Column('ai_reasoning', sa.Text(), nullable=False),
    )

    op.create_table(
        'ai_conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, server_default='Gift Assistance Chat'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'ai_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('ai_conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # 5. Wishlists & Community
    op.create_table(
        'wishlists',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'wishlist_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('wishlist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('wishlists.id', ondelete='CASCADE'), nullable=False),
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'community_posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('gift_item_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('gift_items.id', ondelete='SET NULL'), nullable=True),
        sa.Column('likes_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('comments_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'post_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
    )

    op.create_table(
        'comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('comments.id', ondelete='CASCADE'), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'post_likes',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'saved_posts',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('community_posts.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_type', sa.String(length=50), nullable=False),
        sa.Column('target_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # 6. Notifications & System
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('link_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'notification_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('email_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('in_app_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('birthday_reminders', sa.Boolean(), nullable=False, server_default='true'),
    )

    op.create_table(
        'search_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('query_text', sa.String(length=255), nullable=False),
        sa.Column('search_type', sa.String(length=50), nullable=False, server_default='all'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    op.create_table(
        'system_settings',
        sa.Column('key', sa.String(length=100), primary_key=True),
        sa.Column('value', sa.JSON(), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('system_settings')
    op.drop_table('search_history')
    op.drop_table('notification_preferences')
    op.drop_table('notifications')
    op.drop_table('reports')
    op.drop_table('saved_posts')
    op.drop_table('post_likes')
    op.drop_table('comments')
    op.drop_table('post_images')
    op.drop_table('community_posts')
    op.drop_table('wishlist_items')
    op.drop_table('wishlists')
    op.drop_table('ai_messages')
    op.drop_table('ai_conversations')
    op.drop_table('ai_recommendation_items')
    op.drop_table('ai_recommendations')
    op.drop_table('survey_answers')
    op.drop_table('survey_questions')
    op.drop_table('surveys')
    op.drop_table('recipients')
    op.drop_table('gift_reviews')
    op.drop_table('gift_images')
    op.drop_table('gift_item_tags')
    op.drop_table('gift_items')
    op.drop_table('gift_tags')
    op.drop_table('gift_categories')
