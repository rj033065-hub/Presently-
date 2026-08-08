from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.wishlist_repository import WishlistRepository
from app.models.wishlist import Wishlist


class WishlistService:
    def __init__(self):
        self.wishlist_repo = WishlistRepository()

    async def get_user_wishlists(self, db: AsyncSession, user_id: UUID) -> List[Wishlist]:
        return await self.wishlist_repo.get_by_user(db, user_id)
