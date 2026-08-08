from typing import List, Optional, Tuple, Any, Dict
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, asc, or_, and_
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.community import (
    CommunityPost,
    PostImage,
    Comment,
    PostLike,
    SavedPost,
    Collection,
    Report,
    ModerationAuditLog,
    CommunityCategory,
    CommunityTag,
    community_post_categories,
    community_post_tags,
    collection_posts,
)



class CommunityCategoryRepository(BaseRepository[CommunityCategory]):
    def __init__(self):
        super().__init__(CommunityCategory)

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[CommunityCategory]:
        result = await db.execute(select(CommunityCategory).where(CommunityCategory.slug == slug))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[CommunityCategory]:
        result = await db.execute(select(CommunityCategory).where(CommunityCategory.name == name))
        return result.scalars().first()

    async def get_all(self, db: AsyncSession) -> List[CommunityCategory]:
        result = await db.execute(select(CommunityCategory).order_by(CommunityCategory.name.asc()))
        return list(result.scalars().all())

    async def get_by_ids(self, db: AsyncSession, category_ids: List[UUID]) -> List[CommunityCategory]:
        if not category_ids:
            return []
        result = await db.execute(select(CommunityCategory).where(CommunityCategory.id.in_(category_ids)))
        return list(result.scalars().all())


class CommunityTagRepository(BaseRepository[CommunityTag]):
    def __init__(self):
        super().__init__(CommunityTag)

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[CommunityTag]:
        result = await db.execute(select(CommunityTag).where(CommunityTag.slug == slug))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[CommunityTag]:
        result = await db.execute(select(CommunityTag).where(CommunityTag.name == name))
        return result.scalars().first()

    async def get_all(self, db: AsyncSession) -> List[CommunityTag]:
        result = await db.execute(select(CommunityTag).order_by(CommunityTag.name.asc()))
        return list(result.scalars().all())

    async def get_by_ids(self, db: AsyncSession, tag_ids: List[UUID]) -> List[CommunityTag]:
        if not tag_ids:
            return []
        result = await db.execute(select(CommunityTag).where(CommunityTag.id.in_(tag_ids)))
        return list(result.scalars().all())


