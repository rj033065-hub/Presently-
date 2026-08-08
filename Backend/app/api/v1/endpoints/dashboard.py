from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func
from datetime import date
from uuid import UUID

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.survey import Survey, Recipient, AIRecommendation, AIRecommendationItem
from app.models.community import CommunityPost, SavedPost
from app.repositories.wishlist_repository import WishlistRepository
from app.repositories.planner_repository import PlannerRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    DashboardOverviewMetrics,
    UserActivityResponse,
    UnfinishedSurveyItem,
    RecentRecommendationItem,
    UpcomingOccasionItem
)

router = APIRouter()
wishlist_repo = WishlistRepository()
planner_repo = PlannerRepository()
activity_repo = ActivityRepository()


@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. User Name & Avatar
    user_name = current_user.full_name or current_user.username or "Gifter"
    user_avatar = current_user.avatar_url

    # 2. Aggregated Metrics
    total_wishlists = await wishlist_repo.count_user_wishlists(db, current_user.id)
    saved_gifts = await wishlist_repo.count_user_saved_gifts(db, current_user.id)

    # Saved Recommendations count
    rec_count_res = await db.execute(
        select(func.count(AIRecommendation.id)).where(AIRecommendation.user_id == current_user.id)
    )
    saved_recommendations = rec_count_res.scalar() or 0

    # Upcoming Occasions count
    upcoming_occasions_count = await planner_repo.count_upcoming_occasions(db, current_user.id)

    # Community Posts count
    post_count_res = await db.execute(
        select(func.count(CommunityPost.id)).where(
            CommunityPost.author_id == current_user.id,
            CommunityPost.deleted_at.is_(None)
        )
    )
    community_posts = post_count_res.scalar() or 0

    # Completed Surveys count
    survey_count_res = await db.execute(
        select(func.count(Survey.id)).where(
            Survey.user_id == current_user.id,
            Survey.status == "submitted"
        )
    )
    completed_surveys = survey_count_res.scalar() or 0

    metrics = DashboardOverviewMetrics(
        total_wishlists=total_wishlists,
        saved_gifts=saved_gifts,
        saved_recommendations=saved_recommendations,
        upcoming_occasions=upcoming_occasions_count,
        community_posts=community_posts,
        completed_surveys=completed_surveys
    )

    # 3. Recent Activities
    activities = await activity_repo.get_user_activities(db, current_user.id, limit=5)
    recent_activities = [
        UserActivityResponse(
            id=act.id,
            activity_type=act.activity_type,
            title=act.title,
            description=act.description,
            target_url=act.target_url,
            created_at=act.created_at
        ) for act in activities
    ]

    # 4. Unfinished Surveys (drafts)
    draft_surveys_res = await db.execute(
        select(Survey)
        .options(joinedload(Survey.recipient))
        .where(
            Survey.user_id == current_user.id,
            Survey.status == "draft"
        )
        .order_by(Survey.updated_at.desc())
        .limit(3)
    )
    draft_surveys = draft_surveys_res.scalars().all()
    unfinished_surveys = []
    for survey in draft_surveys:
        recipient_name = survey.recipient.name if survey.recipient else survey.survey_payload.get("recipient_name")
        step = survey.current_step or 1
        progress_pct = min(100, int((step / 12) * 100))
        unfinished_surveys.append(
            UnfinishedSurveyItem(
                id=survey.id,
                occasion=survey.occasion or "Gift Survey",
                recipient_name=recipient_name,
                current_step=step,
                total_steps=12,
                progress_percentage=progress_pct,
                updated_at=survey.updated_at
            )
        )

    # 5. Recommended For You (Top recent AI recommendation items)
    recent_rec_res = await db.execute(
        select(AIRecommendationItem)
        .join(AIRecommendation, AIRecommendationItem.recommendation_id == AIRecommendation.id)
        .options(joinedload(AIRecommendationItem.recommendation))
        .where(AIRecommendation.user_id == current_user.id)
        .order_by(AIRecommendationItem.match_score.desc(), AIRecommendation.created_at.desc())
        .limit(4)
    )
    recent_rec_items = recent_rec_res.scalars().all()
    recommended_for_you = []
    for rec_item in recent_rec_items:
        rec = rec_item.recommendation
        recommended_for_you.append(
            RecentRecommendationItem(
                id=rec_item.id,
                recommendation_id=rec.id,
                gift_title=rec_item.title,
                gift_image_url=rec_item.image_url,
                match_score=rec_item.match_score,
                estimated_price=rec_item.estimated_price,
                currency=rec_item.currency or "USD",
                ai_reasoning=rec_item.ai_reasoning,
                recipient_name=rec.recipient_name if rec else None,
                occasion=rec.occasion if rec else None,
                is_favorite=rec.is_favorite if rec else False,
                buy_url=rec_item.buy_url
            )
        )

    # 6. Upcoming Occasions
    plans = await planner_repo.get_upcoming(db, current_user.id, limit=5)
    today = date.today()
    upcoming_occasions = []
    for p in plans:
        days_rem = (p.event_date - today).days
        rem_budget = float(p.planned_budget) - float(p.actual_spending)
        upcoming_occasions.append(
            UpcomingOccasionItem(
                id=p.id,
                recipient_name=p.recipient_name,
                recipient_relationship=p.recipient_relationship,
                occasion=p.occasion,
                event_date=p.event_date,
                days_remaining=max(0, days_rem),
                planned_budget=p.planned_budget,
                actual_spending=p.actual_spending,
                remaining_budget=max(0.0, rem_budget),
                currency=p.currency,
                status=p.status
            )
        )

    return DashboardOverviewResponse(
        user_name=user_name,
        user_avatar=user_avatar,
        metrics=metrics,
        recent_activities=recent_activities,
        unfinished_surveys=unfinished_surveys,
        recommended_for_you=recommended_for_you,
        upcoming_occasions=upcoming_occasions
    )


@router.get("/activity", response_model=List[UserActivityResponse])
async def get_dashboard_activities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activities = await activity_repo.get_user_activities(
        db, user_id=current_user.id, limit=limit, offset=offset
    )
    return [
        UserActivityResponse(
            id=act.id,
            activity_type=act.activity_type,
            title=act.title,
            description=act.description,
            target_url=act.target_url,
            created_at=act.created_at
        ) for act in activities
    ]
