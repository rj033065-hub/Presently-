from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


class GiftCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    parent_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class GiftTagResponse(BaseModel):
    id: UUID
    name: str
    slug: str

    class Config:
        from_attributes = True


class GiftItemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    brand: Optional[str] = "Generic"
    short_description: Optional[str] = None
    description: str
    estimated_price: float = Field(..., ge=0.0)
    currency: Optional[str] = "USD"
    category_id: UUID
    affiliate_url: str
    purchase_url: Optional[str] = None
    merchant_name: Optional[str] = "Amazon"
    primary_image_url: str
    is_handmade: Optional[bool] = False
    gift_type: Optional[str] = "Physical"
    shipping_info: Optional[str] = None
    personalization_options: Optional[str] = None
    suitable_occasions: Optional[List[str]] = []
    suitable_relationships: Optional[List[str]] = []
    suitable_interests: Optional[List[str]] = []
    suitable_personalities: Optional[List[str]] = []


class GiftItemCreate(GiftItemBase):
    slug: str
    tag_ids: Optional[List[UUID]] = []


class GiftItemUpdate(BaseModel):
    title: Optional[str] = None
    brand: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    estimated_price: Optional[float] = None
    currency: Optional[str] = None
    category_id: Optional[UUID] = None
    affiliate_url: Optional[str] = None
    purchase_url: Optional[str] = None
    merchant_name: Optional[str] = None
    primary_image_url: Optional[str] = None
    is_handmade: Optional[bool] = None
    gift_type: Optional[str] = None
    shipping_info: Optional[str] = None
    personalization_options: Optional[str] = None
    suitable_occasions: Optional[List[str]] = None
    suitable_relationships: Optional[List[str]] = None
    suitable_interests: Optional[List[str]] = None
    suitable_personalities: Optional[List[str]] = None


class GiftItemResponse(GiftItemBase):
    id: UUID
    slug: str
    is_verified: bool
    popularity_score: int
    rating_avg: float
    rating_count: int
    created_at: datetime
    category: Optional[GiftCategoryResponse] = None
    tags: Optional[List[GiftTagResponse]] = []

    class Config:
        from_attributes = True


class GiftItemListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[GiftItemResponse]


class CandidateMatchItemResponse(BaseModel):
    gift: GiftItemResponse
    match_score: int
    strategy_label: str
    reasoning: str
