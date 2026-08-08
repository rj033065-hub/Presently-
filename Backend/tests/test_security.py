import io
import jwt
import pytest
import pytest_asyncio
import sqlalchemy as sa
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.future import select

from app.main import app
from app.db.session import AsyncSessionLocal
from app.models.user import User, RoleEnum
from app.models.wishlist import Wishlist
from app.models.planner import GiftPlan
from app.models.system import Notification

client = TestClient(app)


def create_test_token(clerk_id: str, email: str) -> str:
    return jwt.encode(
        {"sub": clerk_id, "email": email, "exp": 9999999999},
        "test_secret",
        algorithm="HS256",
    )


@pytest_asyncio.fixture(autouse=True)
async def setup_security_database():
    async with AsyncSessionLocal() as db:
        # Ensure user A and user B exist
        res_a = await db.execute(select(User).where(User.clerk_id == "clerk_sec_user_a"))
        user_a = res_a.scalar_one_or_none()
        if not user_a:
            user_a = User(
                clerk_id="clerk_sec_user_a",
                email="user_a@example.com",
                username="user_a",
                role=RoleEnum.REGISTERED_USER,
                is_active=True,
            )
            db.add(user_a)

        res_b = await db.execute(select(User).where(User.clerk_id == "clerk_sec_user_b"))
        user_b = res_b.scalar_one_or_none()
        if not user_b:
            user_b = User(
                clerk_id="clerk_sec_user_b",
                email="user_b@example.com",
                username="user_b",
                role=RoleEnum.REGISTERED_USER,
                is_active=True,
            )
            db.add(user_b)

        await db.commit()


@pytest.mark.asyncio
async def test_unauthenticated_requests_rejected():
    res = client.get("/api/v1/users/me")
    assert res.status_code == 401

    res_wishlist = client.get("/api/v1/wishlists")
    assert res_wishlist.status_code == 401

    res_admin = client.get("/api/v1/admin/dashboard")
    assert res_admin.status_code == 401


@pytest.mark.asyncio
async def test_rbac_access_control():
    user_token = create_test_token("clerk_sec_user_a", "user_a@example.com")
    headers = {"Authorization": f"Bearer {user_token}"}

    # Regular user attempting admin dashboard access
    res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_idor_wishlist_isolation():
    token_a = create_test_token("clerk_sec_user_a", "user_a@example.com")
    token_b = create_test_token("clerk_sec_user_b", "user_b@example.com")

    # Create wishlist for User A
    async with AsyncSessionLocal() as db:
        res_a = await db.execute(select(User).where(User.clerk_id == "clerk_sec_user_a"))
        user_a = res_a.scalar_one()

        wishlist_a = Wishlist(
            user_id=user_a.id,
            name="User A Private Wishlist",
            is_public=False,
        )
        db.add(wishlist_a)
        await db.commit()
        await db.refresh(wishlist_a)
        wishlist_id = wishlist_a.id

    # User B tries to access User A's private wishlist by ID
    res_idor = client.get(
        f"/api/v1/wishlists/{wishlist_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res_idor.status_code == 404


@pytest.mark.asyncio
async def test_file_upload_security():
    token_a = create_test_token("clerk_sec_user_a", "user_a@example.com")
    headers = {"Authorization": f"Bearer {token_a}"}

    # Executable file rejection
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    res_exe = client.post(
        "/api/v1/uploads/image",
        files={"file": ("malicious.exe", fake_exe, "application/x-msdownload")},
        headers=headers,
    )
    assert res_exe.status_code == 400

    # Valid PNG upload
    fake_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")
    res_png = client.post(
        "/api/v1/uploads/image",
        files={"file": ("test.png", fake_png, "image/png")},
        headers=headers,
    )
    assert res_png.status_code == 200
    assert "url" in res_png.json()


@pytest.mark.asyncio
async def test_health_and_readiness_endpoints():
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"
