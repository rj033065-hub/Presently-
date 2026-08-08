from typing import List, Optional
from uuid import UUID
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.wishlist import Wishlist, WishlistItem
from app.models.gift import GiftItem


class WishlistRepository(BaseRepository[Wishlist]):
    def __init__(self):
        super().__init__(Wishlist)

    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[Wishlist]:
        result = await db.execute(
            select(Wishlist)
            .options(
                selectinload(Wishlist.items).joinedload(WishlistItem.gift_item)
            )
            .where(Wishlist.user_id == user_id)
            .order_by(Wishlist.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, db: AsyncSession, wishlist_id: UUID, user_id: UUID) -> Optional[Wishlist]:
        result = await db.execute(
            select(Wishlist)
            .options(
                selectinload(Wishlist.items).joinedload(WishlistItem.gift_item)
            )
            .where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id)
        )
        return result.scalars().first()

    async def get_by_share_token(self, db: AsyncSession, share_token: str) -> Optional[Wishlist]:
        result = await db.execute(
            select(Wishlist)
            .options(
                selectinload(Wishlist.items).joinedload(WishlistItem.gift_item)
            )
            .where(Wishlist.share_token == share_token, Wishlist.is_public == True)
        )
        return result.scalars().first()

    async def count_user_wishlists(self, db: AsyncSession, user_id: UUID) -> int:
        result = await db.execute(
            select(func.count(Wishlist.id)).where(Wishlist.user_id == user_id)
        )
        return result.scalar() or 0

    async def count_user_saved_gifts(self, db: AsyncSession, user_id: UUID) -> int:
        result = await db.execute(
            select(func.count(WishlistItem.id))
            .join(Wishlist, WishlistItem.wishlist_id == Wishlist.id)
            .where(Wishlist.user_id == user_id)
        )
        return result.scalar() or 0

    async def add_item(
        self,
        db: AsyncSession,
        wishlist_id: UUID,
        gift_item_id: UUID,
        notes: Optional[str] = None,
        priority: str = "medium",
        target_price: Optional[float] = None,
        status: str = "considering"
    ) -> WishlistItem:
        # Get max display order
        order_res = await db.execute(
            select(func.coalesce(func.max(WishlistItem.display_order), 0)).where(WishlistItem.wishlist_id == wishlist_id)
        )
        next_order = (order_res.scalar() or 0) + 1

        item = WishlistItem(
            wishlist_id=wishlist_id,
            gift_item_id=gift_item_id,
            notes=notes,
            priority=priority,
            target_price=target_price,
            status=status,
            display_order=next_order
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item

    async def get_item_by_id(self, db: AsyncSession, item_id: UUID) -> Optional[WishlistItem]:
        result = await db.execute(
            select(WishlistItem)
            .options(joinedload(WishlistItem.gift_item))
            .where(WishlistItem.id == item_id)
        )
        return result.scalars().first()

    async def delete_item(self, db: AsyncSession, item: WishlistItem) -> None:
        await db.delete(item)
        await db.commit()

    async def generate_share_token(self, db: AsyncSession, wishlist: Wishlist) -> str:
        if not wishlist.share_token:
            wishlist.share_token = secrets.token_urlsafe(16)
            await db.commit()
            await db.refresh(wishlist)
        return wishlist.share_token
