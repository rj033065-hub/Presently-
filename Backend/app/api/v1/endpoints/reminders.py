from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import require_role
from app.models.user import RoleEnum
from app.services.reminder_service import ReminderService

router = APIRouter()
reminder_service = ReminderService()


@router.post(
    "/run",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))]
)
async def run_reminders(
    background_tasks: BackgroundTasks
):
    """
    Manually triggers the occasion and gift plan reminder scheduler engine.
    Restricted to admin accounts. Executes asynchronously in a background task.
    """
    background_tasks.add_task(reminder_service.run_reminder_job)
    return {
        "status": "success",
        "message": "Reminder execution job queued successfully in the background."
    }
