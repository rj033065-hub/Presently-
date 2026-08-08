from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.gift_repository import GiftRepository, GiftCategoryRepository, GiftTagRepository
from app.repositories.survey_repository import SurveyRepository
from app.models.gift import GiftItem, GiftCategory, GiftTag
from app.schemas.gift import GiftItemCreate, GiftItemUpdate, CandidateMatchItemResponse
from app.services.matching_engine import calculate_gift_match_score
from app.exceptions.custom_exceptions import NotFoundException, BadRequestException


class GiftService:
    def __init__(self):
        self.gift_repo = GiftRepository()
        self.category_repo = GiftCategoryRepository()
        self.tag_repo = GiftTagRepository()
        self.survey_repo = SurveyRepository()

    async def get_gift_by_id(self, db: AsyncSession, gift_id: UUID) -> GiftItem:
        gift = await self.gift_repo.get_by_id_with_relations(db, gift_id)
        if not gift:
            raise NotFoundException("Gift catalog item not found.")
        return gift

    async def get_gifts_filtered(
        self,
        db: AsyncSession,
        category_slug: Optional[str] = None,
        tag_slug: Optional[str] = None,
        search_query: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        is_handmade: Optional[bool] = None,
        gift_type: Optional[str] = None,
        sort_by: Optional[str] = "trending",
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[GiftItem], int]:
        return await self.gift_repo.get_filtered(
            db,
            category_slug=category_slug,
            tag_slug=tag_slug,
            search_query=search_query,
            min_price=min_price,
            max_price=max_price,
            is_handmade=is_handmade,
            gift_type=gift_type,
            sort_by=sort_by,
            skip=skip,
            limit=limit,
        )

    async def create_gift(self, db: AsyncSession, gift_in: GiftItemCreate) -> GiftItem:
        obj_data = gift_in.model_dump(exclude={"tag_ids"})
        gift = await self.gift_repo.create(db, obj_in=obj_data)
        return await self.get_gift_by_id(db, gift.id)

    async def update_gift(self, db: AsyncSession, gift_id: UUID, gift_in: GiftItemUpdate) -> GiftItem:
        gift = await self.get_gift_by_id(db, gift_id)
        update_data = gift_in.model_dump(exclude_unset=True)
        updated = await self.gift_repo.update(db, db_obj=gift, obj_in=update_data)
        return updated

    async def delete_gift(self, db: AsyncSession, gift_id: UUID) -> bool:
        gift = await self.get_gift_by_id(db, gift_id)
        await self.gift_repo.soft_delete(db, id=gift.id)
        return True

    async def get_categories(self, db: AsyncSession) -> List[GiftCategory]:
        return await self.category_repo.get_all_categories(db)

    async def get_tags(self, db: AsyncSession) -> List[GiftTag]:
        return await self.tag_repo.get_all_tags(db)

    async def get_trending_gifts(self, db: AsyncSession, limit: int = 10) -> List[GiftItem]:
        return await self.gift_repo.get_trending(db, limit=limit)

    async def get_featured_gifts(self, db: AsyncSession, limit: int = 10) -> List[GiftItem]:
        return await self.gift_repo.get_featured(db, limit=limit)

    async def get_recommendation_candidates(
        self, db: AsyncSession, survey_id: UUID, limit: int = 10
    ) -> List[Dict[str, Any]]:
        survey = await self.survey_repo.get_by_id(db, survey_id)
        if not survey:
            raise NotFoundException("Survey record not found.")

        min_b = float(survey.min_budget or 0)
        max_b = float(survey.max_budget or 5000)

        gifts, _ = await self.gift_repo.get_filtered(
            db, min_price=min_b * 0.7, max_price=max_b * 1.3, limit=50
        )

        candidates = []
        payload = survey.survey_payload or {}

        for gift in gifts:
            match_score, strategy_label, reasoning = calculate_gift_match_score(gift, payload)
            candidates.append({
                "gift": gift,
                "match_score": match_score,
                "strategy_label": strategy_label,
                "reasoning": reasoning,
            })

        # Sort by match score descending
        candidates.sort(key=lambda c: c["match_score"], reverse=True)
        return candidates[:limit]
