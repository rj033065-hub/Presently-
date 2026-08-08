from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, auth, users, surveys, recommendations, gifts, search, community, uploads,
    dashboard, wishlists, planner, saved, notifications, reminders, admin, analytics
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["Surveys"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(gifts.router, tags=["Gifts"])
api_router.include_router(search.router, tags=["Search"])
api_router.include_router(community.router, prefix="/community", tags=["Community"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(wishlists.router, prefix="/wishlists", tags=["Wishlists"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(saved.router, prefix="/saved", tags=["Saved"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(analytics.router, prefix="/admin/analytics", tags=["Admin Analytics"])
api_router.include_router(analytics.personal_router, prefix="/dashboard", tags=["Personal Analytics"])



