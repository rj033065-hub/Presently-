from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.notification_repository import NotificationRepository
from app.models.system import Notification


class NotificationService:
    def __init__(self):
        self.notification_repo = NotificationRepository()

    async def get_user_notifications(self, db: AsyncSession, user_id: UUID) -> List[Notification]:
        return await self.notification_repo.get_by_user(db, user_id)
