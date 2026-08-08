from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", status_code=200)
async def health_check():
    """
    Health check endpoint returning platform operational metrics.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }
