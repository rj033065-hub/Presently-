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
    Table,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

# Many-to-many junction table between GiftItem and GiftTag
gift_item_tags = Table(
    "gift_item_tags",
    Base.metadata,
    Column("gift_item_id", UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("gift_tags.id", ondelete="CASCADE"), primary_key=True),
)


class GiftCategory(Base):
    __tablename__ = "gift_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("gift_categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    parent = relationship("GiftCategory", remote_side=[id], backref="subcategories")
    gift_items = relationship("GiftItem", back_populates="category")


class GiftTag(Base):
    __tablename__ = "gift_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)

    gift_items = relationship("GiftItem", secondary=gift_item_tags, back_populates="tags")


class GiftItem(Base):
    __tablename__ = "gift_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    brand = Column(String(100), nullable=False, default="Generic", index=True)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    estimated_price = Column(Numeric(10, 2), nullable=False, index=True)
    currency = Column(String(10), nullable=False, default="USD")
    category_id = Column(UUID(as_uuid=True), ForeignKey("gift_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    affiliate_url = Column(Text, nullable=False)
    purchase_url = Column(Text, nullable=True)
    merchant_name = Column(String(100), nullable=False, default="Amazon", index=True)
    primary_image_url = Column(Text, nullable=False)
    is_verified = Column(Boolean, nullable=False, default=True)
    is_handmade = Column(Boolean, nullable=False, default=False, index=True)
    gift_type = Column(String(50), nullable=False, default="Physical", index=True)  # Physical | Digital | Experience | Subscription
    shipping_info = Column(Text, nullable=True)
    personalization_options = Column(Text, nullable=True)
    popularity_score = Column(Integer, nullable=False, default=50, index=True)
    rating_avg = Column(Numeric(3, 2), nullable=False, default=0.00)
    rating_count = Column(Integer, nullable=False, default=0)
    suitable_occasions = Column(JSON, nullable=True)
    suitable_relationships = Column(JSON, nullable=True)
    suitable_interests = Column(JSON, nullable=True)
    suitable_personalities = Column(JSON, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    category = relationship("GiftCategory", back_populates="gift_items")
    tags = relationship("GiftTag", secondary=gift_item_tags, back_populates="gift_items")
    images = relationship("GiftImage", back_populates="gift_item", cascade="all, delete-orphan")
    reviews = relationship("GiftReview", back_populates="gift_item", cascade="all, delete-orphan")


class GiftImage(Base):
    __tablename__ = "gift_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gift_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    gift_item = relationship("GiftItem", back_populates="images")


class GiftReview(Base):
    __tablename__ = "gift_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gift_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    gift_item = relationship("GiftItem", back_populates="reviews")
