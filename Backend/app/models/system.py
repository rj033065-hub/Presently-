import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    ForeignKey,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base



class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, index=True)  # occasion_reminder | gift_plan_reminder | wishlist_notification | recommendation_notification | community_notification | system_notification
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(UUID(as_uuid=True), nullable=True)
    link_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    in_app_enabled = Column(Boolean, nullable=False, default=True)
    email_enabled = Column(Boolean, nullable=False, default=True)
    email_alerts = Column(Boolean, nullable=False, default=True)
    in_app_alerts = Column(Boolean, nullable=False, default=True)
    birthday_reminders = Column(Boolean, nullable=False, default=True)
    occasion_reminders = Column(Boolean, nullable=False, default=True)
    gift_plan_reminders = Column(Boolean, nullable=False, default=True)
    community_notifications = Column(Boolean, nullable=False, default=True)
    recommendation_notifications = Column(Boolean, nullable=False, default=True)
    marketing_notifications = Column(Boolean, nullable=False, default=False)
    frequency = Column(String(50), nullable=False, default="immediate")  # immediate | daily_digest | weekly_digest | disabled
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class ReminderExecution(Base):
    __tablename__ = "reminder_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    gift_plan_id = Column(UUID(as_uuid=True), ForeignKey("gift_plans.id", ondelete="SET NULL"), nullable=True, index=True)
    reminder_type = Column(String(100), nullable=False, index=True)
    scheduled_for = Column(Date, nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    channel = Column(String(50), nullable=False, default="both")  # in_app | email | both

    __table_args__ = (
        UniqueConstraint('gift_plan_id', 'reminder_type', name='uq_gift_plan_reminder'),
    )


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    query_text = Column(String(255), nullable=False)
    search_type = Column(String(50), nullable=False, default="all")
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
