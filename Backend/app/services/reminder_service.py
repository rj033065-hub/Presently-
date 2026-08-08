import logging
import zoneinfo
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import uuid4

from app.db.session import AsyncSessionLocal
from app.models.planner import GiftPlan
from app.models.user import User, UserProfile
from app.models.system import Notification, NotificationPreference, ReminderExecution
from app.services.email_service import EmailService
from app.repositories.notification_repository import NotificationRepository

logger = logging.getLogger("presently.reminder_service")


class ReminderService:
    def __init__(self):
        self.email_service = EmailService()
        self.notification_repo = NotificationRepository()

    async def run_reminder_job(self, db_session: Optional[AsyncSession] = None) -> int:
        """
        Executes the reminder job. Evaluates all upcoming occasions, filters against user
        preferences and execution history, creates notifications and emails.
        """
        if db_session:
            return await self._execute_job(db_session)
        else:
            async with AsyncSessionLocal() as db:
                try:
                    count = await self._execute_job(db)
                    await db.commit()
                    return count
                except Exception as e:
                    await db.rollback()
                    logger.error(f"Error executing reminder background job: {str(e)}", exc_info=True)
                    return 0

    async def _execute_job(self, db: AsyncSession) -> int:
        # 1. Fetch all active gift plans (exclude completed/delivered, soft-deleted)
        # We eagerly load user profiles and settings to prevent N+1 queries.
        result = await db.execute(
            select(GiftPlan)
            .options(
                selectinload(GiftPlan.user).selectinload(User.profile),
            )
            .where(
                GiftPlan.deleted_at.is_(None),
                GiftPlan.status.notin_(["completed", "delivered"])
            )
        )
        gift_plans = result.scalars().all()
        logger.info(f"Scanning {len(gift_plans)} active gift plans for reminders...")

        executed_count = 0

        for plan in gift_plans:
            try:
                user = plan.user
                if not user or not user.is_active:
                    continue

                profile = user.profile
                # 2. Get User Timezone
                user_timezone_str = getattr(profile, "timezone", "UTC") or "UTC"
                if user_timezone_str.upper() in ["UTC", "GMT"]:
                    user_tz = timezone.utc
                else:
                    try:
                        user_tz = zoneinfo.ZoneInfo(user_timezone_str)
                    except Exception:
                        if user_timezone_str == "Asia/Kolkata":
                            from datetime import timedelta
                            user_tz = timezone(timedelta(hours=5, minutes=30))
                        else:
                            user_tz = timezone.utc

                # 3. Calculate current date in user's timezone
                current_local_time = datetime.now(user_tz)
                current_local_date = current_local_time.date()

                # Calculate days remaining
                days_remaining = (plan.event_date - current_local_date).days

                # Skip past events
                if days_remaining < 0:
                    continue

                # Default thresholds
                reminder_thresholds = [30, 14, 7, 3, 1, 0]
                if days_remaining not in reminder_thresholds:
                    continue

                # Reminder Type name
                reminder_type = "event_day" if days_remaining == 0 else f"{days_remaining}_days_before"

                # 4. Check if already executed to prevent duplicates
                existing_check = await db.execute(
                    select(ReminderExecution).where(
                        ReminderExecution.gift_plan_id == plan.id,
                        ReminderExecution.reminder_type == reminder_type
                    )
                )
                if existing_check.scalars().first():
                    continue

                # 5. Fetch or Lazy Create User Notification Preference
                pref_result = await db.execute(
                    select(NotificationPreference).where(NotificationPreference.user_id == user.id)
                )
                preference = pref_result.scalars().first()
                if not preference:
                    preference = NotificationPreference(
                        user_id=user.id,
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
                    db.add(preference)
                    await db.flush()

                # Skip if frequency is disabled
                if preference.frequency == "disabled":
                    continue

                # 6. Determine reminder details based on status & preferences
                should_send_in_app = preference.in_app_enabled
                should_send_email = preference.email_enabled

                # Check category preferences
                # If plan has a specific status and gift plan reminders are enabled, use status-based content
                is_status_reminder = False
                title = ""
                message = ""
                notification_type = ""

                # Select Currency Symbol & Budget formatting
                symbol = "₹" if plan.currency == "INR" else "$"
                budget_val = float(plan.planned_budget or 0)
                budget_str = f"{symbol}{budget_val:,.2f}"

                if preference.gift_plan_reminders and plan.status in ["planning", "gift_selected", "purchased"]:
                    is_status_reminder = True
                    notification_type = "gift_plan_reminder"
                    title = "Gift Plan Reminder"
                    if plan.status == "planning":
                        message = f"You still haven't selected a gift for {plan.recipient_name}'s {plan.occasion} ({days_remaining} days away). Planned budget: {budget_str}."
                    elif plan.status == "gift_selected":
                        message = f"Have you purchased {plan.recipient_name}'s gift for their {plan.occasion} yet? ({days_remaining} days remaining)."
                    elif plan.status == "purchased":
                        message = f"Remember to prepare and wrap {plan.recipient_name}'s gift for their {plan.occasion}."
                elif preference.occasion_reminders:
                    notification_type = "occasion_reminder"
                    title = "Occasion Reminder"
                    days_txt = "today" if days_remaining == 0 else f"in {days_remaining} days"
                    message = f"Your upcoming occasion '{plan.occasion}' for {plan.recipient_name} is {days_txt}. Planned budget: {budget_str}."
                else:
                    # Neither category enabled
                    continue

                # 7. Deliver Notifications & Emails
                channel_used = "none"
                if should_send_in_app:
                    notif = Notification(
                        user_id=user.id,
                        title=title,
                        message=message,
                        type=notification_type,
                        is_read=False,
                        related_entity_type="gift_plan",
                        related_entity_id=plan.id,
                        link_url="/dashboard/planner"
                    )
                    db.add(notif)
                    channel_used = "in_app"

                if should_send_email:
                    user_display = profile.full_name or user.username or "Gifter"
                    email_sent = False
                    if is_status_reminder:
                        email_sent = await self.email_service.send_gift_plan_reminder(
                            user_name=user_display,
                            recipient=plan.recipient_name,
                            occasion=plan.occasion,
                            event_date=plan.event_date.strftime("%B %d, %Y"),
                            days_remaining=days_remaining,
                            status=plan.status,
                            gift_idea=plan.gift_idea,
                            to_email=user.email
                        )
                    else:
                        email_sent = await self.email_service.send_occasion_reminder(
                            user_name=user_display,
                            recipient=plan.recipient_name,
                            occasion=plan.occasion,
                            event_date=plan.event_date.strftime("%B %d, %Y"),
                            days_remaining=days_remaining,
                            budget=budget_str,
                            to_email=user.email
                        )

                    if email_sent:
                        channel_used = "both" if should_send_in_app else "email"

                # 8. Record Execution
                execution = ReminderExecution(
                    user_id=user.id,
                    gift_plan_id=plan.id,
                    reminder_type=reminder_type,
                    scheduled_for=plan.event_date,
                    channel=channel_used
                )
                db.add(execution)
                executed_count += 1

            except Exception as plan_err:
                logger.error(f"Error processing plan {plan.id} for reminders: {str(plan_err)}")
                continue

        logger.info(f"Reminder background job finished. Executed {executed_count} reminders.")
        return executed_count
