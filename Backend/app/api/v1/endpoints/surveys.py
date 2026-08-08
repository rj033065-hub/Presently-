from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.schemas.survey import (
    SurveyCreate,
    SurveyUpdate,
    SurveyResponse,
    SurveySubmitResponse,
)
from app.services.survey_service import SurveyService

router = APIRouter()
survey_service = SurveyService()


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    survey_in: SurveyCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new survey or draft payload.
    """
    user_id = current_user.id if current_user else None
    survey = await survey_service.create_survey(db, user_id=user_id, survey_in=survey_in)
    return survey


@router.get("", response_model=List[SurveyResponse])
async def list_surveys(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all surveys belonging to the authenticated user.
    """
    surveys = await survey_service.get_surveys_by_user(db, user_id=current_user.id, status=status_filter)
    return surveys


@router.get("/history", response_model=List[SurveyResponse])
async def get_survey_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve survey history for submitted surveys.
    """
    history = await survey_service.get_user_history(db, user_id=current_user.id)
    return history


@router.get("/draft", response_model=Optional[SurveyResponse])
async def get_active_draft(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Check if the user has an unfinished survey draft to resume.
    """
    draft = await survey_service.get_active_draft(db, user_id=current_user.id)
    return draft


@router.get("/{id}", response_model=SurveyResponse)
async def get_survey_by_id(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch a single survey by ID.
    """
    user_id = current_user.id if current_user else None
    survey = await survey_service.get_survey(db, survey_id=id, user_id=user_id)
    return survey


@router.put("/{id}", response_model=SurveyResponse)
async def update_survey(
    id: UUID,
    update_in: SurveyUpdate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update survey draft answers, progress step, or metadata.
    """
    user_id = current_user.id if current_user else None
    updated_survey = await survey_service.update_survey(
        db, survey_id=id, user_id=user_id, update_in=update_in
    )
    return updated_survey


@router.post("/{id}/submit", response_model=SurveySubmitResponse)
async def submit_survey(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Finalize and submit a survey for AI processing.
    """
    user_id = current_user.id if current_user else None
    submitted_survey = await survey_service.submit_survey(db, survey_id=id, user_id=user_id)
    return SurveySubmitResponse(
        success=True,
        survey_id=submitted_survey.id,
        status=submitted_survey.status,
        message="Survey submitted successfully! Structured data prepared for AI matching.",
        estimated_ai_processing_time="30-45 seconds",
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete or archive a survey.
    """
    user_id = current_user.id if current_user else None
    await survey_service.delete_survey(db, survey_id=id, user_id=user_id)
    return None
