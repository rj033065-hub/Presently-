from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.activity import UserActivity


class ActivityRepository(BaseRepository[UserActivity]):
    def __init__(self):
        super().__init__(UserActivity)

    async def log_activity(
        self,
        db: AsyncSession,
        user_id: UUID,
        activity_type: str,
        title: str,
        description: Optional[str] = None,
        target_url: Optional[str] = None
    ) -> UserActivity:
        activity = UserActivity(
            user_id=user_id,
            activity_type=activity_type,
            title=title,
            description=description,
            target_url=target_url
        )
        db.add(activity)
        await db.commit()
        await db.refresh(activity)
        return activity

    async def get_user_activities(
        self,
        db: AsyncSession,
        user_id: UUID,
        limit: int = 10,
        offset: int = 0
    ) -> List[UserActivity]:
        result = await db.execute(
            select(UserActivity)
            .where(UserActivity.user_id == user_id)
            .order_by(UserActivity.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())
