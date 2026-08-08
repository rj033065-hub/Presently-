import pytest
import pytest_asyncio
import jwt
import uuid
from httpx import AsyncClient
from sqlalchemy.future import select
import sqlalchemy as sa

from app.db.session import AsyncSessionLocal
from app.models.user import User, UserProfile, RoleEnum, AuditLog
from app.models.gift import GiftItem, GiftCategory, GiftTag
from app.models.community import CommunityPost, Comment, Report


def create_test_token(clerk_id: str, email: str) -> str:
    payload = {"sub": clerk_id, "email": email}
    return jwt.encode(payload, "test_secret", algorithm="HS256")


@pytest_asyncio.fixture(autouse=True)
async def clean_admin_database():
    """Ensure database starts fresh for admin tests."""
    async with AsyncSessionLocal() as db:
        await db.execute(sa.text("DELETE FROM audit_logs"))
        await db.execute(sa.text("DELETE FROM reports"))
        await db.execute(sa.text("DELETE FROM community_posts"))
        await db.execute(sa.text("DELETE FROM gift_items"))
        await db.execute(sa.text("DELETE FROM gift_categories"))
        await db.execute(sa.text("DELETE FROM gift_tags"))
        await db.execute(sa.text("DELETE FROM user_profiles"))
        await db.execute(sa.text("DELETE FROM users"))
        await db.commit()


@pytest_asyncio.fixture
async def setup_admin_users():
    async with AsyncSessionLocal() as db:
        # Standard user
        user_reg = User(
            clerk_id="clerk_reg_123",
            email="reg@example.com",
            username="registered_user",
            role=RoleEnum.REGISTERED_USER.value,
            is_active=True
        )
        # Admin user
        user_admin = User(
            clerk_id="clerk_admin_456",
            email="admin@example.com",
            username="admin_user",
            role=RoleEnum.ADMIN.value,
            is_active=True
        )
        # Super admin user
        user_super = User(
            clerk_id="clerk_super_789",
            email="super@example.com",
            username="super_admin",
            role=RoleEnum.SUPER_ADMIN.value,
            is_active=True
        )
        db.add_all([user_reg, user_admin, user_super])
        await db.commit()

        token_reg = create_test_token(user_reg.clerk_id, user_reg.email)
        token_admin = create_test_token(user_admin.clerk_id, user_admin.email)
        token_super = create_test_token(user_super.clerk_id, user_super.email)

        return {
            "reg": user_reg,
            "admin": user_admin,
            "super": user_super,
            "token_reg": token_reg,
            "token_admin": token_admin,
            "token_super": token_super,
        }


@pytest.mark.asyncio
async def test_admin_rbac_access_control(async_client: AsyncClient, setup_admin_users):
    users = setup_admin_users

    # 1. Unauthenticated request -> 401
    res = await async_client.get("/api/v1/admin/dashboard")
    assert res.status_code == 401

    # 2. Standard registered user -> 403 Forbidden
    headers_reg = {"Authorization": f"Bearer {users['token_reg']}"}
    res = await async_client.get("/api/v1/admin/dashboard", headers=headers_reg)
    assert res.status_code == 403

    # 3. Admin user -> 200 OK
    headers_admin = {"Authorization": f"Bearer {users['token_admin']}"}
    res = await async_client.get("/api/v1/admin/dashboard", headers=headers_admin)
    assert res.status_code == 200
    assert "total_users" in res.json()


