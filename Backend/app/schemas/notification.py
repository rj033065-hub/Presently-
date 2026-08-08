from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    link_url: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPreferenceResponse(BaseModel):
    id: UUID
    user_id: UUID
    in_app_enabled: bool
    email_enabled: bool
    occasion_reminders: bool
    gift_plan_reminders: bool
    community_notifications: bool
    recommendation_notifications: bool
    marketing_notifications: bool
    frequency: str
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferenceUpdate(BaseModel):
    in_app_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    occasion_reminders: Optional[bool] = None
    gift_plan_reminders: Optional[bool] = None
    community_notifications: Optional[bool] = None
    recommendation_notifications: Optional[bool] = None
    marketing_notifications: Optional[bool] = None
    frequency: Optional[str] = Field(None, pattern=r"^(immediate|daily_digest|weekly_digest|disabled)$")
