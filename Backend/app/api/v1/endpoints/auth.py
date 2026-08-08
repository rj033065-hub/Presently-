from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import AuthSyncRequest, UserResponse
from app.services.user_service import UserService

router = APIRouter()


@router.post("/sync", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def sync_user(sync_data: AuthSyncRequest, db: AsyncSession = Depends(get_db)):
    """
    Synchronizes user authentication state from Clerk to PostgreSQL.
    """
    user = await UserService.get_or_create_user(db, sync_data)
    return user
