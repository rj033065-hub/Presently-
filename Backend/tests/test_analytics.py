import pytest
import pytest_asyncio
import jwt
import sqlalchemy as sa
from fastapi.testclient import TestClient
from sqlalchemy.future import select

from app.main import app
from app.db.session import AsyncSessionLocal
from app.models.user import User, RoleEnum
from app.models.activity import AnalyticsEvent
from app.services.analytics_service import AnalyticsService

client = TestClient(app)


def create_test_token(clerk_id: str, email: str) -> str:
    return jwt.encode(
        {"sub": clerk_id, "email": email, "exp": 9999999999},
        "test_secret",
        algorithm="HS256",
    )


@pytest_asyncio.fixture(autouse=True)
async def clean_analytics_database():
    async with AsyncSessionLocal() as db:
        await db.execute(sa.text("DELETE FROM analytics_events"))
        await db.commit()


@pytest.mark.asyncio
async def test_record_analytics_event():
    async with AsyncSessionLocal() as db:
        event = await AnalyticsService.record_event(
            db=db,
            event_type="SURVEY_COMPLETED",
            metadata_json={"occasion": "Birthday", "budget": 100},
        )
        assert event.id is not None
        assert event.event_type == "SURVEY_COMPLETED"
        assert event.metadata_json["occasion"] == "Birthday"

        result = await db.execute(select(AnalyticsEvent).where(AnalyticsEvent.id == event.id))
        fetched = result.scalar_one_or_none()
        assert fetched is not None


@pytest.mark.asyncio
async def test_admin_analytics_rbac_protection():
    token = create_test_token("clerk_normal_user", "normal@example.com")
    response = client.get(
        "/api/v1/admin/analytics/overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_analytics_overview_and_export():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.clerk_id == "clerk_admin_analytics"))
        admin_user = res.scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                clerk_id="clerk_admin_analytics",
                email="admin_analytics@example.com",
                username="admin_analytics",
                role=RoleEnum.ADMIN,
                is_active=True,
            )
            db.add(admin_user)
            await db.commit()

    token = create_test_token("clerk_admin_analytics", "admin_analytics@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/admin/analytics/overview?range_key=30d", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "estimated_ai_cost_usd" in data

    res_users = client.get("/api/v1/admin/analytics/users", headers=headers)
    assert res_users.status_code == 200
    assert "dau" in res_users.json()

    res_ai = client.get("/api/v1/admin/analytics/ai", headers=headers)
    assert res_ai.status_code == 200
    assert "total_tokens" in res_ai.json()

    res_export = client.get("/api/v1/admin/analytics/export?category_type=overview&format_type=csv", headers=headers)
    assert res_export.status_code == 200
    assert "text/csv" in res_export.headers["content-type"]
    assert "Metric,Value" in res_export.text


@pytest.mark.asyncio
async def test_personal_user_insights():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.clerk_id == "clerk_insights_user"))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                clerk_id="clerk_insights_user",
                email="insights@example.com",
                username="insights_user",
                role=RoleEnum.REGISTERED_USER,
                is_active=True,
            )
            db.add(user)
            await db.commit()

    token = create_test_token("clerk_insights_user", "insights@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/dashboard/insights", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "surveys_completed" in data
    assert "saved_gifts" in data
