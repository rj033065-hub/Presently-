from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.schemas.recommendation import (
    GenerateRecommendationRequest,
    AIRecommendationResponse,
    ShareResponse,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter()
rec_service = RecommendationService()


@router.post("/generate", response_model=AIRecommendationResponse, status_code=status.HTTP_201_CREATED)
async def generate_recommendations(
    req: GenerateRecommendationRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate AI-powered gift recommendations from a completed survey.
    """
    user_id = current_user.id if current_user else None
    rec = await rec_service.generate_recommendation(
        db, survey_id=req.survey_id, user_id=user_id, force_regenerate=req.force_regenerate
    )
    return rec


@router.get("", response_model=List[AIRecommendationResponse])
async def list_user_recommendations(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List previous AI recommendation history for current user.
    """
    recommendations = await rec_service.get_user_recommendations(
        db, user_id=current_user.id, limit=limit, skip=skip
    )
    return recommendations


@router.get("/share/{token}", response_model=AIRecommendationResponse)
async def get_shared_recommendation(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Public Endpoint: Fetch shared AI gift recommendations by share token.
    """
    rec = await rec_service.get_by_share_token(db, share_token=token)
    return rec


@router.get("/{id}", response_model=AIRecommendationResponse)
async def get_recommendation_by_id(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch a single AI recommendation by ID.
    """
    user_id = current_user.id if current_user else None
    rec = await rec_service.get_recommendation_by_id(db, rec_id=id, user_id=user_id)
    return rec


@router.post("/{id}/favorite", response_model=AIRecommendationResponse)
async def toggle_favorite_recommendation(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Toggle favorite status on a recommendation run.
    """
    user_id = current_user.id if current_user else None
    rec = await rec_service.toggle_favorite(db, rec_id=id, user_id=user_id)
    return rec


@router.post("/{id}/regenerate", response_model=AIRecommendationResponse)
async def regenerate_recommendation(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Re-run the AI pipeline to regenerate new gift ideas for an existing survey.
    """
    user_id = current_user.id if current_user else None
    existing_rec = await rec_service.get_recommendation_by_id(db, rec_id=id, user_id=user_id)
    new_rec = await rec_service.generate_recommendation(
        db, survey_id=existing_rec.survey_id, user_id=user_id, force_regenerate=True
    )
    return new_rec


@router.post("/{id}/share", response_model=ShareResponse)
async def share_recommendation(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate public share link for a recommendation.
    """
    user_id = current_user.id if current_user else None
    rec = await rec_service.get_recommendation_by_id(db, rec_id=id, user_id=user_id)
    share_url = f"http://localhost:3000/share/{rec.share_token}"
    return ShareResponse(
        success=True,
        share_token=rec.share_token or "",
        share_url=share_url,
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a recommendation.
    """
    user_id = current_user.id if current_user else None
    await rec_service.delete_recommendation(db, rec_id=id, user_id=user_id)
    return None
