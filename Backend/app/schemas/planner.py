from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


class GiftPlanCreate(BaseModel):
    recipient_name: str = Field(..., min_length=1, max_length=255)
    recipient_relationship: Optional[str] = Field(None, max_length=100)
    occasion: str = Field(..., min_length=1, max_length=100)
    event_date: date
    planned_budget: Decimal = Field(default=Decimal("0.0"), ge=0)
    actual_spending: Decimal = Field(default=Decimal("0.0"), ge=0)
    currency: str = Field(default="USD", max_length=10)
    status: str = Field(
        default="planning",
        pattern="^(planning|gift_selected|purchased|delivered|completed)$"
    )
    gift_idea: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None


class GiftPlanUpdate(BaseModel):
    recipient_name: Optional[str] = Field(None, min_length=1, max_length=255)
    recipient_relationship: Optional[str] = Field(None, max_length=100)
    occasion: Optional[str] = Field(None, max_length=100)
    event_date: Optional[date] = None
    planned_budget: Optional[Decimal] = Field(None, ge=0)
    actual_spending: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=10)
    status: Optional[str] = Field(
        None,
        pattern="^(planning|gift_selected|purchased|delivered|completed)$"
    )
    gift_idea: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None


class GiftPlanResponse(BaseModel):
    id: UUID
    user_id: UUID
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
    gift_idea: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
