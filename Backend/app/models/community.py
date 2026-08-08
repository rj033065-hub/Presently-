import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Integer,
    DateTime,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


# Association table for CommunityPost and CommunityCategory many-to-many relationship
community_post_categories = Table(
    "community_post_categories",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("community_categories.id", ondelete="CASCADE"), primary_key=True),
)

# Association table for CommunityPost and CommunityTag many-to-many relationship
community_post_tags = Table(
    "community_post_tags",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("community_tags.id", ondelete="CASCADE"), primary_key=True),
)

# Association table for Collection and CommunityPost many-to-many relationship
collection_posts = Table(
    "collection_posts",
    Base.metadata,
    Column("collection_id", UUID(as_uuid=True), ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("added_at", DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)),
)



class CommunityCategory(Base):
    __tablename__ = "community_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    posts = relationship("CommunityPost", secondary=community_post_categories, back_populates="categories")


class CommunityTag(Base):
    __tablename__ = "community_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    posts = relationship("CommunityPost", secondary=community_post_tags, back_populates="tags")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column("author_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_image_url = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Draft", index=True)  # Draft | Published | Archived
    visibility = Column(String(20), nullable=False, default="Public", index=True)  # Public | Private | Unlisted
    reading_time = Column(Integer, nullable=False, default=1)
    view_count = Column(Integer, nullable=False, default=0)
    gift_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_items.id", ondelete="SET NULL"), nullable=True, index=True)
    likes_count = Column(Integer, nullable=False, default=0)
    comments_count = Column(Integer, nullable=False, default=0)
    is_published = Column(Boolean, nullable=False, default=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @property
    def user_id(self):
        return self.author_id

    @user_id.setter
    def user_id(self, value):
        self.author_id = value

    author = relationship("User", foreign_keys=[author_id])
    categories = relationship("CommunityCategory", secondary=community_post_categories, back_populates="posts")
    tags = relationship("CommunityTag", secondary=community_post_tags, back_populates="posts")
    images = relationship("PostImage", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")


class PostImage(Base):
    __tablename__ = "post_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    alt_text = Column(String(255), nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

    post = relationship("CommunityPost", back_populates="images")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", foreign_keys=[user_id])
    parent_comment = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent_comment", cascade="all, delete-orphan")



class PostLike(Base):
    __tablename__ = "post_likes"

    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    post = relationship("CommunityPost", back_populates="likes")


class SavedPost(Base):
    __tablename__ = "saved_posts"

    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(String(50), nullable=False)  # post | comment | user
    target_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending | reviewed | dismissed | actioned
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    reporter = relationship("User", foreign_keys=[reporter_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


class ModerationAuditLog(Base):
    __tablename__ = "moderation_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    moderator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # hide_post | restore_post | delete_comment | resolve_report | dismiss_report
    target_type = Column(String(50), nullable=False)  # post | comment | report
    target_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    moderator = relationship("User", foreign_keys=[moderator_id])



class Collection(Base):
    __tablename__ = "collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, nullable=False, default=True)
    cover_image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", foreign_keys=[user_id])
    posts = relationship("CommunityPost", secondary=collection_posts)

