from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import selectinload
from app.repositories.base import BaseRepository
from app.models.gift import GiftItem, GiftCategory, GiftTag, gift_item_tags


class GiftRepository(BaseRepository[GiftItem]):
    def __init__(self):
        super().__init__(GiftItem)

    async def get_by_id_with_relations(self, db: AsyncSession, id: UUID) -> Optional[GiftItem]:
        result = await db.execute(
            select(GiftItem)
            .options(
                selectinload(GiftItem.category),
                selectinload(GiftItem.tags),
                selectinload(GiftItem.images),
            )
            .where(GiftItem.id == id, GiftItem.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[GiftItem]:
        result = await db.execute(
            select(GiftItem)
            .options(
                selectinload(GiftItem.category),
                selectinload(GiftItem.tags),
                selectinload(GiftItem.images),
            )
            .where(GiftItem.slug == slug, GiftItem.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_filtered(
        self,
        db: AsyncSession,
        *,
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
        query = (
            select(GiftItem)
            .options(selectinload(GiftItem.category), selectinload(GiftItem.tags))
            .where(GiftItem.deleted_at.is_(None))
        )

        if category_slug:
            query = query.join(GiftCategory).where(GiftCategory.slug == category_slug)

        if tag_slug:
            query = query.join(gift_item_tags).join(GiftTag).where(GiftTag.slug == tag_slug)

        if min_price is not None:
            query = query.where(GiftItem.estimated_price >= min_price)

        if max_price is not None:
            query = query.where(GiftItem.estimated_price <= max_price)

        if is_handmade is not None:
            query = query.where(GiftItem.is_handmade == is_handmade)

        if gift_type:
            query = query.where(GiftItem.gift_type == gift_type)

        if search_query:
            term = f"%{search_query}%"
            query = query.where(
                or_(
                    GiftItem.title.ilike(term),
                    GiftItem.description.ilike(term),
                    GiftItem.brand.ilike(term),
                    GiftItem.merchant_name.ilike(term),
                )
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(GiftItem.estimated_price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(GiftItem.estimated_price))
        elif sort_by == "rating":
            query = query.order_by(desc(GiftItem.rating_avg))
        elif sort_by == "newest":
            query = query.order_by(desc(GiftItem.created_at))
        else:
            query = query.order_by(desc(GiftItem.popularity_score))

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_trending(self, db: AsyncSession, limit: int = 10) -> List[GiftItem]:
        result = await db.execute(
            select(GiftItem)
            .options(selectinload(GiftItem.category), selectinload(GiftItem.tags))
            .where(GiftItem.deleted_at.is_(None))
            .order_by(desc(GiftItem.popularity_score), desc(GiftItem.rating_avg))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_featured(self, db: AsyncSession, limit: int = 10) -> List[GiftItem]:
        result = await db.execute(
            select(GiftItem)
            .options(selectinload(GiftItem.category), selectinload(GiftItem.tags))
            .where(GiftItem.deleted_at.is_(None), GiftItem.is_verified.is_(True))
            .order_by(desc(GiftItem.rating_avg))
            .limit(limit)
        )
        return list(result.scalars().all())


class GiftCategoryRepository(BaseRepository[GiftCategory]):
    def __init__(self):
        super().__init__(GiftCategory)

    async def get_all_categories(self, db: AsyncSession) -> List[GiftCategory]:
        result = await db.execute(select(GiftCategory).order_by(asc(GiftCategory.name)))
        return list(result.scalars().all())


class GiftTagRepository(BaseRepository[GiftTag]):
    def __init__(self):
        super().__init__(GiftTag)

    async def get_all_tags(self, db: AsyncSession) -> List[GiftTag]:
        result = await db.execute(select(GiftTag).order_by(asc(GiftTag.name)))
        return list(result.scalars().all())
