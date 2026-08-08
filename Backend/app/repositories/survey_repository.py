from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.survey import Recipient, Survey


class RecipientRepository(BaseRepository[Recipient]):
    def __init__(self):
        super().__init__(Recipient)

    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[Recipient]:
        result = await db.execute(select(Recipient).where(Recipient.user_id == user_id))
        return list(result.scalars().all())


class SurveyRepository(BaseRepository[Survey]):
    def __init__(self):
        super().__init__(Survey)

    async def get_by_user(
        self, db: AsyncSession, user_id: UUID, status: Optional[str] = None, limit: int = 20, skip: int = 0
    ) -> List[Survey]:
        query = select(Survey).where(Survey.user_id == user_id)
        if status:
            query = query.where(Survey.status == status)
        query = query.order_by(Survey.updated_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_active_draft(self, db: AsyncSession, user_id: UUID) -> Optional[Survey]:
        query = (
            select(Survey)
            .where(Survey.user_id == user_id, Survey.status == "draft")
            .order_by(Survey.updated_at.desc())
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_history(self, db: AsyncSession, user_id: UUID, limit: int = 50) -> List[Survey]:
        query = (
            select(Survey)
            .where(Survey.user_id == user_id, Survey.status.in_(["submitted", "completed"]))
            .order_by(Survey.updated_at.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())
