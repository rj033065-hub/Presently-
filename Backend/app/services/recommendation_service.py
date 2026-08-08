import secrets
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.survey_repository import SurveyRepository
from app.models.survey import AIRecommendation
from app.models.gift import GiftItem
from app.services.ai_generator import generate_ai_recommendation
from app.exceptions.custom_exceptions import NotFoundException, ForbiddenException


class RecommendationService:
    def __init__(self):
        self.recommendation_repo = RecommendationRepository()
        self.survey_repo = SurveyRepository()

    async def generate_recommendation(
        self,
        db: AsyncSession,
        survey_id: UUID,
        user_id: Optional[UUID] = None,
        force_regenerate: bool = False,
    ) -> AIRecommendation:
        # 1. Fetch survey
        survey = await self.survey_repo.get_by_id(db, survey_id)
        if not survey:
            raise NotFoundException("Survey record not found.")

        # Check existing recommendation unless force regenerate
        if not force_regenerate:
            existing = await self.recommendation_repo.get_by_survey_id(db, survey_id)
            if existing:
                return existing

        payload = survey.survey_payload or {}
        profile = payload.get("profile", {})
        recipient_name = profile.get("name") or "Recipient"
        occasion = payload.get("occasion", "Special Event")

        # 2. Query candidate gift items from database matching price range
        min_b = float(survey.min_budget or 0)
        max_b = float(survey.max_budget or 1000)

        query = (
            select(GiftItem)
            .where(
                GiftItem.deleted_at.is_(None),
                GiftItem.estimated_price >= min_b,
                GiftItem.estimated_price <= max_b,
            )
            .limit(10)
        )
        result = await db.execute(query)
        db_gifts = list(result.scalars().all())

        candidate_gifts = [
            {
                "id": str(g.id),
                "title": g.title,
                "category_id": str(g.category_id),
                "estimated_price": float(g.estimated_price),
                "affiliate_url": g.affiliate_url,
                "primary_image_url": g.primary_image_url,
                "merchant_name": g.merchant_name,
            }
            for g in db_gifts
        ]

        # 3. Call AI Generator (OpenAI GPT-4o with smart fallback)
        ai_data, model_used, prompt_tokens, completion_tokens, exec_time = (
            await generate_ai_recommendation(payload, candidate_gifts)
        )

        share_token = secrets.token_urlsafe(12)

        rec_data = {
            "survey_id": survey.id,
            "user_id": user_id or survey.user_id,
            "recipient_name": recipient_name,
            "occasion": occasion,
            "ai_model_used": model_used,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "execution_time_ms": exec_time,
            "is_favorite": False,
            "share_token": share_token,
            "summary": {
                "recipient_summary": ai_data.get("recipient_summary", {}),
                "suggested_follow_up_questions": ai_data.get("suggested_follow_up_questions", []),
            },
        }

        items_data = []
        raw_items = ai_data.get("recommendations", [])
        for item in raw_items:
            items_data.append({
                "title": item.get("title", "Gift Idea"),
                "category": item.get("category", "General"),
                "estimated_price": float(item.get("estimated_price", 50.0)),
                "currency": item.get("currency", "USD"),
                "match_score": int(item.get("match_score", 90)),
                "strategy_label": item.get("strategy_label", "Top Pick"),
                "ai_reasoning": item.get("ai_reasoning", "Matches recipient psychometrics."),
                "pros": item.get("pros", []),
                "cons": item.get("cons", []),
                "personalization_tips": item.get("personalization_tips", ""),
                "buy_url": item.get("buy_url", "https://presently.app"),
                "image_url": item.get("image_url", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"),
                "is_fallback": bool(item.get("is_fallback", False)),
            })

        # Update survey status to submitted
        await self.survey_repo.update(db, db_obj=survey, obj_in={"status": "submitted"})

        # Save recommendation record
        rec = await self.recommendation_repo.create_recommendation_with_items(
            db, rec_data=rec_data, items_data=items_data
        )
        return rec

    async def get_user_recommendations(
        self, db: AsyncSession, user_id: UUID, limit: int = 20, skip: int = 0
    ) -> List[AIRecommendation]:
        return await self.recommendation_repo.get_user_recommendations(
            db, user_id=user_id, limit=limit, skip=skip
        )

    async def get_recommendation_by_id(
        self, db: AsyncSession, rec_id: UUID, user_id: Optional[UUID] = None
    ) -> AIRecommendation:
        rec = await self.recommendation_repo.get_by_id_with_items(db, rec_id)
        if not rec:
            raise NotFoundException("Recommendation not found.")
        if rec.user_id and (not user_id or rec.user_id != user_id):
            raise ForbiddenException("Not authorized to access this recommendation.")
        return rec

    async def get_by_share_token(self, db: AsyncSession, share_token: str) -> AIRecommendation:
        rec = await self.recommendation_repo.get_by_share_token(db, share_token)
        if not rec:
            raise NotFoundException("Shared recommendation link not found or expired.")
        return rec

    async def toggle_favorite(
        self, db: AsyncSession, rec_id: UUID, user_id: Optional[UUID] = None
    ) -> AIRecommendation:
        return await self.recommendation_repo.toggle_favorite(db, rec_id, user_id)

    async def delete_recommendation(
        self, db: AsyncSession, rec_id: UUID, user_id: Optional[UUID] = None
    ) -> bool:
        rec = await self.get_recommendation_by_id(db, rec_id, user_id)
        await self.recommendation_repo.remove(db, id=rec.id)
        return True
