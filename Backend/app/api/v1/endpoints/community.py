import math
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.schemas.community import (
    CommunityPostCreate,
    CommunityPostUpdate,
    CommunityPostResponse,
    CommunityPostListResponse,
    CategoryResponse,
    TagResponse,
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentListResponse,
    LikeResponse,
    SaveResponse,
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionListResponse,
    AutocompleteResponse,
    AutocompleteSuggestion,
    ReportCreate,
    ReportResponse,
    ReportListResponse,
    ReportActionRequest,
    PostStatus,
    PostVisibility,
)

from app.services.community_service import CommunityService

router = APIRouter()
service = CommunityService()


@router.post("/posts", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: CommunityPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new community post. Requires authentication.
    """
    return await service.create_post(db, post_in, current_user)


@router.get("/posts", response_model=CommunityPostListResponse)
async def list_posts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[PostStatus] = Query(None, description="Filter by post status"),
    visibility: Optional[PostVisibility] = Query(None, description="Filter by visibility"),
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    tag_id: Optional[UUID] = Query(None, description="Filter by tag ID"),
    author_id: Optional[UUID] = Query(None, description="Filter by author user ID"),
    search: Optional[str] = Query(None, description="Global text search query"),
    date_range: Optional[str] = Query(None, description="Date filter (today, this_week, this_month, this_year)"),
    reading_time_bucket: Optional[str] = Query(None, description="Reading time bucket (short, medium, long)"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, view_count, reading_time, title)"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    List community posts with pagination, multi-dimensional filtering, and text search.
    """
    status_str = status.value if status else None
    visibility_str = visibility.value if visibility else None

    posts, total = await service.list_posts(
        db,
        page=page,
        limit=limit,
        status_filter=status_str,
        visibility_filter=visibility_str,
        category_id=category_id,
        tag_id=tag_id,
        author_id=author_id,
        search=search,
        date_range=date_range,
        reading_time_bucket=reading_time_bucket,
        sort_by=sort_by,
        sort_order=sort_order,
        current_user=current_user,
    )

    pages = math.ceil(total / limit) if total > 0 else 0

    return CommunityPostListResponse(
        items=posts,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/search/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_search(
    q: str = Query(..., min_length=1, description="Search term for suggestions"),
    db: AsyncSession = Depends(get_db),
):
    """
    Instant autocomplete suggestions for posts, categories, and tags.
    """
    suggestions_data = await service.autocomplete_search(db, q)
    suggestions = [AutocompleteSuggestion(**item) for item in suggestions_data]
    return AutocompleteResponse(suggestions=suggestions)


@router.get("/saved", response_model=CommunityPostListResponse)
async def list_saved_posts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List current user's saved/bookmarked community posts.
    """
    posts, total = await service.list_saved_posts(db, current_user, page=page, limit=limit)
    pages = math.ceil(total / limit) if total > 0 else 0

    return CommunityPostListResponse(
        items=posts,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/posts/{id_or_slug}", response_model=CommunityPostResponse)
async def get_post(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Get a single community post by UUID or slug. Increments view count.
    """
    return await service.get_post(db, id_or_slug, current_user)


@router.put("/posts/{post_id}", response_model=CommunityPostResponse)
async def update_post(
    post_id: UUID,
    post_in: CommunityPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a post by ID. Only author or admin.
    """
    return await service.update_post(db, post_id, post_in, current_user)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Soft-delete a post by ID. Only author or admin.
    """
    await service.delete_post(db, post_id, current_user)
    return None


@router.post("/posts/{post_id}/publish", response_model=CommunityPostResponse)
async def publish_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Transition a post's status to Published.
    """
    return await service.publish_post(db, post_id, current_user)


@router.post("/posts/{post_id}/archive", response_model=CommunityPostResponse)
async def archive_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Transition a post's status to Archived.
    """
    return await service.archive_post(db, post_id, current_user)


# --- Likes & Bookmarks ---
@router.post("/posts/{post_id}/like", response_model=LikeResponse)
async def toggle_like_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    liked, likes_count = await service.toggle_like_post(db, post_id, current_user)
    return LikeResponse(liked=liked, likes_count=likes_count)


@router.delete("/posts/{post_id}/like", response_model=LikeResponse)
async def unlike_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    liked, likes_count = await service.unlike_post(db, post_id, current_user)
    return LikeResponse(liked=liked, likes_count=likes_count)


@router.post("/posts/{post_id}/save", response_model=SaveResponse)
async def toggle_save_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = await service.toggle_save_post(db, post_id, current_user)
    return SaveResponse(saved=saved)


@router.delete("/posts/{post_id}/save", response_model=SaveResponse)
async def unsave_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = await service.unsave_post(db, post_id, current_user)
    return SaveResponse(saved=saved)


@router.post("/posts/{post_id}/share")
async def record_share(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    return await service.record_share_analytics(db, post_id, current_user)


# --- Comments ---
@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
async def list_comments(
    post_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    comments, total = await service.list_comments(db, post_id, page=page, limit=limit)
    pages = math.ceil(total / limit) if total > 0 else 0
    return CommentListResponse(
        items=comments,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: UUID,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.create_comment(db, post_id, comment_in.content, comment_in.parent_id, current_user)


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: UUID,
    comment_in: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.update_comment(db, comment_id, comment_in.content, current_user)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await service.delete_comment(db, comment_id, current_user)
    return None


# --- Collections ---
@router.post("/collections", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_in: CollectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new collection of gift stories. Requires authentication.
    """
    col = await service.create_collection(db, collection_in, current_user)
    return CollectionResponse(
        id=col.id,
        user_id=col.user_id,
        author=col.user,
        title=col.title,
        slug=col.slug,
        description=col.description,
        is_public=col.is_public,
        cover_image_url=col.cover_image_url,
        posts_count=len(col.posts or []),
        posts=col.posts or [],
        created_at=col.created_at,
        updated_at=col.updated_at,
    )


@router.get("/collections", response_model=CollectionListResponse)
async def list_collections(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    List public gift story collections.
    """
    collections, total = await service.list_collections(db, page=page, limit=limit, user_id=user_id, current_user=current_user)
    pages = math.ceil(total / limit) if total > 0 else 0

    items = [
        CollectionResponse(
            id=col.id,
            user_id=col.user_id,
            author=col.user,
            title=col.title,
            slug=col.slug,
            description=col.description,
            is_public=col.is_public,
            cover_image_url=col.cover_image_url,
            posts_count=len(col.posts or []),
            posts=col.posts or [],
            created_at=col.created_at,
            updated_at=col.updated_at,
        )
        for col in collections
    ]

    return CollectionListResponse(items=items, total=total, page=page, limit=limit, pages=pages)


@router.get("/collections/my", response_model=CollectionListResponse)
async def list_my_collections(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List current user's collections (including private ones).
    """
    collections, total = await service.list_collections(db, page=page, limit=limit, user_id=current_user.id, current_user=current_user)
    pages = math.ceil(total / limit) if total > 0 else 0

    items = [
        CollectionResponse(
            id=col.id,
            user_id=col.user_id,
            author=col.user,
            title=col.title,
            slug=col.slug,
            description=col.description,
            is_public=col.is_public,
            cover_image_url=col.cover_image_url,
            posts_count=len(col.posts or []),
            posts=col.posts or [],
            created_at=col.created_at,
            updated_at=col.updated_at,
        )
        for col in collections
    ]

    return CollectionListResponse(items=items, total=total, page=page, limit=limit, pages=pages)


@router.get("/collections/{id_or_slug}", response_model=CollectionResponse)
async def get_collection(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Get collection details and contained posts by UUID or slug.
    """
    col = await service.get_collection(db, id_or_slug, current_user)
    return CollectionResponse(
        id=col.id,
        user_id=col.user_id,
        author=col.user,
        title=col.title,
        slug=col.slug,
        description=col.description,
        is_public=col.is_public,
        cover_image_url=col.cover_image_url,
        posts_count=len(col.posts or []),
        posts=col.posts or [],
        created_at=col.created_at,
        updated_at=col.updated_at,
    )


@router.put("/collections/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: UUID,
    collection_in: CollectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Edit collection properties. Only owner or admin.
    """
    col = await service.update_collection(db, collection_id, collection_in, current_user)
    return CollectionResponse(
        id=col.id,
        user_id=col.user_id,
        author=col.user,
        title=col.title,
        slug=col.slug,
        description=col.description,
        is_public=col.is_public,
        cover_image_url=col.cover_image_url,
        posts_count=len(col.posts or []),
        posts=col.posts or [],
        created_at=col.created_at,
        updated_at=col.updated_at,
    )


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete collection. Only owner or admin.
    """
    await service.delete_collection(db, collection_id, current_user)
    return None


@router.post("/collections/{collection_id}/posts/{post_id}", status_code=status.HTTP_200_OK)
async def add_post_to_collection(
    collection_id: UUID,
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add post to collection.
    """
    await service.add_post_to_collection(db, collection_id, post_id, current_user)
    return {"success": True}


@router.delete("/collections/{collection_id}/posts/{post_id}", status_code=status.HTTP_200_OK)
async def remove_post_from_collection(
    collection_id: UUID,
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove post from collection.
    """
    await service.remove_post_from_collection(db, collection_id, post_id, current_user)
    return {"success": True}


# --- Taxonomy ---
@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    return await service.list_categories(db)


@router.get("/tags", response_model=List[TagResponse])
async def list_tags(
    db: AsyncSession = Depends(get_db),
):
    return await service.list_tags(db)


# --- Reporting & Moderation Endpoints ---
@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a report for a post or comment.
    """
    report = await service.create_report(db, report_in, current_user)
    return ReportResponse(
        id=report.id,
        reporter_id=report.reporter_id,
        reporter=report.reporter,
        target_type=report.target_type,
        target_id=report.target_id,
        reason=report.reason,
        details=report.details,
        status=report.status,
        resolved_by=report.resolved_by,
        resolved_at=report.resolved_at,
        created_at=report.created_at,
    )


@router.get("/moderation/reports", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get moderation review queue. Admin / Moderator role required.
    """
    reports, total = await service.list_reports(db, page=page, limit=limit, status_filter=status_filter, current_user=current_user)
    pages = math.ceil(total / limit) if total > 0 else 0

    items = [
        ReportResponse(
            id=rep.id,
            reporter_id=rep.reporter_id,
            reporter=rep.reporter,
            target_type=rep.target_type,
            target_id=rep.target_id,
            reason=rep.reason,
            details=rep.details,
            status=rep.status,
            resolved_by=rep.resolved_by,
            resolved_at=rep.resolved_at,
            created_at=rep.created_at,
        )
        for rep in reports
    ]
    return ReportListResponse(items=items, total=total, page=page, limit=limit, pages=pages)


@router.put("/moderation/reports/{report_id}", response_model=ReportResponse)
async def resolve_report(
    report_id: UUID,
    action_in: ReportActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Action or dismiss a report. Admin / Moderator role required.
    """
    rep = await service.resolve_report(db, report_id, action_in.status, action_in.notes, current_user)
    return ReportResponse(
        id=rep.id,
        reporter_id=rep.reporter_id,
        reporter=rep.reporter,
        target_type=rep.target_type,
        target_id=rep.target_id,
        reason=rep.reason,
        details=rep.details,
        status=rep.status,
        resolved_by=rep.resolved_by,
        resolved_at=rep.resolved_at,
        created_at=rep.created_at,
    )


@router.delete("/moderation/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a report record. Admin / Moderator role required.
    """
    await service.delete_report(db, report_id, current_user)
    return None


@router.post("/moderation/posts/{post_id}/hide", response_model=CommunityPostResponse)
async def hide_post(
    post_id: UUID,
    reason: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Hide a post from public view. Author or Admin/Moderator required.
    """
    return await service.hide_post(db, post_id, current_user, reason=reason)


@router.post("/moderation/posts/{post_id}/restore", response_model=CommunityPostResponse)
async def restore_post(
    post_id: UUID,
    reason: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Restore a hidden post to public view. Admin / Moderator role required.
    """
    return await service.restore_post(db, post_id, current_user, reason=reason)

