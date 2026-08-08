import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Numeric,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, nullable=False, default=False)
    share_token = Column(String(100), nullable=True, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wishlists")
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan", order_by="WishlistItem.display_order")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wishlist_id = Column(UUID(as_uuid=True), ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False, index=True)
    gift_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="medium", index=True)  # low | medium | high
    target_price = Column(Numeric(10, 2), nullable=True)
    status = Column(String(50), nullable=False, default="considering", index=True)  # considering | planned | purchased | reserved
    display_order = Column(Integer, nullable=False, default=0)
    added_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    wishlist = relationship("Wishlist", back_populates="items")
    gift_item = relationship("GiftItem")
