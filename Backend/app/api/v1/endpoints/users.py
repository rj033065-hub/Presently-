from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    ProfileResponse,
    ProfileUpdate,
    SettingsResponse,
    SettingsUpdate,
)
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve current authenticated user credentials and role.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update username for current authenticated user.
    """
    updated_user = await UserService.update_user(db, current_user, update_data)
    return updated_user


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve extended profile details for current user.
    """
    profile = await UserService.get_profile(db, current_user.id)
    return profile


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update extended profile (full name, avatar, bio, currency, theme).
    """
    profile = await UserService.update_profile(db, current_user, update_data)
    return profile


@router.get("/settings", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve notification & privacy settings for current user.
    """
    settings = await UserService.get_settings(db, current_user.id)
    return settings


@router.put("/settings", response_model=SettingsResponse)
async def update_settings(
    update_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update notification & privacy settings for current user.
    """
    settings = await UserService.update_settings(db, current_user, update_data)
    return settings
