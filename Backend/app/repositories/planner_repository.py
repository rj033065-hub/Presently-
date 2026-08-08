from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from app.repositories.base import BaseRepository
from app.models.planner import GiftPlan


class PlannerRepository(BaseRepository[GiftPlan]):
    def __init__(self):
        super().__init__(GiftPlan)

    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[GiftPlan]:
        result = await db.execute(
            select(GiftPlan)
            .where(
                GiftPlan.user_id == user_id,
                GiftPlan.deleted_at.is_(None)
            )
            .order_by(GiftPlan.event_date.asc())
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, db: AsyncSession, plan_id: UUID, user_id: UUID) -> Optional[GiftPlan]:
        result = await db.execute(
            select(GiftPlan)
            .where(
                GiftPlan.id == plan_id,
                GiftPlan.user_id == user_id,
                GiftPlan.deleted_at.is_(None)
            )
        )
        return result.scalars().first()

    async def count_upcoming_occasions(self, db: AsyncSession, user_id: UUID) -> int:
        today = date.today()
        result = await db.execute(
            select(func.count(GiftPlan.id)).where(
                GiftPlan.user_id == user_id,
                GiftPlan.event_date >= today,
                GiftPlan.deleted_at.is_(None)
            )
        )
        return result.scalar() or 0

    async def get_upcoming(self, db: AsyncSession, user_id: UUID, limit: int = 5) -> List[GiftPlan]:
        today = date.today()
        result = await db.execute(
            select(GiftPlan)
            .where(
                GiftPlan.user_id == user_id,
                GiftPlan.event_date >= today,
                GiftPlan.deleted_at.is_(None)
            )
            .order_by(GiftPlan.event_date.asc())
            .limit(limit)
        )
        return list(result.scalars().all())
