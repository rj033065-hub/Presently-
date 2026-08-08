import pytest
import pytest_asyncio
import jwt
from uuid import uuid4
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import AsyncSessionLocal
from app.models.user import User, RoleEnum
from app.models.community import CommunityCategory, CommunityTag, CommunityPost
from app.services.community_service import generate_slug


def create_test_token(clerk_id: str, email: str) -> str:
    payload = {"sub": clerk_id, "email": email}
    return jwt.encode(payload, "test_secret", algorithm="HS256")


@pytest_asyncio.fixture
async def setup_test_users():
    async with AsyncSessionLocal() as db:
        # Create User 1 (Author)
        clerk_id_1 = f"clerk_user_{uuid4().hex[:8]}"
        user1 = User(
            clerk_id=clerk_id_1,
            email=f"{clerk_id_1}@example.com",
            username=f"user_{uuid4().hex[:6]}",
            role=RoleEnum.REGISTERED_USER.value,
        )
        # Create User 2 (Other User)
        clerk_id_2 = f"clerk_user_{uuid4().hex[:8]}"
        user2 = User(
            clerk_id=clerk_id_2,
            email=f"{clerk_id_2}@example.com",
            username=f"user_{uuid4().hex[:6]}",
            role=RoleEnum.REGISTERED_USER.value,
        )
        db.add_all([user1, user2])
        await db.commit()
        await db.refresh(user1)
        await db.refresh(user2)

        token1 = create_test_token(user1.clerk_id, user1.email)
        token2 = create_test_token(user2.clerk_id, user2.email)

        return {
            "user1": user1,
            "token1": token1,
            "user2": user2,
            "token2": token2,
        }


@pytest_asyncio.fixture
async def setup_category_and_tag():
    async with AsyncSessionLocal() as db:
        cat_slug = f"tech-{uuid4().hex[:6]}"
        cat = CommunityCategory(name=f"Tech {uuid4().hex[:4]}", slug=cat_slug, description="Tech gadgets")
        tag_slug = f"unboxing-{uuid4().hex[:6]}"
        tag = CommunityTag(name=f"Unboxing {uuid4().hex[:4]}", slug=tag_slug)
        db.add_all([cat, tag])
        await db.commit()
        await db.refresh(cat)
        await db.refresh(tag)
        return {"category": cat, "tag": tag}


