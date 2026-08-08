import math
import re
import uuid
import logging
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, RoleEnum
from app.models.community import (
    CommunityPost,
    PostImage,
    Comment,
    Collection,
    Report,
    CommunityCategory,
    CommunityTag,
)
from app.schemas.community import (
    CommunityPostCreate,
    CommunityPostUpdate,
    PostStatus,
    PostVisibility,
    CategoryCreate,
    TagCreate,
    CollectionCreate,
    CollectionUpdate,
    ReportCreate,
)
from app.repositories.community_repository import (
    CommunityPostRepository,
    CommunityCategoryRepository,
    CommunityTagRepository,
    CommentRepository,
    CollectionRepository,
    ReportRepository,
    ModerationAuditLogRepository,
)

logger = logging.getLogger("presently.community")


def generate_slug(title: str) -> str:
    text = title.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or "post"


def calculate_reading_time(content: str) -> int:
    words = len(content.split())
    return max(1, math.ceil(words / 200))


class CommunityService:
    def __init__(self):
        self.post_repo = CommunityPostRepository()
        self.category_repo = CommunityCategoryRepository()
        self.tag_repo = CommunityTagRepository()
        self.comment_repo = CommentRepository()
        self.collection_repo = CollectionRepository()
        self.report_repo = ReportRepository()
        self.audit_repo = ModerationAuditLogRepository()

    def _is_owner_or_admin(self, entity_author_id: UUID, current_user: User) -> bool:
        if current_user.id == entity_author_id:
            return True
        user_role = getattr(current_user, "role", "")
        return user_role in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]

    async def _ensure_unique_slug(
        self, db: AsyncSession, title: str, custom_slug: Optional[str] = None, exclude_post_id: Optional[UUID] = None
    ) -> str:
        if custom_slug:
            slug = custom_slug.lower().strip()
            existing = await self.post_repo.get_by_slug_any(db, slug)
            if existing and existing.id != exclude_post_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Slug '{slug}' is already in use.",
                )
            return slug

        base_slug = generate_slug(title)
        slug = base_slug
        counter = 1

        while True:
            existing = await self.post_repo.get_by_slug_any(db, slug)
            if not existing or existing.id == exclude_post_id:
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    async def _ensure_unique_collection_slug(
        self, db: AsyncSession, title: str, custom_slug: Optional[str] = None, exclude_id: Optional[UUID] = None
    ) -> str:
        if custom_slug:
            slug = custom_slug.lower().strip()
            existing = await self.collection_repo.get_by_slug_any(db, slug)
            if existing and existing.id != exclude_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Collection slug '{slug}' is already in use.",
                )
            return slug

        base_slug = generate_slug(title)
        slug = base_slug
        counter = 1

        while True:
            existing = await self.collection_repo.get_by_slug_any(db, slug)
            if not existing or existing.id == exclude_id:
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    async def _enrich_post(self, db: AsyncSession, post: CommunityPost, current_user: Optional[User]) -> CommunityPost:
        if current_user:
            post.is_liked = await self.post_repo.is_post_liked_by_user(db, post.id, current_user.id)
            post.is_saved = await self.post_repo.is_post_saved_by_user(db, post.id, current_user.id)
        else:
            post.is_liked = False
            post.is_saved = False
        return post

    async def create_post(
        self, db: AsyncSession, post_in: CommunityPostCreate, current_user: User
    ) -> CommunityPost:
        logger.info(f"Creating new community post by user {current_user.id}: {post_in.title}")

        slug = await self._ensure_unique_slug(db, title=post_in.title, custom_slug=post_in.slug)
        reading_time = calculate_reading_time(post_in.content)

        categories = await self.category_repo.get_by_ids(db, post_in.category_ids or [])
        tags = await self.tag_repo.get_by_ids(db, post_in.tag_ids or [])

        images = []
        if post_in.images:
            for idx, img_data in enumerate(post_in.images):
                images.append(
                    PostImage(
                        image_url=img_data.image_url,
                        alt_text=img_data.alt_text,
                        display_order=img_data.display_order if img_data.display_order is not None else idx,
                    )
                )

        post = CommunityPost(
            author_id=current_user.id,
            title=post_in.title,
            slug=slug,
            excerpt=post_in.excerpt,
            content=post_in.content,
            cover_image_url=post_in.cover_image_url,
            status=post_in.status.value if isinstance(post_in.status, PostStatus) else post_in.status,
            visibility=post_in.visibility.value if isinstance(post_in.visibility, PostVisibility) else post_in.visibility,
            reading_time=reading_time,
            view_count=0,
            gift_item_id=post_in.gift_item_id,
            is_published=(post_in.status == PostStatus.PUBLISHED),
        )

        try:
            created_post = await self.post_repo.create_post(db, post, categories, tags, images)
            logger.info(f"Successfully created community post ID: {created_post.id}")
            return await self._enrich_post(db, created_post, current_user)
        except Exception as e:
            logger.error(f"Error creating community post: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred while creating post.",
            )

    async def get_post(
        self, db: AsyncSession, post_id_or_slug: str, current_user: Optional[User] = None
    ) -> CommunityPost:
        post = None
        try:
            post_uuid = UUID(post_id_or_slug)
            post = await self.post_repo.get_by_id_with_relations(db, post_uuid)
        except ValueError:
            post = await self.post_repo.get_by_slug(db, post_id_or_slug)

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community post not found.",
            )

        is_admin = current_user is not None and getattr(current_user, "role", "") in [
            RoleEnum.ADMIN.value,
            RoleEnum.SUPER_ADMIN.value,
        ]
        is_author = current_user is not None and current_user.id == post.author_id

        if not is_admin and not is_author:
            if post.status != PostStatus.PUBLISHED.value:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Community post not found.",
                )
            if post.visibility == PostVisibility.PRIVATE.value:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This post is private.",
                )

        post = await self.post_repo.increment_view_count(db, post)
        return await self._enrich_post(db, post, current_user)

    async def list_posts(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        limit: int = 20,
        status_filter: Optional[str] = None,
        visibility_filter: Optional[str] = None,
        category_id: Optional[UUID] = None,
        tag_id: Optional[UUID] = None,
        author_id: Optional[UUID] = None,
        search: Optional[str] = None,
        date_range: Optional[str] = None,
        reading_time_bucket: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        current_user: Optional[User] = None,
    ) -> Tuple[List[CommunityPost], int]:
        skip = (page - 1) * limit
        is_admin = current_user is not None and getattr(current_user, "role", "") in [
            RoleEnum.ADMIN.value,
            RoleEnum.SUPER_ADMIN.value,
        ]
        current_user_id = current_user.id if current_user else None

        posts, total = await self.post_repo.list_posts(
            db,
            skip=skip,
            limit=limit,
            status=status_filter,
            visibility=visibility_filter,
            category_id=category_id,
            tag_id=tag_id,
            author_id=author_id,
            search=search,
            date_range=date_range,
            reading_time_bucket=reading_time_bucket,
            sort_by=sort_by,
            sort_order=sort_order,
            current_user_id=current_user_id,
            is_admin=is_admin,
        )

        for p in posts:
            await self._enrich_post(db, p, current_user)

        return posts, total

    async def update_post(
        self, db: AsyncSession, post_id: UUID, post_in: CommunityPostUpdate, current_user: User
    ) -> CommunityPost:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community post not found.",
            )

        if not self._is_owner_or_admin(post.author_id, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this post.",
            )

        update_dict = post_in.model_dump(exclude_unset=True)

        if "slug" in update_dict and update_dict["slug"]:
            update_dict["slug"] = await self._ensure_unique_slug(
                db, title=update_dict.get("title", post.title), custom_slug=update_dict["slug"], exclude_post_id=post_id
            )
        elif "title" in update_dict and update_dict["title"] and not post_in.slug:
            update_dict["slug"] = await self._ensure_unique_slug(db, title=update_dict["title"], exclude_post_id=post_id)

        if "content" in update_dict and update_dict["content"]:
            update_dict["reading_time"] = calculate_reading_time(update_dict["content"])

        if "status" in update_dict and isinstance(update_dict["status"], PostStatus):
            update_dict["status"] = update_dict["status"].value
            update_dict["is_published"] = (update_dict["status"] == PostStatus.PUBLISHED.value)
        if "visibility" in update_dict and isinstance(update_dict["visibility"], PostVisibility):
            update_dict["visibility"] = update_dict["visibility"].value

        categories = None
        if "category_ids" in update_dict and update_dict["category_ids"] is not None:
            categories = await self.category_repo.get_by_ids(db, update_dict.pop("category_ids"))

        tags = None
        if "tag_ids" in update_dict and update_dict["tag_ids"] is not None:
            tags = await self.tag_repo.get_by_ids(db, update_dict.pop("tag_ids"))

        images = None
        if "images" in update_dict and update_dict["images"] is not None:
            raw_images = update_dict.pop("images")
            images = [
                PostImage(
                    post_id=post_id,
                    image_url=img["image_url"] if isinstance(img, dict) else img.image_url,
                    alt_text=img.get("alt_text") if isinstance(img, dict) else getattr(img, "alt_text", None),
                    display_order=img.get("display_order", idx) if isinstance(img, dict) else getattr(img, "display_order", idx),
                )
                for idx, img in enumerate(raw_images)
            ]

        logger.info(f"Updating post {post_id} by user {current_user.id}")
        updated_post = await self.post_repo.update_post(db, post, update_dict, categories, tags, images)
        return await self._enrich_post(db, updated_post, current_user)

    async def delete_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> None:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community post not found.",
            )

        if not self._is_owner_or_admin(post.author_id, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this post.",
            )

        logger.info(f"Soft-deleting post {post_id} by user {current_user.id}")
        await self.post_repo.soft_delete_post(db, post)

    async def publish_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> CommunityPost:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community post not found.",
            )

        if not self._is_owner_or_admin(post.author_id, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to publish this post.",
            )

        logger.info(f"Publishing post {post_id} by user {current_user.id}")
        res = await self.post_repo.update_post(
            db, post, {"status": PostStatus.PUBLISHED.value, "is_published": True}
        )
        return await self._enrich_post(db, res, current_user)

    async def archive_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> CommunityPost:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community post not found.",
            )

        if not self._is_owner_or_admin(post.author_id, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to archive this post.",
            )

        logger.info(f"Archiving post {post_id} by user {current_user.id}")
        res = await self.post_repo.update_post(
            db, post, {"status": PostStatus.ARCHIVED.value, "is_published": False}
        )
        return await self._enrich_post(db, res, current_user)

    # --- Likes / Unlikes ---
    async def toggle_like_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> Tuple[bool, int]:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")

        is_liked = await self.post_repo.is_post_liked_by_user(db, post_id, current_user.id)
        if is_liked:
            return await self.post_repo.unlike_post(db, post, current_user.id)
        else:
            return await self.post_repo.like_post(db, post, current_user.id)

    async def unlike_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> Tuple[bool, int]:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")
        return await self.post_repo.unlike_post(db, post, current_user.id)

    # --- Saved Posts / Bookmarks ---
    async def toggle_save_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> bool:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")

        is_saved = await self.post_repo.is_post_saved_by_user(db, post_id, current_user.id)
        if is_saved:
            return await self.post_repo.unsave_post(db, post_id, current_user.id)
        else:
            return await self.post_repo.save_post(db, post_id, current_user.id)

    async def unsave_post(self, db: AsyncSession, post_id: UUID, current_user: User) -> bool:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")
        return await self.post_repo.unsave_post(db, post_id, current_user.id)

    async def list_saved_posts(
        self, db: AsyncSession, current_user: User, page: int = 1, limit: int = 20
    ) -> Tuple[List[CommunityPost], int]:
        skip = (page - 1) * limit
        posts, total = await self.post_repo.get_saved_posts_by_user(db, current_user.id, skip=skip, limit=limit)
        for p in posts:
            await self._enrich_post(db, p, current_user)
        return posts, total

    # --- Share Analytics ---
    async def record_share_analytics(self, db: AsyncSession, post_id: UUID, current_user: Optional[User] = None) -> Dict[str, Any]:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")
        logger.info(f"Recorded share event for post {post_id} by user {current_user.id if current_user else 'guest'}")
        return {"success": True, "post_id": str(post_id)}

    # --- Comments ---
    async def list_comments(
        self, db: AsyncSession, post_id: UUID, page: int = 1, limit: int = 20
    ) -> Tuple[List[Comment], int]:
        skip = (page - 1) * limit
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")
        return await self.comment_repo.get_comments_by_post_paginated(db, post_id, skip=skip, limit=limit)

    async def create_comment(
        self, db: AsyncSession, post_id: UUID, content: str, parent_id: Optional[UUID], current_user: User
    ) -> Comment:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found.")

        if parent_id:
            parent = await self.comment_repo.get_by_id_with_author(db, parent_id)
            if not parent or parent.post_id != post_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found.")

        comment = Comment(
            post_id=post_id,
            user_id=current_user.id,
            parent_id=parent_id,
            content=content.strip(),
        )
        return await self.comment_repo.create_comment(db, comment, post)

    async def update_comment(
        self, db: AsyncSession, comment_id: UUID, content: str, current_user: User
    ) -> Comment:
        comment = await self.comment_repo.get_by_id_with_author(db, comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        if not self._is_owner_or_admin(comment.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this comment.")

        return await self.comment_repo.update_comment(db, comment, content.strip())

    async def delete_comment(self, db: AsyncSession, comment_id: UUID, current_user: User) -> None:
        comment = await self.comment_repo.get_by_id_with_author(db, comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        if not self._is_owner_or_admin(comment.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment.")

        post = await self.post_repo.get_by_id_with_relations(db, comment.post_id)
        if post:
            await self.comment_repo.delete_comment(db, comment, post)

    # --- Collections ---
    async def create_collection(
        self, db: AsyncSession, collection_in: CollectionCreate, current_user: User
    ) -> Collection:
        slug = await self._ensure_unique_collection_slug(db, title=collection_in.title, custom_slug=collection_in.slug)
        col = Collection(
            user_id=current_user.id,
            title=collection_in.title.strip(),
            slug=slug,
            description=collection_in.description,
            is_public=collection_in.is_public,
            cover_image_url=collection_in.cover_image_url,
        )
        return await self.collection_repo.create_collection(db, col)

    async def get_collection(
        self, db: AsyncSession, id_or_slug: str, current_user: Optional[User] = None
    ) -> Collection:
        col = None
        try:
            col_id = UUID(id_or_slug)
            col = await self.collection_repo.get_by_id_with_relations(db, col_id)
        except ValueError:
            col = await self.collection_repo.get_by_slug_with_relations(db, id_or_slug)

        if not col:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        if not col.is_public:
            if not current_user or (current_user.id != col.user_id and getattr(current_user, "role", "") not in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This collection is private.")

        return col

    async def list_collections(
        self, db: AsyncSession, page: int = 1, limit: int = 20, user_id: Optional[UUID] = None, current_user: Optional[User] = None
    ) -> Tuple[List[Collection], int]:
        skip = (page - 1) * limit
        is_public_only = True
        if current_user and user_id and current_user.id == user_id:
            is_public_only = False
        collections, total = await self.collection_repo.list_collections(
            db, skip=skip, limit=limit, user_id=user_id, is_public_only=is_public_only
        )
        return collections, total

    async def update_collection(
        self, db: AsyncSession, collection_id: UUID, collection_in: CollectionUpdate, current_user: User
    ) -> Collection:
        col = await self.collection_repo.get_by_id_with_relations(db, collection_id)
        if not col:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        if not self._is_owner_or_admin(col.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this collection.")

        update_dict = collection_in.model_dump(exclude_unset=True)
        if "slug" in update_dict and update_dict["slug"]:
            update_dict["slug"] = await self._ensure_unique_collection_slug(
                db, title=update_dict.get("title", col.title), custom_slug=update_dict["slug"], exclude_id=collection_id
            )

        return await self.collection_repo.update_collection(db, col, update_dict)

    async def delete_collection(self, db: AsyncSession, collection_id: UUID, current_user: User) -> None:
        col = await self.collection_repo.get_by_id_with_relations(db, collection_id)
        if not col:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        if not self._is_owner_or_admin(col.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this collection.")

        await self.collection_repo.delete_collection(db, col)

    async def add_post_to_collection(self, db: AsyncSession, collection_id: UUID, post_id: UUID, current_user: User) -> None:
        col = await self.collection_repo.get_by_id_with_relations(db, collection_id)
        if not col:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        if not self._is_owner_or_admin(col.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this collection.")

        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        await self.collection_repo.add_post_to_collection(db, col, post)

    async def remove_post_from_collection(self, db: AsyncSession, collection_id: UUID, post_id: UUID, current_user: User) -> None:
        col = await self.collection_repo.get_by_id_with_relations(db, collection_id)
        if not col:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        if not self._is_owner_or_admin(col.user_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this collection.")

        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        await self.collection_repo.remove_post_from_collection(db, col, post)

    # --- Autocomplete Search ---
    async def autocomplete_search(self, db: AsyncSession, q: str) -> List[Dict[str, Any]]:
        if not q or len(q.strip()) < 2:
            return []

        suggestions = []

        # Posts
        posts, _ = await self.post_repo.list_posts(db, skip=0, limit=5, search=q.strip(), status="Published", visibility="Public")
        for p in posts:
            suggestions.append({
                "type": "post",
                "id": str(p.id),
                "title": p.title,
                "subtitle": f"Story • {p.reading_time}m read",
                "url": f"/community/posts/{p.slug or p.id}",
                "imageUrl": p.cover_image_url,
            })

        # Categories
        cats = await self.category_repo.get_all(db)
        matched_cats = [c for c in cats if q.lower() in c.name.lower() or q.lower() in c.slug.lower()][:3]
        for c in matched_cats:
            suggestions.append({
                "type": "category",
                "id": str(c.id),
                "title": c.name,
                "subtitle": "Category",
                "url": f"/community/category/{c.slug}",
                "imageUrl": None,
            })

        # Tags
        tags = await self.tag_repo.get_all(db)
        matched_tags = [t for t in tags if q.lower() in t.name.lower() or q.lower() in t.slug.lower()][:3]
        for t in matched_tags:
            suggestions.append({
                "type": "tag",
                "id": str(t.id),
                "title": f"#{t.name}",
                "subtitle": "Topic Tag",
                "url": f"/community/tag/{t.slug}",
                "imageUrl": None,
            })

        return suggestions

    # --- Reporting & Moderation ---
    async def create_report(
        self, db: AsyncSession, report_in: ReportCreate, current_user: User
    ) -> Report:
        report = Report(
            reporter_id=current_user.id,
            target_type=report_in.target_type,
            target_id=report_in.target_id,
            reason=report_in.reason,
            details=report_in.details,
            status="pending",
        )
        logger.info(f"User {current_user.id} reported {report_in.target_type} {report_in.target_id} for {report_in.reason}")
        return await self.report_repo.create_report(db, report)

    async def list_reports(
        self, db: AsyncSession, page: int = 1, limit: int = 20, status_filter: Optional[str] = None, current_user: Optional[User] = None
    ) -> Tuple[List[Report], int]:
        if not current_user or getattr(current_user, "role", "") not in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Moderation review queue access requires admin role.")
        skip = (page - 1) * limit
        return await self.report_repo.list_reports(db, skip=skip, limit=limit, status_filter=status_filter)

    async def resolve_report(
        self, db: AsyncSession, report_id: UUID, new_status: str, notes: Optional[str], current_user: User
    ) -> Report:
        if getattr(current_user, "role", "") not in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Resolving reports requires admin role.")

        report = await self.report_repo.get_by_id_with_relations(db, report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

        updated_report = await self.report_repo.update_report_status(db, report, new_status, current_user.id)
        await self.audit_repo.log_action(
            db, moderator_id=current_user.id, action=f"resolve_report_{new_status}", target_type="report", target_id=report_id, reason=notes
        )
        return updated_report

    async def delete_report(self, db: AsyncSession, report_id: UUID, current_user: User) -> None:
        if getattr(current_user, "role", "") not in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Deleting report entries requires admin role.")

        report = await self.report_repo.get_by_id_with_relations(db, report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

        await self.report_repo.delete_report(db, report)
        await self.audit_repo.log_action(
            db, moderator_id=current_user.id, action="delete_report", target_type="report", target_id=report_id
        )

    async def hide_post(self, db: AsyncSession, post_id: UUID, current_user: User, reason: Optional[str] = None) -> CommunityPost:
        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        if not self._is_owner_or_admin(post.author_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to hide this post.")

        updated_post = await self.post_repo.update_post(db, post, {"visibility": PostVisibility.PRIVATE.value})
        await self.audit_repo.log_action(
            db, moderator_id=current_user.id, action="hide_post", target_type="post", target_id=post_id, reason=reason
        )
        return await self._enrich_post(db, updated_post, current_user)

    async def restore_post(self, db: AsyncSession, post_id: UUID, current_user: User, reason: Optional[str] = None) -> CommunityPost:
        if getattr(current_user, "role", "") not in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restoring hidden posts requires admin role.")

        post = await self.post_repo.get_by_id_with_relations(db, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        updated_post = await self.post_repo.update_post(db, post, {"visibility": PostVisibility.PUBLIC.value, "status": PostStatus.PUBLISHED.value})
        await self.audit_repo.log_action(
            db, moderator_id=current_user.id, action="restore_post", target_type="post", target_id=post_id, reason=reason
        )
        return await self._enrich_post(db, updated_post, current_user)

    # --- Taxonomy Methods ---
    async def list_categories(self, db: AsyncSession) -> List[CommunityCategory]:
        return await self.category_repo.get_all(db)

    async def create_category(self, db: AsyncSession, category_in: CategoryCreate) -> CommunityCategory:
        existing = await self.category_repo.get_by_slug(db, category_in.slug)
        if existing:
            return existing
        cat = CommunityCategory(
            name=category_in.name,
            slug=category_in.slug,
            description=category_in.description,
        )
        db.add(cat)
        await db.commit()
        await db.refresh(cat)
        return cat

    async def list_tags(self, db: AsyncSession) -> List[CommunityTag]:
        return await self.tag_repo.get_all(db)

    async def create_tag(self, db: AsyncSession, tag_in: TagCreate) -> CommunityTag:
        existing = await self.tag_repo.get_by_slug(db, tag_in.slug)
        if existing:
            return existing
        tag = CommunityTag(
            name=tag_in.name,
            slug=tag_in.slug,
        )
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        return tag
