from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user import User, UserProfile, UserSettings, AuditLog, RoleEnum
from app.schemas.user import UserUpdate, ProfileUpdate, SettingsUpdate, AuthSyncRequest
from typing import Optional
import logging

logger = logging.getLogger("presently.user_service")


class UserService:
    @staticmethod
    async def get_or_create_user(db: AsyncSession, sync_data: AuthSyncRequest) -> User:
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile), selectinload(User.settings))
            .where(User.clerk_id == sync_data.clerk_id)
        )
        user = result.scalars().first()

        if not user:
            # Generate fallback username if missing
            username = sync_data.username or sync_data.email.split("@")[0]
            # Ensure unique username
            existing_user = await db.execute(select(User).where(User.username == username))
            if existing_user.scalars().first():
                username = f"{username}_{sync_data.clerk_id[-6:]}"

            user = User(
                clerk_id=sync_data.clerk_id,
                email=sync_data.email,
                username=username,
                role=RoleEnum.REGISTERED_USER.value,
            )
            db.add(user)
            await db.flush()

            # Create default profile
            profile = UserProfile(
                user_id=user.id,
                full_name=sync_data.full_name,
                avatar_url=sync_data.avatar_url,
            )
            db.add(profile)

            # Create default settings
            settings = UserSettings(user_id=user.id)
            db.add(settings)

            # Audit log entry
            audit = AuditLog(
                user_id=user.id,
                action="USER_REGISTERED_SYNC",
                payload={"email": user.email, "clerk_id": user.clerk_id},
            )
            db.add(audit)

            await db.commit()
            await db.refresh(user)

        return user

    @staticmethod
    async def get_profile(db: AsyncSession, user_id) -> UserProfile:
        result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalars().first()
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return profile

    @staticmethod
    async def update_profile(db: AsyncSession, user: User, update_data: ProfileUpdate) -> UserProfile:
        profile = await UserService.get_profile(db, user.id)
        
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
            
        audit = AuditLog(
            user_id=user.id,
            action="USER_PROFILE_UPDATED",
            payload=update_data.model_dump(exclude_unset=True),
        )
        db.add(audit)

        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def get_settings(db: AsyncSession, user_id) -> UserSettings:
        result = await db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
        settings = result.scalars().first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.add(settings)
            await db.commit()
            await db.refresh(settings)
        return settings

    @staticmethod
    async def update_settings(db: AsyncSession, user: User, update_data: SettingsUpdate) -> UserSettings:
        settings = await UserService.get_settings(db, user.id)
        
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(settings, key, value)

        audit = AuditLog(
            user_id=user.id,
            action="USER_SETTINGS_UPDATED",
            payload=update_data.model_dump(exclude_unset=True),
        )
        db.add(audit)

        await db.commit()
        await db.refresh(settings)
        return settings

    @staticmethod
    async def update_user(db: AsyncSession, user: User, update_data: UserUpdate) -> User:
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)
            
        await db.commit()
        await db.refresh(user)
        return user
