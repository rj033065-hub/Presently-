import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class GiftPlan(Base):
    __tablename__ = "gift_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_name = Column(String(255), nullable=False)
    recipient_relationship = Column(String(100), nullable=True)
    occasion = Column(String(100), nullable=False, index=True)
    event_date = Column(Date, nullable=False, index=True)
    planned_budget = Column(Numeric(10, 2), nullable=False, default=0.0)
    actual_spending = Column(Numeric(10, 2), nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(50), nullable=False, default="planning", index=True)  # planning | gift_selected | purchased | delivered | completed
    gift_idea = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
