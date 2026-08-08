from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.core.security import get_current_user, require_role
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/overview")
async def get_overview_analytics(
    range_key: str = Query("30d", description="Time range (today, 7d, 30d, 90d, this_year, all)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_overview_analytics(db, range_key)


@router.get("/users")
async def get_user_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_user_analytics(db, range_key)


@router.get("/surveys")
async def get_survey_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_survey_analytics(db, range_key)


@router.get("/ai")
async def get_ai_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_ai_analytics(db, range_key)


@router.get("/gifts")
async def get_gift_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_gift_analytics(db, range_key)


@router.get("/community")
async def get_community_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_community_analytics(db, range_key)


@router.get("/wishlists")
async def get_wishlist_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_wishlist_analytics(db, range_key)


@router.get("/planner")
async def get_planner_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_planner_analytics(db, range_key)


@router.get("/notifications")
async def get_notification_analytics(
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR])),
):
    return await AnalyticsService.get_notification_analytics(db, range_key)


@router.get("/export")
async def export_analytics_data(
    category_type: str = Query("overview", description="overview, users, surveys, ai"),
    format_type: str = Query("csv", description="csv or json"),
    range_key: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN])),
):
    content, media_type = await AnalyticsService.export_analytics_data(db, category_type, format_type, range_key)
    filename = f"presently_analytics_{category_type}_{range_key}.{format_type}"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# Personal User Insights endpoint (Available to any authenticated user for their own metrics)
personal_router = APIRouter()


@personal_router.get("/insights")
async def get_personal_user_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await AnalyticsService.get_personal_user_insights(db, current_user.id)
