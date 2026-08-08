from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.schemas.gift import GiftItemResponse


class GenerateRecommendationRequest(BaseModel):
    survey_id: UUID
    force_regenerate: Optional[bool] = False


class RecommendationItemResponse(BaseModel):
    id: UUID
    gift_item_id: Optional[UUID] = None
    title: str
    category: str
    estimated_price: float
    currency: str = "USD"
    match_score: int = Field(..., ge=0, le=100)
    strategy_label: str
    ai_reasoning: str
    pros: Optional[List[str]] = []
    cons: Optional[List[str]] = []
    personalization_tips: Optional[str] = None
    buy_url: Optional[str] = None
    image_url: Optional[str] = None
    is_fallback: bool = False
    gift_item: Optional[GiftItemResponse] = None

    class Config:
        from_attributes = True


class AIRecommendationResponse(BaseModel):
    id: UUID
    survey_id: UUID
    user_id: Optional[UUID] = None
    recipient_name: Optional[str] = None
    occasion: Optional[str] = None
    ai_model_used: str
    prompt_tokens: int
    completion_tokens: int
    execution_time_ms: int
    is_favorite: bool = False
    share_token: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    items: List[RecommendationItemResponse] = []

    class Config:
        from_attributes = True


class ShareResponse(BaseModel):
    success: bool
    share_token: str
    share_url: str
