from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date, datetime, timezone

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.planner import GiftPlan
from app.repositories.planner_repository import PlannerRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.planner import (
    GiftPlanCreate,
    GiftPlanUpdate,
    GiftPlanResponse
)

router = APIRouter()
planner_repo = PlannerRepository()
activity_repo = ActivityRepository()


def format_gift_plan_response(p: GiftPlan) -> GiftPlanResponse:
    today = date.today()
    days_rem = (p.event_date - today).days
    planned = float(p.planned_budget or 0)
    actual = float(p.actual_spending or 0)
    rem_budget = max(0.0, planned - actual)

    return GiftPlanResponse(
        id=p.id,
        user_id=p.user_id,
        recipient_name=p.recipient_name,
        recipient_relationship=p.recipient_relationship,
        occasion=p.occasion,
        event_date=p.event_date,
        days_remaining=max(0, days_rem),
        planned_budget=p.planned_budget,
        actual_spending=p.actual_spending,
        remaining_budget=rem_budget,
        currency=p.currency or "USD",
        status=p.status or "planning",
        gift_idea=p.gift_idea,
        notes=p.notes,
        created_at=p.created_at,
        updated_at=p.updated_at or p.created_at
    )


@router.get("", response_model=List[GiftPlanResponse])
async def list_user_gift_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = await planner_repo.get_by_user(db, current_user.id)
    return [format_gift_plan_response(p) for p in plans]


@router.post("", response_model=GiftPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_gift_plan(
    payload: GiftPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = GiftPlan(
        user_id=current_user.id,
        recipient_name=payload.recipient_name,
        recipient_relationship=payload.recipient_relationship,
        occasion=payload.occasion,
        event_date=payload.event_date,
        planned_budget=payload.planned_budget,
        actual_spending=payload.actual_spending,
        currency=payload.currency,
        status=payload.status,
        gift_idea=payload.gift_idea,
        notes=payload.notes
    )
    plan = await planner_repo.create(db, plan)

    # Log user activity
    await activity_repo.log_activity(
        db,
        user_id=current_user.id,
        activity_type="gift_plan_created",
        title=f"Created gift plan for {payload.recipient_name} ({payload.occasion})",
        target_url="/dashboard/planner"
    )

    return format_gift_plan_response(plan)


@router.get("/{id}", response_model=GiftPlanResponse)
async def get_gift_plan(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = await planner_repo.get_by_id_and_user(db, id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Gift plan not found.")
    return format_gift_plan_response(plan)


@router.put("/{id}", response_model=GiftPlanResponse)
async def update_gift_plan(
    id: UUID,
    payload: GiftPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = await planner_repo.get_by_id_and_user(db, id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Gift plan not found.")

    if payload.recipient_name is not None:
        plan.recipient_name = payload.recipient_name
    if payload.recipient_relationship is not None:
        plan.recipient_relationship = payload.recipient_relationship
    if payload.occasion is not None:
        plan.occasion = payload.occasion
    if payload.event_date is not None:
        plan.event_date = payload.event_date
    if payload.planned_budget is not None:
        plan.planned_budget = payload.planned_budget
    if payload.actual_spending is not None:
        plan.actual_spending = payload.actual_spending
    if payload.currency is not None:
        plan.currency = payload.currency
    if payload.status is not None:
        plan.status = payload.status
    if payload.gift_idea is not None:
        plan.gift_idea = payload.gift_idea
    if payload.notes is not None:
        plan.notes = payload.notes

    plan.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(plan)

    return format_gift_plan_response(plan)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_plan(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = await planner_repo.get_by_id_and_user(db, id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Gift plan not found.")

    plan.deleted_at = datetime.now(timezone.utc)
    await db.commit()
