from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime, date


class RecipientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    relationship: str = Field(..., min_length=1, max_length=100)
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    notes: Optional[str] = None


class RecipientResponse(RecipientCreate):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SurveyCreate(BaseModel):
    recipient_id: Optional[UUID] = None
    occasion: Optional[str] = Field("Other", max_length=100)
    min_budget: Optional[float] = Field(0.0, ge=0.0)
    max_budget: Optional[float] = Field(100.0, ge=0.0)
    status: Optional[str] = Field("draft", max_length=50)
    current_step: Optional[int] = Field(1, ge=1, le=12)
    survey_payload: Dict[str, Any] = Field(default_factory=dict)


class SurveyUpdate(BaseModel):
    occasion: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    status: Optional[str] = None
    current_step: Optional[int] = None
    survey_payload: Optional[Dict[str, Any]] = None


class SurveyResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    recipient_id: Optional[UUID] = None
    occasion: str
    min_budget: float
    max_budget: float
    status: str
    current_step: int
    survey_payload: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SurveySubmitResponse(BaseModel):
    success: bool
    survey_id: UUID
    status: str
    message: str
    estimated_ai_processing_time: str = "30-45 seconds"
