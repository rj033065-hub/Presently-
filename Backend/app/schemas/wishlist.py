from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class WishlistItemCreate(BaseModel):
    gift_item_id: UUID
    notes: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    target_price: Optional[Decimal] = Field(default=None, ge=0)
    status: str = Field(default="considering", pattern="^(considering|planned|purchased|reserved)$")


class WishlistItemUpdate(BaseModel):
    notes: Optional[str] = None
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high)$")
    target_price: Optional[Decimal] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, pattern="^(considering|planned|purchased|reserved)$")
    display_order: Optional[int] = None


class WishlistItemResponse(BaseModel):
    id: UUID
    wishlist_id: UUID
    gift_item_id: UUID
    notes: Optional[str] = None
    priority: str
    target_price: Optional[Decimal] = None
    status: str
    display_order: int
    added_at: datetime
    updated_at: datetime
    gift_title: Optional[str] = None
    gift_image_url: Optional[str] = None
    gift_price: Optional[Decimal] = None
    buy_url: Optional[str] = None

    class Config:
        from_attributes = True


class WishlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = False


class WishlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: Optional[bool] = None


class WishlistResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    is_public: bool
    share_token: Optional[str] = None
    items: List[WishlistItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WishlistShareResponse(BaseModel):
    share_token: str
    share_url: str
    is_public: bool

