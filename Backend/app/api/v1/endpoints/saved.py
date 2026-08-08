from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.community import SavedPost, CommunityPost
from app.schemas.dashboard import SavedItemResponse

router = APIRouter()


@router.get("", response_model=List[SavedItemResponse])
async def list_saved_items(
    type: Optional[str] = Query(None, pattern="^(post|collection|gift)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_items = []

    # If type is None or 'post', fetch saved community posts
    if type is None or type == "post":
        result = await db.execute(
            select(SavedPost)
            .options(selectinload(SavedPost.post))
            .where(SavedPost.user_id == current_user.id)
            .order_by(SavedPost.created_at.desc())
        )
        saved_posts = result.scalars().all()
        for sp in saved_posts:
            post = sp.post
            if post and not post.deleted_at:
                saved_items.append(
                    SavedItemResponse(
                        id=post.id,
                        item_type="post",
                        title=post.title,
                        subtitle=post.excerpt or f"By Community Author",
                        image_url=post.cover_image_url,
                        target_url=f"/community/posts/{post.slug}",
                        created_at=sp.created_at,
                        metadata_json={
                            "likes_count": post.likes_count,
                            "comments_count": post.comments_count,
                            "reading_time": post.reading_time
                        }
                    )
                )

    return saved_items
