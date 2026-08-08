from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.survey import AIRecommendation, AIRecommendationItem


class RecommendationRepository(BaseRepository[AIRecommendation]):
    def __init__(self):
        super().__init__(AIRecommendation)

    async def get_by_id_with_items(self, db: AsyncSession, rec_id: UUID) -> Optional[AIRecommendation]:
        result = await db.execute(
            select(AIRecommendation)
            .options(
                selectinload(AIRecommendation.items).selectinload(AIRecommendationItem.gift_item)
            )
            .where(AIRecommendation.id == rec_id)
        )
        return result.scalars().first()

    async def get_by_survey_id(self, db: AsyncSession, survey_id: UUID) -> Optional[AIRecommendation]:
        result = await db.execute(
            select(AIRecommendation)
            .options(
                selectinload(AIRecommendation.items).selectinload(AIRecommendationItem.gift_item)
            )
            .where(AIRecommendation.survey_id == survey_id)
        )
        return result.scalars().first()

    async def get_user_recommendations(
        self, db: AsyncSession, user_id: UUID, limit: int = 20, skip: int = 0
    ) -> List[AIRecommendation]:
        result = await db.execute(
            select(AIRecommendation)
            .options(
                selectinload(AIRecommendation.items).selectinload(AIRecommendationItem.gift_item)
            )
            .where(AIRecommendation.user_id == user_id)
            .order_by(AIRecommendation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_share_token(self, db: AsyncSession, share_token: str) -> Optional[AIRecommendation]:
        result = await db.execute(
            select(AIRecommendation)
            .options(
                selectinload(AIRecommendation.items).selectinload(AIRecommendationItem.gift_item)
            )
            .where(AIRecommendation.share_token == share_token)
        )
        return result.scalars().first()

    async def create_recommendation_with_items(
        self,
        db: AsyncSession,
        rec_data: Dict[str, Any],
        items_data: List[Dict[str, Any]],
    ) -> AIRecommendation:
        # Delete existing recommendation for this survey if re-generating
        existing = await self.get_by_survey_id(db, rec_data["survey_id"])
        if existing:
            await db.delete(existing)
            await db.commit()

        rec = AIRecommendation(**rec_data)
        db.add(rec)
        await db.flush()

        for item_in in items_data:
            item_in["recommendation_id"] = rec.id
            db.add(AIRecommendationItem(**item_in))

        await db.commit()
        return await self.get_by_id_with_items(db, rec.id)

    async def toggle_favorite(self, db: AsyncSession, rec_id: UUID, user_id: Optional[UUID]) -> AIRecommendation:
        rec = await self.get_by_id_with_items(db, rec_id)
        if rec:
            rec.is_favorite = not rec.is_favorite
            db.add(rec)
            await db.commit()
            await db.refresh(rec)
        return rec
