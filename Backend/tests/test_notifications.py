import pytest
import pytest_asyncio
import jwt
from uuid import uuid4
from datetime import date, datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import AsyncSessionLocal
from app.models.user import User, UserProfile, RoleEnum
from app.models.planner import GiftPlan
from app.models.system import Notification, NotificationPreference, ReminderExecution
from app.services.reminder_service import ReminderService


def create_test_token(clerk_id: str, email: str) -> str:
    payload = {"sub": clerk_id, "email": email}
    return jwt.encode(payload, "test_secret", algorithm="HS256")
import sqlalchemy as sa


@pytest_asyncio.fixture(autouse=True)
async def clean_database():
    async with AsyncSessionLocal() as db:
        await db.execute(sa.text("DELETE FROM notifications"))
        await db.execute(sa.text("DELETE FROM reminder_executions"))
        await db.execute(sa.text("DELETE FROM notification_preferences"))
        await db.execute(sa.text("DELETE FROM gift_plans"))
        await db.execute(sa.text("DELETE FROM user_profiles"))
        await db.execute(sa.text("DELETE FROM users"))
        await db.commit()

@pytest_asyncio.fixture
async def setup_users_and_auth():
    async with AsyncSessionLocal() as db:
        # Create User A (registered user)
        clerk_a = f"clerk_a_{uuid4().hex[:8]}"
        user_a = User(
            clerk_id=clerk_a,
            email=f"{clerk_a}@example.com",
            username=f"user_a_{uuid4().hex[:6]}",
            role=RoleEnum.REGISTERED_USER.value,
        )
        db.add(user_a)
        await db.flush()

        profile_a = UserProfile(
            user_id=user_a.id,
            full_name="User A",
            timezone="Asia/Kolkata"  # IST +5:30
        )
        db.add(profile_a)

        # Create User B (another registered user for IDOR checks)
        clerk_b = f"clerk_b_{uuid4().hex[:8]}"
        user_b = User(
            clerk_id=clerk_b,
            email=f"{clerk_b}@example.com",
            username=f"user_b_{uuid4().hex[:6]}",
            role=RoleEnum.REGISTERED_USER.value,
        )
        db.add(user_b)
        await db.flush()

        profile_b = UserProfile(
            user_id=user_b.id,
            full_name="User B",
            timezone="UTC"
        )
        db.add(profile_b)

        # Create Admin User (to test reminders trigger auth)
        clerk_admin = f"clerk_admin_{uuid4().hex[:8]}"
        user_admin = User(
            clerk_id=clerk_admin,
            email=f"{clerk_admin}@example.com",
            username=f"admin_{uuid4().hex[:6]}",
            role=RoleEnum.ADMIN.value,
        )
        db.add(user_admin)
        await db.flush()

        profile_admin = UserProfile(user_id=user_admin.id, full_name="Admin User")
        db.add(profile_admin)

        await db.commit()
        await db.refresh(user_a)
        await db.refresh(user_b)
        await db.refresh(user_admin)

        token_a = create_test_token(user_a.clerk_id, user_a.email)
        token_b = create_test_token(user_b.clerk_id, user_b.email)
        token_admin = create_test_token(user_admin.clerk_id, user_admin.email)

        return {
            "user_a": user_a,
            "token_a": token_a,
            "user_b": user_b,
            "token_b": token_b,
            "admin": user_admin,
            "token_admin": token_admin
        }