class CommunityPostRepository(BaseRepository[CommunityPost]):
    def __init__(self):
        super().__init__(CommunityPost)

    async def get_by_id_with_relations(self, db: AsyncSession, id: UUID) -> Optional[CommunityPost]:
        result = await db.execute(
            select(CommunityPost)
            .options(
                selectinload(CommunityPost.categories),
                selectinload(CommunityPost.tags),
                selectinload(CommunityPost.images),
                selectinload(CommunityPost.author),
            )
            .where(CommunityPost.id == id, CommunityPost.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[CommunityPost]:
        result = await db.execute(
            select(CommunityPost)
            .options(
                selectinload(CommunityPost.categories),
                selectinload(CommunityPost.tags),
                selectinload(CommunityPost.images),
                selectinload(CommunityPost.author),
            )
            .where(CommunityPost.slug == slug, CommunityPost.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_by_slug_any(self, db: AsyncSession, slug: str) -> Optional[CommunityPost]:
        result = await db.execute(
            select(CommunityPost).where(CommunityPost.slug == slug)
        )
        return result.scalars().first()

    async def list_posts(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        visibility: Optional[str] = None,
        category_id: Optional[UUID] = None,
        tag_id: Optional[UUID] = None,
        author_id: Optional[UUID] = None,
        search: Optional[str] = None,
        date_range: Optional[str] = None,
        reading_time_bucket: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        allowed_statuses: Optional[List[str]] = None,
        allowed_visibilities: Optional[List[str]] = None,
        current_user_id: Optional[UUID] = None,
        is_admin: bool = False,
    ) -> Tuple[List[CommunityPost], int]:
        query = select(CommunityPost).where(CommunityPost.deleted_at.is_(None))

        # Filter by status
        if status:
            query = query.where(CommunityPost.status == status)
        elif allowed_statuses:
            query = query.where(CommunityPost.status.in_(allowed_statuses))

        # Filter by visibility
        if visibility:
            query = query.where(CommunityPost.visibility == visibility)
        elif allowed_visibilities:
            query = query.where(CommunityPost.visibility.in_(allowed_visibilities))

        # Non-admin visibility check logic for draft/private posts
        if not is_admin:
            if current_user_id:
                query = query.where(
                    or_(
                        and_(
                            CommunityPost.status == "Published",
                            CommunityPost.visibility.in_(["Public", "Unlisted"]),
                        ),
                        CommunityPost.author_id == current_user_id,
                    )
                )
            else:
                query = query.where(
                    CommunityPost.status == "Published",
                    CommunityPost.visibility == "Public",
                )

        # Filter by category_id
        if category_id:
            query = query.join(CommunityPost.categories).where(CommunityCategory.id == category_id)

        # Filter by tag_id
        if tag_id:
            query = query.join(CommunityPost.tags).where(CommunityTag.id == tag_id)

        # Filter by author_id
        if author_id:
            query = query.where(CommunityPost.author_id == author_id)

        # Text search filter
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    CommunityPost.title.ilike(search_pattern),
                    CommunityPost.content.ilike(search_pattern),
                    CommunityPost.excerpt.ilike(search_pattern),
                )
            )

        # Date range filter
        if date_range:
            now = datetime.now(timezone.utc)
            if date_range == "today":
                query = query.where(CommunityPost.created_at >= now - timedelta(days=1))
            elif date_range == "this_week":
                query = query.where(CommunityPost.created_at >= now - timedelta(days=7))
            elif date_range == "this_month":
                query = query.where(CommunityPost.created_at >= now - timedelta(days=30))
            elif date_range == "this_year":
                query = query.where(CommunityPost.created_at >= now - timedelta(days=365))

        # Reading time bucket filter
        if reading_time_bucket:
            if reading_time_bucket == "short":
                query = query.where(CommunityPost.reading_time <= 3)
            elif reading_time_bucket == "medium":
                query = query.where(CommunityPost.reading_time.between(4, 7))
            elif reading_time_bucket == "long":
                query = query.where(CommunityPost.reading_time >= 8)

        # Count total matching records before offset/limit
        subq = query.subquery()
        count_query = select(func.count()).select_from(subq)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Eager load relationships
        query = query.options(
            selectinload(CommunityPost.categories),
            selectinload(CommunityPost.tags),
            selectinload(CommunityPost.images),
            selectinload(CommunityPost.author),
        )

        # Sorting
        sort_column = getattr(CommunityPost, sort_by, CommunityPost.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        posts = list(result.scalars().unique().all())
        return posts, total

    async def create_post(
        self,
        db: AsyncSession,
        post: CommunityPost,
        categories: List[CommunityCategory],
        tags: List[CommunityTag],
        images: List[PostImage],
    ) -> CommunityPost:
        post.categories = categories
        post.tags = tags
        post.images = images
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return await self.get_by_id_with_relations(db, post.id)

    async def update_post(
        self,
        db: AsyncSession,
        post: CommunityPost,
        update_data: Dict[str, Any],
        categories: Optional[List[CommunityCategory]] = None,
        tags: Optional[List[CommunityTag]] = None,
        images: Optional[List[PostImage]] = None,
    ) -> CommunityPost:
        for key, value in update_data.items():
            if value is not None and hasattr(post, key):
                setattr(post, key, value)

        if categories is not None:
            post.categories = categories
        if tags is not None:
            post.tags = tags
        if images is not None:
            post.images = images

        post.updated_at = datetime.now(timezone.utc)
        db.add(post)
        await db.commit()
        return await self.get_by_id_with_relations(db, post.id)

    async def increment_view_count(self, db: AsyncSession, post: CommunityPost) -> CommunityPost:
        post.view_count += 1
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return post

    async def soft_delete_post(self, db: AsyncSession, post: CommunityPost) -> None:
        post.deleted_at = datetime.now(timezone.utc)
        db.add(post)
        await db.commit()

    # --- Likes / Unlikes ---
    async def is_post_liked_by_user(self, db: AsyncSession, post_id: UUID, user_id: UUID) -> bool:
        result = await db.execute(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
        return result.scalars().first() is not None

    async def like_post(self, db: AsyncSession, post: CommunityPost, user_id: UUID) -> Tuple[bool, int]:
        existing = await self.is_post_liked_by_user(db, post.id, user_id)
        if not existing:
            like = PostLike(post_id=post.id, user_id=user_id)
            db.add(like)
            post.likes_count += 1
            db.add(post)
            await db.commit()
            await db.refresh(post)
            return True, post.likes_count
        return True, post.likes_count

    async def unlike_post(self, db: AsyncSession, post: CommunityPost, user_id: UUID) -> Tuple[bool, int]:
        result = await db.execute(
            select(PostLike).where(PostLike.post_id == post.id, PostLike.user_id == user_id)
        )
        like = result.scalars().first()
        if like:
            await db.delete(like)
            post.likes_count = max(0, post.likes_count - 1)
            db.add(post)
            await db.commit()
            await db.refresh(post)
            return False, post.likes_count
        return False, post.likes_count

    # --- Bookmarks / Saved Posts ---
    async def is_post_saved_by_user(self, db: AsyncSession, post_id: UUID, user_id: UUID) -> bool:
        result = await db.execute(
            select(SavedPost).where(SavedPost.post_id == post_id, SavedPost.user_id == user_id)
        )
        return result.scalars().first() is not None

    async def save_post(self, db: AsyncSession, post_id: UUID, user_id: UUID) -> bool:
        existing = await self.is_post_saved_by_user(db, post_id, user_id)
        if not existing:
            saved = SavedPost(post_id=post_id, user_id=user_id)
            db.add(saved)
            await db.commit()
            return True
        return True

    async def unsave_post(self, db: AsyncSession, post_id: UUID, user_id: UUID) -> bool:
        result = await db.execute(
            select(SavedPost).where(SavedPost.post_id == post_id, SavedPost.user_id == user_id)
        )
        saved = result.scalars().first()
        if saved:
            await db.delete(saved)
            await db.commit()
            return False
        return False

    async def get_saved_posts_by_user(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[CommunityPost], int]:
        query = (
            select(CommunityPost)
            .join(SavedPost, SavedPost.post_id == CommunityPost.id)
            .where(SavedPost.user_id == user_id, CommunityPost.deleted_at.is_(None))
        )

        subq = query.subquery()
        count_query = select(func.count()).select_from(subq)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = (
            query.options(
                selectinload(CommunityPost.categories),
                selectinload(CommunityPost.tags),
                selectinload(CommunityPost.images),
                selectinload(CommunityPost.author),
            )
            .order_by(desc(SavedPost.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        posts = list(result.scalars().unique().all())
        return posts, total


class CommentRepository(BaseRepository[Comment]):
    def __init__(self):
        super().__init__(Comment)

    async def get_by_id_with_author(self, db: AsyncSession, comment_id: UUID) -> Optional[Comment]:
        result = await db.execute(
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.replies).options(
                    selectinload(Comment.author),
                    selectinload(Comment.replies).selectinload(Comment.author),
                ),
            )
            .where(Comment.id == comment_id, Comment.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_comments_by_post_paginated(
        self, db: AsyncSession, post_id: UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Comment], int]:
        query = select(Comment).where(
            Comment.post_id == post_id,
            Comment.parent_id.is_(None),
            Comment.deleted_at.is_(None),
        )

        subq = query.subquery()
        count_query = select(func.count()).select_from(subq)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = (
            query.options(
                selectinload(Comment.author),
                selectinload(Comment.replies).options(
                    selectinload(Comment.author),
                    selectinload(Comment.replies).selectinload(Comment.author),
                ),
            )
            .order_by(desc(Comment.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        comments = list(result.scalars().unique().all())
        return comments, total

    async def create_comment(
        self, db: AsyncSession, comment: Comment, post: CommunityPost
    ) -> Comment:
        db.add(comment)
        post.comments_count += 1
        db.add(post)
        await db.commit()
        await db.refresh(comment)
        return await self.get_by_id_with_author(db, comment.id)

    async def update_comment(self, db: AsyncSession, comment: Comment, content: str) -> Comment:
        comment.content = content
        comment.updated_at = datetime.now(timezone.utc)
        db.add(comment)
        await db.commit()
        return await self.get_by_id_with_author(db, comment.id)

    async def delete_comment(self, db: AsyncSession, comment: Comment, post: CommunityPost) -> None:
        comment.deleted_at = datetime.now(timezone.utc)
        db.add(comment)
        post.comments_count = max(0, post.comments_count - 1)
        db.add(post)
        await db.commit()


class CollectionRepository(BaseRepository[Collection]):
    def __init__(self):
        super().__init__(Collection)

    async def get_by_id_with_relations(self, db: AsyncSession, collection_id: UUID) -> Optional[Collection]:
        result = await db.execute(
            select(Collection)
            .options(
                selectinload(Collection.user),
                selectinload(Collection.posts).options(
                    selectinload(CommunityPost.categories),
                    selectinload(CommunityPost.tags),
                    selectinload(CommunityPost.images),
                    selectinload(CommunityPost.author),
                ),
            )
            .where(Collection.id == collection_id)
        )
        return result.scalars().first()

    async def get_by_slug_with_relations(self, db: AsyncSession, slug: str) -> Optional[Collection]:
        result = await db.execute(
            select(Collection)
            .options(
                selectinload(Collection.user),
                selectinload(Collection.posts).options(
                    selectinload(CommunityPost.categories),
                    selectinload(CommunityPost.tags),
                    selectinload(CommunityPost.images),
                    selectinload(CommunityPost.author),
                ),
            )
            .where(Collection.slug == slug)
        )
        return result.scalars().first()

    async def get_by_slug_any(self, db: AsyncSession, slug: str) -> Optional[Collection]:
        result = await db.execute(select(Collection).where(Collection.slug == slug))
        return result.scalars().first()

    async def list_collections(
        self, db: AsyncSession, skip: int = 0, limit: int = 20, user_id: Optional[UUID] = None, is_public_only: bool = True
    ) -> Tuple[List[Collection], int]:
        query = select(Collection)
        if user_id:
            query = query.where(Collection.user_id == user_id)
        if is_public_only:
            query = query.where(Collection.is_public == True)

        subq = query.subquery()
        count_query = select(func.count()).select_from(subq)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = (
            query.options(
                selectinload(Collection.user),
                selectinload(Collection.posts).options(
                    selectinload(CommunityPost.categories),
                    selectinload(CommunityPost.tags),
                    selectinload(CommunityPost.images),
                    selectinload(CommunityPost.author),
                ),
            )
            .order_by(desc(Collection.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        collections = list(result.scalars().unique().all())
        return collections, total

    async def create_collection(self, db: AsyncSession, collection: Collection) -> Collection:
        db.add(collection)
        await db.commit()
        await db.refresh(collection)
        return await self.get_by_id_with_relations(db, collection.id)

    async def update_collection(self, db: AsyncSession, collection: Collection, update_data: Dict[str, Any]) -> Collection:
        for key, val in update_data.items():
            if val is not None and hasattr(collection, key):
                setattr(collection, key, val)
        collection.updated_at = datetime.now(timezone.utc)
        db.add(collection)
        await db.commit()
        return await self.get_by_id_with_relations(db, collection.id)

    async def delete_collection(self, db: AsyncSession, collection: Collection) -> None:
        await db.delete(collection)
        await db.commit()

    async def add_post_to_collection(self, db: AsyncSession, collection: Collection, post: CommunityPost) -> None:
        if post not in collection.posts:
            collection.posts.append(post)
            collection.updated_at = datetime.now(timezone.utc)
            db.add(collection)
            await db.commit()

    async def remove_post_from_collection(self, db: AsyncSession, collection: Collection, post: CommunityPost) -> None:
        if post in collection.posts:
            collection.posts.remove(post)
            collection.updated_at = datetime.now(timezone.utc)
            db.add(collection)
            await db.commit()


class ReportRepository(BaseRepository[Report]):
    def __init__(self):
        super().__init__(Report)

    async def create_report(self, db: AsyncSession, report: Report) -> Report:
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    async def get_by_id_with_relations(self, db: AsyncSession, report_id: UUID) -> Optional[Report]:
        result = await db.execute(
            select(Report)
            .options(selectinload(Report.reporter), selectinload(Report.resolver))
            .where(Report.id == report_id)
        )
        return result.scalars().first()

    async def list_reports(
        self, db: AsyncSession, skip: int = 0, limit: int = 20, status_filter: Optional[str] = None
    ) -> Tuple[List[Report], int]:
        query = select(Report)
        if status_filter:
            query = query.where(Report.status == status_filter)

        subq = query.subquery()
        count_query = select(func.count()).select_from(subq)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = (
            query.options(selectinload(Report.reporter), selectinload(Report.resolver))
            .order_by(desc(Report.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        reports = list(result.scalars().unique().all())
        return reports, total

    async def update_report_status(
        self, db: AsyncSession, report: Report, status: str, resolved_by: UUID
    ) -> Report:
        report.status = status
        report.resolved_by = resolved_by
        report.resolved_at = datetime.now(timezone.utc)
        db.add(report)
        await db.commit()
        return await self.get_by_id_with_relations(db, report.id)

    async def delete_report(self, db: AsyncSession, report: Report) -> None:
        await db.delete(report)
        await db.commit()


class ModerationAuditLogRepository(BaseRepository[ModerationAuditLog]):
    def __init__(self):
        super().__init__(ModerationAuditLog)

    async def log_action(
        self, db: AsyncSession, moderator_id: UUID, action: str, target_type: str, target_id: UUID, reason: Optional[str] = None
    ) -> ModerationAuditLog:
        log_entry = ModerationAuditLog(
            moderator_id=moderator_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
        )
        db.add(log_entry)
        await db.commit()
        await db.refresh(log_entry)
        return log_entry

