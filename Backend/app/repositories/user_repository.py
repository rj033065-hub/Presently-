from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.user import User


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_clerk_id(self, db: AsyncSession, clerk_id: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.clerk_id == clerk_id, User.deleted_at.is_(None)))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        return result.scalars().first()
