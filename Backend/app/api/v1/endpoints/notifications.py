from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.system import Notification, NotificationPreference
from app.schemas.notification import (
    NotificationResponse,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
)

router = APIRouter()


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List user notifications with optional unread filtering and category pagination.
    """
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
        
    if type:
        # Match type filter keywords to enum values
        if type == "occasions":
            query = query.where(Notification.type == "occasion_reminder")
        elif type == "gift_plans":
            query = query.where(Notification.type == "gift_plan_reminder")
        elif type == "community":
            query = query.where(Notification.type == "community_notification")
        elif type == "recommendations":
            query = query.where(Notification.type == "recommendation_notification")
        else:
            query = query.where(Notification.type == type)

    query = query.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve current unread notification count.
    """
    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    count = result.scalar() or 0
    return {"unread_count": count}


@router.post("/{id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a notification as read.
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(notification)
    return notification


@router.post("/{id}/unread", response_model=NotificationResponse)
async def mark_notification_unread(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a notification as unread.
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    notification.is_read = False
    notification.read_at = None
    await db.commit()
    await db.refresh(notification)
    return notification


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all user's notifications as read.
    """
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"status": "success", "message": "All notifications marked as read."}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a notification.
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    await db.delete(notification)
    await db.commit()


@router.get("/preferences", response_model=NotificationPreferenceResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve user preferences. Lazily initializes if none exists.
    """
    result = await db.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    pref = result.scalars().first()
    
    if not pref:
        pref = NotificationPreference(
            user_id=current_user.id,
            in_app_enabled=True,
            email_enabled=True,
            email_alerts=True,
            in_app_alerts=True,
            birthday_reminders=True,
            occasion_reminders=True,
            gift_plan_reminders=True,
            community_notifications=True,
            recommendation_notifications=True,
            marketing_notifications=False,
            frequency="immediate"
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)

    return pref


@router.put("/preferences", response_model=NotificationPreferenceResponse)
async def update_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user notification preferences.
    """
    result = await db.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    pref = result.scalars().first()
    
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    # Apply updates
    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(pref, key, value)
        
    pref.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(pref)
    return pref
