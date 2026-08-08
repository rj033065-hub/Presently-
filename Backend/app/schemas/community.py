from enum import Enum
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PostStatus(str, Enum):
    DRAFT = "Draft"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"


class PostVisibility(str, Enum):
    PUBLIC = "Public"
    PRIVATE = "Private"
    UNLISTED = "Unlisted"


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Tag Schemas ---
class TagBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    slug: str = Field(..., min_length=2, max_length=50)


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Image Schemas ---
class PostImageCreate(BaseModel):
    image_url: str = Field(..., min_length=5)
    alt_text: Optional[str] = Field(None, max_length=255)
    display_order: int = Field(0, ge=0)


class PostImageResponse(BaseModel):
    id: UUID
    post_id: UUID
    image_url: str
    alt_text: Optional[str] = None
    display_order: int

    model_config = ConfigDict(from_attributes=True)


# --- Author Nested Schema ---
class AuthorResponse(BaseModel):
    id: UUID
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


# --- Comment Schemas ---
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[UUID] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    parent_id: Optional[UUID] = None
    content: str
    author: Optional[AuthorResponse] = None
    replies: List["CommentResponse"] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CommentListResponse(BaseModel):
    items: List[CommentResponse]
    total: int
    page: int
    limit: int
    pages: int


# --- Interaction Schemas ---
class LikeResponse(BaseModel):
    liked: bool
    likes_count: int


class SaveResponse(BaseModel):
    saved: bool


# --- Post Schemas ---
class CommunityPostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=10)
    cover_image_url: Optional[str] = None
    status: PostStatus = PostStatus.DRAFT
    visibility: PostVisibility = PostVisibility.PUBLIC
    gift_item_id: Optional[UUID] = None
    category_ids: Optional[List[UUID]] = Field(default_factory=list)
    tag_ids: Optional[List[UUID]] = Field(default_factory=list)
    images: Optional[List[PostImageCreate]] = Field(default_factory=list)


class CommunityPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = Field(None, min_length=10)
    cover_image_url: Optional[str] = None
    status: Optional[PostStatus] = None
    visibility: Optional[PostVisibility] = None
    gift_item_id: Optional[UUID] = None
    category_ids: Optional[List[UUID]] = None
    tag_ids: Optional[List[UUID]] = None
    images: Optional[List[PostImageCreate]] = None


class CommunityPostResponse(BaseModel):
    id: UUID
    author_id: UUID
    author: Optional[AuthorResponse] = None
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_image_url: Optional[str] = None
    status: PostStatus
    visibility: PostVisibility
    reading_time: int
    view_count: int
    gift_item_id: Optional[UUID] = None
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    is_saved: bool = False
    categories: List[CategoryResponse] = Field(default_factory=list)
    tags: List[TagResponse] = Field(default_factory=list)
    images: List[PostImageResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommunityPostListResponse(BaseModel):
    items: List[CommunityPostResponse]
    total: int
    page: int
    limit: int
    pages: int


# --- Collection Schemas ---
class CollectionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = True
    cover_image_url: Optional[str] = None


class CollectionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None
    cover_image_url: Optional[str] = None


class CollectionResponse(BaseModel):
    id: UUID
    user_id: UUID
    author: Optional[AuthorResponse] = None
    title: str
    slug: str
    description: Optional[str] = None
    is_public: bool
    cover_image_url: Optional[str] = None
    posts_count: int = 0
    posts: List[CommunityPostResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CollectionListResponse(BaseModel):
    items: List[CollectionResponse]
    total: int
    page: int
    limit: int
    pages: int


# --- Autocomplete & Global Search Schemas ---
class AutocompleteSuggestion(BaseModel):
    type: str  # post | category | tag | gift | author
    id: str
    title: str
    subtitle: Optional[str] = None
    url: str
    imageUrl: Optional[str] = None


class AutocompleteResponse(BaseModel):
    suggestions: List[AutocompleteSuggestion]


# --- Report & Moderation Schemas ---
class ReportCreate(BaseModel):
    target_type: str = Field(..., description="post | comment | user")
    target_id: UUID
    reason: str = Field(..., min_length=2, max_length=100)
    details: Optional[str] = Field(None, max_length=1000)


class ReportResponse(BaseModel):
    id: UUID
    reporter_id: UUID
    reporter: Optional[AuthorResponse] = None
    target_type: str
    target_id: UUID
    reason: str
    details: Optional[str] = None
    status: str
    resolved_by: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    limit: int
    pages: int


class ReportActionRequest(BaseModel):
    status: str = Field(..., description="reviewed | dismissed | actioned")
    notes: Optional[str] = Field(None, max_length=500)


class ModerationAuditLogResponse(BaseModel):
    id: UUID
    moderator_id: UUID
    action: str
    target_type: str
    target_id: UUID
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

