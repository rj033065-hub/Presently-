from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.survey_repository import RecipientRepository, SurveyRepository
from app.models.survey import Recipient, Survey
from app.schemas.survey import SurveyCreate, SurveyUpdate
from app.exceptions.custom_exceptions import NotFoundException, ForbiddenException, BadRequestException


class SurveyService:
    def __init__(self):
        self.recipient_repo = RecipientRepository()
        self.survey_repo = SurveyRepository()

    async def create_survey(
        self, db: AsyncSession, user_id: Optional[UUID], survey_in: SurveyCreate
    ) -> Survey:
        obj_dict = survey_in.model_dump()
        obj_dict["user_id"] = user_id
        if "status" not in obj_dict or not obj_dict["status"]:
            obj_dict["status"] = "draft"
        return await self.survey_repo.create(db, obj_in=obj_dict)

    async def update_survey(
        self, db: AsyncSession, survey_id: UUID, user_id: Optional[UUID], update_in: SurveyUpdate
    ) -> Survey:
        survey = await self.survey_repo.get_by_id(db, survey_id)
        if not survey:
            raise NotFoundException("Survey not found")
        if survey.user_id and (not user_id or survey.user_id != user_id):
            raise ForbiddenException("Not authorized to modify this survey")

        update_data = update_in.model_dump(exclude_unset=True)
        return await self.survey_repo.update(db, db_obj=survey, obj_in=update_data)

    async def get_survey(
        self, db: AsyncSession, survey_id: UUID, user_id: Optional[UUID] = None
    ) -> Survey:
        survey = await self.survey_repo.get_by_id(db, survey_id)
        if not survey:
            raise NotFoundException("Survey not found")
        if survey.user_id and (not user_id or survey.user_id != user_id):
            raise ForbiddenException("Not authorized to access this survey")
        return survey

    async def get_surveys_by_user(
        self, db: AsyncSession, user_id: UUID, status: Optional[str] = None
    ) -> List[Survey]:
        return await self.survey_repo.get_by_user(db, user_id, status=status)

    async def get_user_history(self, db: AsyncSession, user_id: UUID) -> List[Survey]:
        return await self.survey_repo.get_history(db, user_id)

    async def get_active_draft(self, db: AsyncSession, user_id: UUID) -> Optional[Survey]:
        return await self.survey_repo.get_active_draft(db, user_id)

    async def submit_survey(self, db: AsyncSession, survey_id: UUID, user_id: Optional[UUID]) -> Survey:
        survey = await self.get_survey(db, survey_id, user_id)
        if survey.status == "submitted":
            raise BadRequestException("Survey has already been submitted")
        
        return await self.survey_repo.update(
            db, db_obj=survey, obj_in={"status": "submitted", "current_step": 12}
        )

    async def delete_survey(self, db: AsyncSession, survey_id: UUID, user_id: Optional[UUID]) -> bool:
        survey = await self.get_survey(db, survey_id, user_id)
        await self.survey_repo.remove(db, id=survey_id)
        return True