@pytest.mark.asyncio
async def test_notification_crud(async_client: AsyncClient, setup_users_and_auth):
    users = setup_users_and_auth
    headers_a = {"Authorization": f"Bearer {users['token_a']}"}
    headers_b = {"Authorization": f"Bearer {users['token_b']}"}

    # Seed notification for user A
    async with AsyncSessionLocal() as db:
        notif = Notification(
            user_id=users["user_a"].id,
            title="Test Title",
            message="Test Message",
            type="system_notification",
            is_read=False
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        notif_id = notif.id

    # 1. Fetch Notification
    res = await async_client.get("/api/v1/notifications", headers=headers_a)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Test Title"

    # 2. Verify IDOR: User B cannot access User A's notifications
    res_b = await async_client.get("/api/v1/notifications", headers=headers_b)
    assert res_b.status_code == 200
    data_b = res_b.json()
    # User B should not see User A's notifications
    for item in data_b:
        assert item["id"] != str(notif_id)

    # 3. Mark Read
    res = await async_client.post(f"/api/v1/notifications/{notif_id}/read", headers=headers_a)
    assert res.status_code == 200
    assert res.json()["is_read"] is True
    assert res.json()["read_at"] is not None

    # Verify IDOR: User B cannot mark User A's notification as read
    res = await async_client.post(f"/api/v1/notifications/{notif_id}/read", headers=headers_b)
    assert res.status_code == 404

    # 4. Mark Unread
    res = await async_client.post(f"/api/v1/notifications/{notif_id}/unread", headers=headers_a)
    assert res.status_code == 200
    assert res.json()["is_read"] is False
    assert res.json()["read_at"] is None

    # 5. Delete Notification
    res = await async_client.delete(f"/api/v1/notifications/{notif_id}", headers=headers_a)
    assert res.status_code == 204

    # Verify IDOR: User B cannot delete User A's notification
    res = await async_client.delete(f"/api/v1/notifications/{notif_id}", headers=headers_b)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_unread_count_and_read_all(async_client: AsyncClient, setup_users_and_auth):
    users = setup_users_and_auth
    headers = {"Authorization": f"Bearer {users['token_a']}"}

    async with AsyncSessionLocal() as db:
        # Clear existing
        await db.execute(
            Notification.__table__.delete().where(Notification.user_id == users["user_a"].id)
        )
        notif1 = Notification(user_id=users["user_a"].id, title="N1", message="M1", type="system_notification")
        notif2 = Notification(user_id=users["user_a"].id, title="N2", message="M2", type="system_notification")
        db.add_all([notif1, notif2])
        await db.commit()

    # Get count
    res = await async_client.get("/api/v1/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 2

    # Read All
    res = await async_client.post("/api/v1/notifications/read-all", headers=headers)
    assert res.status_code == 200

    # Verify count is 0
    res = await async_client.get("/api/v1/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 0


@pytest.mark.asyncio
async def test_notification_preferences(async_client: AsyncClient, setup_users_and_auth):
    users = setup_users_and_auth
    headers = {"Authorization": f"Bearer {users['token_a']}"}

    # 1. Fetch Preferences (should trigger lazy initialization)
    res = await async_client.get("/api/v1/notifications/preferences", headers=headers)
    assert res.status_code == 200
    pref_data = res.json()
    assert pref_data["in_app_enabled"] is True
    assert pref_data["frequency"] == "immediate"

    # 2. Update Preferences
    payload = {
        "email_enabled": False,
        "frequency": "daily_digest",
        "marketing_notifications": True
    }
    res = await async_client.put("/api/v1/notifications/preferences", json=payload, headers=headers)
    assert res.status_code == 200
    updated_data = res.json()
    assert updated_data["email_enabled"] is False
    assert updated_data["frequency"] == "daily_digest"
    assert updated_data["marketing_notifications"] is True


@pytest.mark.asyncio
async def test_reminder_calculation_thresholds(setup_users_and_auth):
    users = setup_users_and_auth
    user_a = users["user_a"]

    # We test the reminder thresholds: 30, 14, 7, 3, 1, 0 days before
    thresholds = [30, 14, 7, 3, 1, 0]

    async with AsyncSessionLocal() as db:
        # Clean existing plans & reminder executions
        await db.execute(GiftPlan.__table__.delete().where(GiftPlan.user_id == user_a.id))
        await db.execute(ReminderExecution.__table__.delete().where(ReminderExecution.user_id == user_a.id))
        await db.execute(Notification.__table__.delete().where(Notification.user_id == user_a.id))
        await db.commit()

        # Generate plans matching each threshold
        today = date.today()
        plans = []
        for t in thresholds:
            plan = GiftPlan(
                user_id=user_a.id,
                recipient_name=f"Recipient {t}",
                occasion=f"Occasion {t}",
                event_date=today + timedelta(days=t),
                status="planning",
                planned_budget=100.0,
                currency="USD"
            )
            db.add(plan)
            plans.append(plan)

        await db.commit()

        # Run reminder engine
        reminder_service = ReminderService()
        count = await reminder_service.run_reminder_job(db)
        await db.commit()
        # 6 plans should trigger reminders since they match thresholds
        assert count == 6

        # Verify notifications were created
        res = await db.execute(select(Notification).where(Notification.user_id == user_a.id))
        notifications = res.scalars().all()
        assert len(notifications) == 6

        # Verify reminder executions exist (prevents duplicates)
        res_exec = await db.execute(select(ReminderExecution).where(ReminderExecution.user_id == user_a.id))
        executions = res_exec.scalars().all()
        assert len(executions) == 6


@pytest.mark.asyncio
async def test_reminder_status_copy(setup_users_and_auth):
    users = setup_users_and_auth
    user_a = users["user_a"]

    async with AsyncSessionLocal() as db:
        # Clear existing
        await db.execute(GiftPlan.__table__.delete().where(GiftPlan.user_id == user_a.id))
        await db.execute(ReminderExecution.__table__.delete().where(ReminderExecution.user_id == user_a.id))
        await db.execute(Notification.__table__.delete().where(Notification.user_id == user_a.id))

        # Create 3 gift plans, all 14 days away, with different statuses
        event_date = date.today() + timedelta(days=14)
        
        plan_planning = GiftPlan(
            user_id=user_a.id,
            recipient_name="Sarah",
            occasion="Birthday",
            event_date=event_date,
            status="planning",
            planned_budget=5000.0,
            currency="INR"
        )
        plan_selected = GiftPlan(
            user_id=user_a.id,
            recipient_name="Sarah",
            occasion="Birthday",
            event_date=event_date,
            status="gift_selected",
            gift_idea="Silver Necklace",
            planned_budget=5000.0,
            currency="INR"
        )
        plan_purchased = GiftPlan(
            user_id=user_a.id,
            recipient_name="Sarah",
            occasion="Birthday",
            event_date=event_date,
            status="purchased",
            planned_budget=5000.0,
            currency="INR"
        )

        db.add_all([plan_planning, plan_selected, plan_purchased])
        await db.commit()

        # Run reminder engine
        reminder_service = ReminderService()
        await reminder_service.run_reminder_job(db)
        await db.commit()

        # Check notification messages
        res = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_a.id)
            .order_by(Notification.created_at.asc())
        )
        notifications = res.scalars().all()
        assert len(notifications) == 3

        # Match text messages
        assert "haven't selected a gift" in notifications[0].message
        assert "purchased Sarah's gift" in notifications[1].message
        assert "prepare and wrap Sarah's gift" in notifications[2].message


@pytest.mark.asyncio
async def test_duplicate_prevention_and_ignored_statuses(setup_users_and_auth):
    users = setup_users_and_auth
    user_a = users["user_a"]

    async with AsyncSessionLocal() as db:
        await db.execute(GiftPlan.__table__.delete().where(GiftPlan.user_id == user_a.id))
        await db.execute(ReminderExecution.__table__.delete().where(ReminderExecution.user_id == user_a.id))
        await db.execute(Notification.__table__.delete().where(Notification.user_id == user_a.id))

        # Create one planning plan (7 days away) and one completed plan (7 days away)
        event_date = date.today() + timedelta(days=7)
        plan_active = GiftPlan(
            user_id=user_a.id,
            recipient_name="John",
            occasion="Anniversary",
            event_date=event_date,
            status="planning"
        )
        plan_completed = GiftPlan(
            user_id=user_a.id,
            recipient_name="David",
            occasion="Birthday",
            event_date=event_date,
            status="completed"
        )
        db.add_all([plan_active, plan_completed])
        await db.commit()

        reminder_service = ReminderService()
        
        # 1. Run first time
        count_first = await reminder_service.run_reminder_job(db)
        await db.commit()
        # Should execute exactly 1 (for active, ignore completed)
        assert count_first == 1

        # 2. Run second time immediately
        count_second = await reminder_service.run_reminder_job(db)
        await db.commit()
        # Should execute 0 (duplicate prevention in action)
        assert count_second == 0


@pytest.mark.asyncio
async def test_reminders_trigger_endpoint_auth(async_client: AsyncClient, setup_users_and_auth):
    users = setup_users_and_auth

    # 1. Test unauthenticated
    res = await async_client.post("/api/v1/reminders/run")
    assert res.status_code == 401

    # 2. Test registered user (not authorized)
    headers_a = {"Authorization": f"Bearer {users['token_a']}"}
    res = await async_client.post("/api/v1/reminders/run", headers=headers_a)
    assert res.status_code == 403

    # 3. Test admin user (authorized)
    headers_admin = {"Authorization": f"Bearer {users['token_admin']}"}
    res = await async_client.post("/api/v1/reminders/run", headers=headers_admin)
    assert res.status_code == 202
    assert res.json()["status"] == "success"