@pytest.mark.asyncio
async def test_admin_user_management(async_client: AsyncClient, setup_admin_users):
    users = setup_admin_users
    headers_admin = {"Authorization": f"Bearer {users['token_admin']}"}
    headers_super = {"Authorization": f"Bearer {users['token_super']}"}

    # 1. List users
    res = await async_client.get("/api/v1/admin/users", headers=headers_admin)
    assert res.status_code == 200
    assert res.json()["total"] >= 3

    # 2. Suspend standard user
    reg_id = str(users["reg"].id)
    res = await async_client.post(f"/api/v1/admin/users/{reg_id}/suspend", json={"reason": "Terms violation"}, headers=headers_admin)
    assert res.status_code == 200

    # Verify suspended user receives 403 on standard endpoint
    headers_reg = {"Authorization": f"Bearer {users['token_reg']}"}
    res_sub = await async_client.get("/api/v1/users/me", headers=headers_reg)
    assert res_sub.status_code == 403

    # 3. Reactivate user
    res = await async_client.post(f"/api/v1/admin/users/{reg_id}/reactivate", headers=headers_admin)
    assert res.status_code == 200

    # 4. Role modification security
    # Admin tries to make regular user an ADMIN -> 403 (Requires SUPER_ADMIN)
    res = await async_client.put(f"/api/v1/admin/users/{reg_id}/role", json={"role": "admin"}, headers=headers_admin)
    assert res.status_code == 403

    # Super admin makes regular user a MODERATOR -> 200
    res = await async_client.put(f"/api/v1/admin/users/{reg_id}/role", json={"role": "moderator"}, headers=headers_super)
    assert res.status_code == 200

    # Super admin cannot modify their own permissions -> 400
    super_id = str(users["super"].id)
    res = await async_client.put(f"/api/v1/admin/users/{super_id}/role", json={"role": "registered_user"}, headers=headers_super)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_admin_gift_catalog_crud(async_client: AsyncClient, setup_admin_users):
    users = setup_admin_users
    headers_admin = {"Authorization": f"Bearer {users['token_admin']}"}

    async with AsyncSessionLocal() as db:
        cat = GiftCategory(name="Tech Gadgets", slug="tech-gadgets")
        db.add(cat)
        await db.commit()
        cat_id = str(cat.id)

    # 1. Create Gift
    payload = {
        "title": "Smart Noise Canceling Headphones",
        "category_id": cat_id,
        "estimated_price": 299.99,
        "brand": "AudioTech",
        "primary_image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "affiliate_url": "https://amazon.com/dp/sample",
    }
    res = await async_client.post("/api/v1/admin/gifts", json=payload, headers=headers_admin)
    assert res.status_code == 200
    gift_id = res.json()["gift_id"]

    # 2. List Gifts
    res = await async_client.get("/api/v1/admin/gifts", headers=headers_admin)
    assert res.status_code == 200
    assert res.json()["total"] == 1

    # 3. Edit Gift
    res = await async_client.put(f"/api/v1/admin/gifts/{gift_id}", json={"estimated_price": 249.99}, headers=headers_admin)
    assert res.status_code == 200

    # 4. Soft Delete Gift
    res = await async_client.delete(f"/api/v1/admin/gifts/{gift_id}", headers=headers_admin)
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_admin_community_moderation_and_reports(async_client: AsyncClient, setup_admin_users):
    users = setup_admin_users
    headers_admin = {"Authorization": f"Bearer {users['token_admin']}"}

    async with AsyncSessionLocal() as db:
        post = CommunityPost(
            author_id=users["reg"].id,
            title="Inappropriate Post",
            slug="inappropriate-post",
            content="Some bad content",
            status="Published",
            is_published=True,
        )
        db.add(post)
        await db.commit()

        report = Report(
            reporter_id=users["admin"].id,
            target_type="post",
            target_id=post.id,
            reason="Spam",
            details="Spam advertisement",
            status="pending",
        )
        db.add(report)
        await db.commit()
        post_id = str(post.id)
        report_id = str(report.id)

    # 1. Hide post
    res = await async_client.post(f"/api/v1/admin/community/posts/{post_id}/hide", headers=headers_admin)
    assert res.status_code == 200

    # 2. List & resolve reports
    res = await async_client.get("/api/v1/admin/reports", headers=headers_admin)
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = await async_client.post(f"/api/v1/admin/reports/{report_id}/resolve", json={"action": "actioned", "moderation_note": "Post hidden"}, headers=headers_admin)
    assert res.status_code == 200

    # 3. Check activity log created
    res = await async_client.get("/api/v1/admin/activity", headers=headers_admin)
    assert res.status_code == 200
    assert len(res.json()) >= 2
