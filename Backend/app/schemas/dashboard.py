from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class UserActivityResponse(BaseModel):
    id: UUID
    activity_type: str
    title: str
    description: Optional[str] = None
    target_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardOverviewMetrics(BaseModel):
    total_wishlists: int
    saved_gifts: int
    saved_recommendations: int
    upcoming_occasions: int
    community_posts: int
    completed_surveys: int


class UnfinishedSurveyItem(BaseModel):
    id: UUID
    occasion: str
    recipient_name: Optional[str] = None
    current_step: int
    total_steps: int = 12
    progress_percentage: int
    updated_at: datetime


class RecentRecommendationItem(BaseModel):
    id: UUID
    recommendation_id: UUID
    gift_title: str
    gift_image_url: Optional[str] = None
    match_score: int
    estimated_price: Decimal
    currency: str
    ai_reasoning: str
    recipient_name: Optional[str] = None
    occasion: Optional[str] = None
    is_favorite: bool = False
    buy_url: Optional[str] = None


class UpcomingOccasionItem(BaseModel):
    id: UUID
    recipient_name: str
    recipient_relationship: Optional[str] = None
    occasion: str
    event_date: date
    days_remaining: int
    planned_budget: Decimal
    actual_spending: Decimal
    remaining_budget: Decimal
    currency: str
    status: str


class DashboardOverviewResponse(BaseModel):
    user_name: str
    user_avatar: Optional[str] = None
    metrics: DashboardOverviewMetrics
    recent_activities: List[UserActivityResponse] = []
    unfinished_surveys: List[UnfinishedSurveyItem] = []
    recommended_for_you: List[RecentRecommendationItem] = []
    upcoming_occasions: List[UpcomingOccasionItem] = []


class SavedItemResponse(BaseModel):
    id: UUID
    item_type: str  # post | collection | gift
    title: str
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    target_url: str
    created_at: datetime
    metadata_json: Optional[dict] = None