@pytest.mark.asyncio
async def test_get_categories_and_tags(async_client: AsyncClient, setup_category_and_tag):
    response = await async_client.get("/api/v1/community/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)

    response_tags = await async_client.get("/api/v1/community/tags")
    assert response_tags.status_code == 200
    tags = response_tags.json()
    assert isinstance(tags, list)


@pytest.mark.asyncio
async def test_create_post_unauthenticated(async_client: AsyncClient):
    payload = {
        "title": "Unauthenticated Post Attempt",
        "content": "This is test content for an unauthenticated post request.",
    }
    response = await async_client.post("/api/v1/community/posts", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_post_authenticated(
    async_client: AsyncClient, setup_test_users, setup_category_and_tag
):
    users = setup_test_users
    cat_tag = setup_category_and_tag

    headers = {"Authorization": f"Bearer {users['token1']}"}
    title = f"My Gift Story {uuid4().hex[:6]}"
    expected_slug = generate_slug(title)

    payload = {
        "title": title,
        "content": "This is a detailed narrative about unwrapping a fantastic AI-recommended smartwatch. " * 5,
        "excerpt": "A story about a great gift smartwatch.",
        "cover_image_url": "https://images.cloudinary.com/demo/image/upload/v123/smartwatch.jpg",
        "status": "Published",
        "visibility": "Public",
        "category_ids": [str(cat_tag["category"].id)],
        "tag_ids": [str(cat_tag["tag"].id)],
        "images": [
            {
                "image_url": "https://images.cloudinary.com/demo/image/upload/v123/unboxing.jpg",
                "alt_text": "Unboxing box photo",
                "display_order": 0,
            }
        ],
    }

    response = await async_client.post("/api/v1/community/posts", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["slug"] == expected_slug
    assert data["status"] == "Published"
    assert data["visibility"] == "Public"
    assert data["reading_time"] >= 1
    assert data["view_count"] == 0
    assert len(data["categories"]) == 1
    assert len(data["tags"]) == 1
    assert len(data["images"]) == 1


@pytest.mark.asyncio
async def test_get_post_by_id_and_slug_increments_views(
    async_client: AsyncClient, setup_test_users
):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    create_payload = {
        "title": f"Unique View Increment Post {uuid4().hex[:6]}",
        "content": "Testing view count increment logic when fetching by ID or slug.",
        "status": "Published",
        "visibility": "Public",
    }
    create_res = await async_client.post("/api/v1/community/posts", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    post_data = create_res.json()
    post_id = post_data["id"]
    slug = post_data["slug"]

    # Fetch by ID -> view_count should be 1
    get_res1 = await async_client.get(f"/api/v1/community/posts/{post_id}")
    assert get_res1.status_code == 200
    assert get_res1.json()["view_count"] == 1

    # Fetch by Slug -> view_count should be 2
    get_res2 = await async_client.get(f"/api/v1/community/posts/{slug}")
    assert get_res2.status_code == 200
    assert get_res2.json()["view_count"] == 2


@pytest.mark.asyncio
async def test_update_and_publish_archive_authorization(
    async_client: AsyncClient, setup_test_users
):
    users = setup_test_users
    headers_owner = {"Authorization": f"Bearer {users['token1']}"}
    headers_other = {"Authorization": f"Bearer {users['token2']}"}

    # Owner creates draft post
    create_res = await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Draft Post {uuid4().hex[:6]}", "content": "Initial draft content for testing.", "status": "Draft"},
        headers=headers_owner,
    )
    assert create_res.status_code == 201
    post_id = create_res.json()["id"]

    # Non-owner attempts update -> 403
    update_res_other = await async_client.put(
        f"/api/v1/community/posts/{post_id}",
        json={"title": "Hacked Title"},
        headers=headers_other,
    )
    assert update_res_other.status_code == 403

    # Owner updates post -> 200
    updated_title = f"Updated Draft Title {uuid4().hex[:6]}"
    update_res_owner = await async_client.put(
        f"/api/v1/community/posts/{post_id}",
        json={"title": updated_title},
        headers=headers_owner,
    )
    assert update_res_owner.status_code == 200
    assert update_res_owner.json()["title"] == updated_title

    # Non-owner attempts publish -> 403
    pub_res_other = await async_client.post(f"/api/v1/community/posts/{post_id}/publish", headers=headers_other)
    assert pub_res_other.status_code == 403

    # Owner publishes post -> 200
    pub_res_owner = await async_client.post(f"/api/v1/community/posts/{post_id}/publish", headers=headers_owner)
    assert pub_res_owner.status_code == 200
    assert pub_res_owner.json()["status"] == "Published"

    # Owner archives post -> 200
    arch_res_owner = await async_client.post(f"/api/v1/community/posts/{post_id}/archive", headers=headers_owner)
    assert arch_res_owner.status_code == 200
    assert arch_res_owner.json()["status"] == "Archived"


@pytest.mark.asyncio
async def test_duplicate_title_auto_slug(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    title = f"Duplicate Title {uuid4().hex[:6]}"
    expected_slug_1 = generate_slug(title)
    expected_slug_2 = f"{expected_slug_1}-1"

    payload = {"title": title, "content": "Content for auto slug generation test."}

    res1 = await async_client.post("/api/v1/community/posts", json=payload, headers=headers)
    assert res1.status_code == 201
    assert res1.json()["slug"] == expected_slug_1

    res2 = await async_client.post("/api/v1/community/posts", json=payload, headers=headers)
    assert res2.status_code == 201
    assert res2.json()["slug"] == expected_slug_2


@pytest.mark.asyncio
async def test_soft_delete_post(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers_owner = {"Authorization": f"Bearer {users['token1']}"}
    headers_other = {"Authorization": f"Bearer {users['token2']}"}

    create_res = await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Post To Delete {uuid4().hex[:6]}", "content": "Content for soft delete verification.", "status": "Published"},
        headers=headers_owner,
    )
    assert create_res.status_code == 201
    post_id = create_res.json()["id"]

    # Other user attempts delete -> 403
    del_res_other = await async_client.delete(f"/api/v1/community/posts/{post_id}", headers=headers_other)
    assert del_res_other.status_code == 403

    # Owner deletes post -> 204
    del_res_owner = await async_client.delete(f"/api/v1/community/posts/{post_id}", headers=headers_owner)
    assert del_res_owner.status_code == 204

    # GET deleted post -> 404
    get_res = await async_client.get(f"/api/v1/community/posts/{post_id}")
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_list_posts_pagination_and_filtering(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    # Create published public post
    await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Listed Post {uuid4().hex[:6]}", "content": "Content 1 for listing test.", "status": "Published", "visibility": "Public"},
        headers=headers,
    )

    list_res = await async_client.get("/api/v1/community/posts?page=1&limit=10&status=Published&sort_by=created_at&sort_order=desc")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert "items" in list_data
    assert "total" in list_data
    assert list_data["page"] == 1
    assert list_data["limit"] == 10


@pytest.mark.asyncio
async def test_upload_image_validation_and_success(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    # Invalid MIME type test
    files = {"file": ("test.txt", b"plain text content", "text/plain")}
    res_invalid = await async_client.post("/api/v1/uploads/image", files=files, headers=headers)
    assert res_invalid.status_code == 400

    # Valid PNG image upload test
    dummy_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    files_valid = {"file": ("test.png", dummy_png, "image/png")}
    res_valid = await async_client.post("/api/v1/uploads/image", files=files_valid, headers=headers)
    assert res_valid.status_code == 200
    assert "url" in res_valid.json()


@pytest.mark.asyncio
async def test_engagement_like_save_comments_workflow(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    # 1. Create a published post
    create_res = await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Engagement Story {uuid4().hex[:6]}", "content": "Content for engagement testing.", "status": "Published"},
        headers=headers,
    )
    assert create_res.status_code == 201
    post_id = create_res.json()["id"]

    # 2. Like and Unlike Post
    like_res = await async_client.post(f"/api/v1/community/posts/{post_id}/like", headers=headers)
    assert like_res.status_code == 200
    assert like_res.json()["liked"] is True
    assert like_res.json()["likes_count"] == 1

    unlike_res = await async_client.delete(f"/api/v1/community/posts/{post_id}/like", headers=headers)
    assert unlike_res.status_code == 200
    assert unlike_res.json()["liked"] is False
    assert unlike_res.json()["likes_count"] == 0

    # 3. Save and Unsave Post
    save_res = await async_client.post(f"/api/v1/community/posts/{post_id}/save", headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["saved"] is True

    saved_list = await async_client.get("/api/v1/community/saved", headers=headers)
    assert saved_list.status_code == 200
    assert saved_list.json()["total"] >= 1

    unsave_res = await async_client.delete(f"/api/v1/community/posts/{post_id}/save", headers=headers)
    assert unsave_res.status_code == 200
    assert unsave_res.json()["saved"] is False

    # 4. Share analytics
    share_res = await async_client.post(f"/api/v1/community/posts/{post_id}/share", headers=headers)
    assert share_res.status_code == 200

    # 5. Comment & Reply CRUD
    comment_res = await async_client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        json={"content": "First unboxing comment!"},
        headers=headers,
    )
    assert comment_res.status_code == 201
    comment_id = comment_res.json()["id"]

    reply_res = await async_client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        json={"content": "Reply to first comment!", "parent_id": comment_id},
        headers=headers,
    )
    assert reply_res.status_code == 201

    comments_list = await async_client.get(f"/api/v1/community/posts/{post_id}/comments")
    assert comments_list.status_code == 200
    assert comments_list.json()["total"] == 1
    assert len(comments_list.json()["items"][0]["replies"]) == 1

    edit_comment_res = await async_client.put(
        f"/api/v1/community/comments/{comment_id}",
        json={"content": "Updated first unboxing comment!"},
        headers=headers,
    )
    assert edit_comment_res.status_code == 200
    assert edit_comment_res.json()["content"] == "Updated first unboxing comment!"

    del_comment_res = await async_client.delete(
        f"/api/v1/community/comments/{comment_id}",
        headers=headers,
    )
    assert del_comment_res.status_code == 204


@pytest.mark.asyncio
async def test_collections_and_autocomplete_workflow(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers = {"Authorization": f"Bearer {users['token1']}"}

    # 1. Create a published post
    post_res = await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Collection Story {uuid4().hex[:6]}", "content": "Story content for collections test.", "status": "Published"},
        headers=headers,
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["id"]

    # 2. Create Collection
    col_res = await async_client.post(
        "/api/v1/community/collections",
        json={"title": f"My Test Collection {uuid4().hex[:6]}", "description": "Gift ideas collection test.", "is_public": True},
        headers=headers,
    )
    assert col_res.status_code == 201
    col_data = col_res.json()
    col_id = col_data["id"]

    # 3. Add post to collection
    add_res = await async_client.post(f"/api/v1/community/collections/{col_id}/posts/{post_id}", headers=headers)
    assert add_res.status_code == 200

    # 4. Get collection detail
    get_col_res = await async_client.get(f"/api/v1/community/collections/{col_id}")
    assert get_col_res.status_code == 200
    assert get_col_res.json()["posts_count"] == 1

    # 5. Remove post from collection
    rem_res = await async_client.delete(f"/api/v1/community/collections/{col_id}/posts/{post_id}", headers=headers)
    assert rem_res.status_code == 200

    # 6. Autocomplete search query
    auto_res = await async_client.get("/api/v1/community/search/autocomplete?q=Collection")
    assert auto_res.status_code == 200
    assert "suggestions" in auto_res.json()


@pytest.mark.asyncio
async def test_reporting_and_moderation_workflow(async_client: AsyncClient, setup_test_users):
    users = setup_test_users
    headers_user = {"Authorization": f"Bearer {users['token1']}"}

    # 1. Create a published post
    post_res = await async_client.post(
        "/api/v1/community/posts",
        json={"title": f"Reportable Story {uuid4().hex[:6]}", "content": "Story content to report.", "status": "Published"},
        headers=headers_user,
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["id"]

    # 2. Submit report for post
    report_res = await async_client.post(
        "/api/v1/community/reports",
        json={"target_type": "post", "target_id": post_id, "reason": "spam", "details": "Suspicious links in post."},
        headers=headers_user,
    )
    assert report_res.status_code == 201
    assert report_res.json()["reason"] == "spam"

    # 3. User hides own post
    hide_res = await async_client.post(f"/api/v1/community/moderation/posts/{post_id}/hide", headers=headers_user)
    assert hide_res.status_code == 200
    assert hide_res.json()["visibility"] == "Private"




