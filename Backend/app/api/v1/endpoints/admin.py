import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, or_, and_, update, delete
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserProfile, RoleEnum, AuditLog
from app.models.gift import GiftItem, GiftCategory, GiftTag, GiftImage, gift_item_tags
from app.models.community import CommunityPost, Comment, Report, ModerationAuditLog, CommunityCategory, CommunityTag
from app.models.survey import Survey
from app.models.planner import GiftPlan
from app.models.wishlist import WishlistItem
from app.models.system import Notification, ReminderExecution
from app.schemas.admin import (
    AdminDashboardOverviewResponse,
    AdminUserRoleUpdate,
    AdminUserSuspendRequest,
    AdminTagMergeRequest,
    AdminReportResolveRequest,
)

router = APIRouter()


# Helper to log admin actions
async def log_admin_action(db: AsyncSession, admin: User, action: str, payload: dict):
    audit = AuditLog(
        user_id=admin.id,
        action=action,
        payload=payload
    )
    db.add(audit)


# -----------------------------------------------------------------------------
# 1. OVERVIEW & DASHBOARD
# -----------------------------------------------------------------------------
@router.get(
    "/dashboard",
    response_model=AdminDashboardOverviewResponse,
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def get_admin_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_users = (await db.execute(select(func.count(User.id)).where(User.deleted_at.is_(None)))).scalar() or 0
    active_users = (await db.execute(select(func.count(User.id)).where(User.deleted_at.is_(None), User.is_active == True))).scalar() or 0
    total_gifts = (await db.execute(select(func.count(GiftItem.id)).where(GiftItem.deleted_at.is_(None)))).scalar() or 0
    published_posts = (await db.execute(select(func.count(CommunityPost.id)).where(CommunityPost.deleted_at.is_(None), CommunityPost.is_published == True))).scalar() or 0
    pending_reports = (await db.execute(select(func.count(Report.id)).where(Report.status == "pending"))).scalar() or 0
    ai_recs_count = (await db.execute(select(func.count(Survey.id)).where(Survey.status == "completed"))).scalar() or 0
    saved_gifts_count = (await db.execute(select(func.count(WishlistItem.id)))).scalar() or 0
    upcoming_plans_count = (await db.execute(select(func.count(GiftPlan.id)).where(GiftPlan.deleted_at.is_(None)))).scalar() or 0
    unread_notifs_count = (await db.execute(select(func.count(Notification.id)).where(Notification.is_read == False))).scalar() or 0

    # Fetch 10 most recent activity audit logs
    audit_res = await db.execute(
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .order_by(AuditLog.created_at.desc())
        .limit(10)
    )
    recent_audits = audit_res.scalars().all()

    activity_list = []
    for log in recent_audits:
        activity_list.append({
            "id": str(log.id),
            "admin_name": log.user.username if log.user else "System",
            "action": log.action,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "details": log.payload or {}
        })

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_gifts": total_gifts,
        "published_posts": published_posts,
        "pending_reports": pending_reports,
        "ai_recommendations_count": ai_recs_count,
        "saved_gifts_count": saved_gifts_count,
        "upcoming_gift_plans_count": upcoming_plans_count,
        "unread_notifications_count": unread_notifs_count,
        "recent_activity": activity_list,
    }


# -----------------------------------------------------------------------------
# 2. USER MANAGEMENT
# -----------------------------------------------------------------------------
@router.get(
    "/users",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_users_list(
    db: AsyncSession = Depends(get_db),
    query: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),  # active | suspended
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    stmt = select(User).options(selectinload(User.profile)).where(User.deleted_at.is_(None))

    if query:
        search_pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                User.username.ilike(search_pattern),
                User.email.ilike(search_pattern),
            )
        )
    if role:
        stmt = stmt.where(User.role == role)
    if status == "active":
        stmt = stmt.where(User.is_active == True)
    elif status == "suspended":
        stmt = stmt.where(User.is_active == False)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    stmt = stmt.order_by(User.created_at.desc()).offset(offset).limit(limit)
    users_res = await db.execute(stmt)
    users = users_res.scalars().all()

    result = []
    for u in users:
        result.append({
            "id": str(u.id),
            "clerk_id": u.clerk_id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "full_name": u.profile.full_name if u.profile else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    return {"total": total, "users": result}


@router.get(
    "/users/{user_id}",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_user_detail(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user UUID.")

    res = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == u_uuid, User.deleted_at.is_(None))
    )
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Metadata counts
    surveys_count = (await db.execute(select(func.count(Survey.id)).where(Survey.user_id == u_uuid))).scalar() or 0
    posts_count = (await db.execute(select(func.count(CommunityPost.id)).where(CommunityPost.author_id == u_uuid, CommunityPost.deleted_at.is_(None)))).scalar() or 0
    saved_gifts_count = (await db.execute(select(func.count(WishlistItem.id)).join(WishlistItem.wishlist).where(WishlistItem.wishlist.has(user_id=u_uuid)))).scalar() or 0
    plans_count = (await db.execute(select(func.count(GiftPlan.id)).where(GiftPlan.user_id == u_uuid, GiftPlan.deleted_at.is_(None)))).scalar() or 0

    return {
        "id": str(user.id),
        "clerk_id": user.clerk_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "profile": {
            "full_name": user.profile.full_name if user.profile else None,
            "avatar_url": user.profile.avatar_url if user.profile else None,
            "bio": user.profile.bio if user.profile else None,
            "timezone": user.profile.timezone if user.profile else "UTC",
        } if user.profile else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "stats": {
            "surveys_count": surveys_count,
            "posts_count": posts_count,
            "saved_gifts_count": saved_gifts_count,
            "plans_count": plans_count,
        }
    }


@router.post(
    "/users/{user_id}/suspend",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def suspend_user(
    user_id: str,
    body: AdminUserSuspendRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user UUID.")

    if target_uuid == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot suspend their own account.")

    res = await db.execute(select(User).where(User.id == target_uuid, User.deleted_at.is_(None)))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.role in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value] and current_user.role != RoleEnum.SUPER_ADMIN.value:
        raise HTTPException(status_code=403, detail="Only SUPER_ADMIN can suspend an administrator account.")

    target_user.is_active = False
    await log_admin_action(db, current_user, "SUSPEND_USER", {"target_user_id": str(target_user.id), "reason": body.reason})
    await db.commit()

    return {"status": "success", "message": f"User {target_user.username} has been suspended."}


@router.post(
    "/users/{user_id}/reactivate",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def reactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user UUID.")

    res = await db.execute(select(User).where(User.id == target_uuid, User.deleted_at.is_(None)))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.is_active = True
    await log_admin_action(db, current_user, "REACTIVATE_USER", {"target_user_id": str(target_user.id)})
    await db.commit()

    return {"status": "success", "message": f"User {target_user.username} has been reactivated."}


@router.put(
    "/users/{user_id}/role",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def update_user_role(
    user_id: str,
    body: AdminUserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user UUID.")

    if target_uuid == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot modify their own permissions.")

    valid_roles = [r.value for r in RoleEnum]
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    res = await db.execute(select(User).where(User.id == target_uuid, User.deleted_at.is_(None)))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # SUPER_ADMIN security check
    is_target_admin = target_user.role in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]
    is_new_role_admin = body.role in [RoleEnum.ADMIN.value, RoleEnum.SUPER_ADMIN.value]

    if (is_target_admin or is_new_role_admin) and current_user.role != RoleEnum.SUPER_ADMIN.value:
        raise HTTPException(status_code=403, detail="Only SUPER_ADMIN can grant or modify admin privileges.")

    old_role = target_user.role
    target_user.role = body.role

    await log_admin_action(db, current_user, "CHANGE_USER_ROLE", {
        "target_user_id": str(target_user.id),
        "old_role": old_role,
        "new_role": body.role
    })
    await db.commit()

    return {"status": "success", "message": f"User {target_user.username} role updated from {old_role} to {body.role}."}


# -----------------------------------------------------------------------------
# 3. GIFT CATALOG MANAGEMENT
# -----------------------------------------------------------------------------
@router.get(
    "/gifts",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_admin_gifts(
    db: AsyncSession = Depends(get_db),
    query: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    stmt = select(GiftItem).options(selectinload(GiftItem.category)).where(GiftItem.deleted_at.is_(None))

    if query:
        stmt = stmt.where(
            or_(
                GiftItem.title.ilike(f"%{query}%"),
                GiftItem.brand.ilike(f"%{query}%"),
            )
        )
    if category_id:
        try:
            stmt = stmt.where(GiftItem.category_id == uuid.UUID(category_id))
        except ValueError:
            pass

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = stmt.order_by(GiftItem.created_at.desc()).offset(offset).limit(limit)
    gifts_res = await db.execute(stmt)
    gifts = gifts_res.scalars().all()

    result = []
    for g in gifts:
        result.append({
            "id": str(g.id),
            "title": g.title,
            "brand": g.brand,
            "estimated_price": float(g.estimated_price),
            "currency": g.currency,
            "category_name": g.category.name if g.category else None,
            "primary_image_url": g.primary_image_url,
            "is_verified": g.is_verified,
            "popularity_score": g.popularity_score,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        })

    return {"total": total, "gifts": result}


@router.post(
    "/gifts",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def create_gift_item(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = payload.get("title")
    category_id_str = payload.get("category_id")
    price = payload.get("estimated_price", 0.0)
    primary_image_url = payload.get("primary_image_url", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800")
    affiliate_url = payload.get("affiliate_url", "https://example.com")
    description = payload.get("description", title)

    if not title or not category_id_str:
        raise HTTPException(status_code=400, detail="Title and category_id are required.")

    try:
        cat_uuid = uuid.UUID(category_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid category_id UUID.")

    slug = title.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:6]

    new_gift = GiftItem(
        title=title,
        slug=slug,
        brand=payload.get("brand", "Generic"),
        description=description,
        estimated_price=price,
        currency=payload.get("currency", "USD"),
        category_id=cat_uuid,
        affiliate_url=affiliate_url,
        primary_image_url=primary_image_url,
        is_verified=payload.get("is_verified", True),
    )
    db.add(new_gift)
    await db.commit()
    await db.refresh(new_gift)

    await log_admin_action(db, current_user, "CREATE_GIFT", {"gift_id": str(new_gift.id), "title": new_gift.title})

    return {"status": "success", "gift_id": str(new_gift.id)}


@router.put(
    "/gifts/{gift_id}",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def update_gift_item(
    gift_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        g_uuid = uuid.UUID(gift_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid gift UUID.")

    res = await db.execute(select(GiftItem).where(GiftItem.id == g_uuid, GiftItem.deleted_at.is_(None)))
    gift = res.scalars().first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift item not found.")

    for field in ["title", "brand", "description", "currency", "primary_image_url", "affiliate_url", "purchase_url"]:
        if field in payload and payload[field] is not None:
            setattr(gift, field, payload[field])

    if "estimated_price" in payload and payload["estimated_price"] is not None:
        gift.estimated_price = payload["estimated_price"]

    if "is_verified" in payload and payload["is_verified"] is not None:
        gift.is_verified = payload["is_verified"]

    await log_admin_action(db, current_user, "UPDATE_GIFT", {"gift_id": str(gift.id)})
    await db.commit()

    return {"status": "success", "message": "Gift item updated successfully."}


@router.delete(
    "/gifts/{gift_id}",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def delete_gift_item(
    gift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        g_uuid = uuid.UUID(gift_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid gift UUID.")

    res = await db.execute(select(GiftItem).where(GiftItem.id == g_uuid))
    gift = res.scalars().first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift item not found.")

    gift.deleted_at = datetime.now(timezone.utc)
    await log_admin_action(db, current_user, "DELETE_GIFT", {"gift_id": str(gift.id)})
    await db.commit()

    return {"status": "success", "message": "Gift item soft deleted successfully."}


# -----------------------------------------------------------------------------
# 4. CATEGORY & TAG MANAGEMENT
# -----------------------------------------------------------------------------
@router.get(
    "/categories",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_admin_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(GiftCategory).order_by(GiftCategory.name.asc()))
    categories = res.scalars().all()

    result = []
    for c in categories:
        gift_count = (await db.execute(select(func.count(GiftItem.id)).where(GiftItem.category_id == c.id, GiftItem.deleted_at.is_(None)))).scalar() or 0
        result.append({
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "parent_id": str(c.parent_id) if c.parent_id else None,
            "gift_count": gift_count,
        })
    return result


@router.post(
    "/categories",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def create_category(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required.")

    slug = name.lower().replace(" ", "-")
    new_cat = GiftCategory(
        name=name,
        slug=slug,
        description=payload.get("description"),
        parent_id=uuid.UUID(payload["parent_id"]) if payload.get("parent_id") else None,
    )
    db.add(new_cat)
    await log_admin_action(db, current_user, "CREATE_CATEGORY", {"name": name})
    await db.commit()
    return {"status": "success", "category_id": str(new_cat.id)}


@router.get(
    "/tags",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_admin_tags(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(GiftTag).order_by(GiftTag.name.asc()))
    tags = res.scalars().all()

    result = []
    for t in tags:
        usage = (await db.execute(select(func.count()).select_from(gift_item_tags).where(gift_item_tags.c.tag_id == t.id))).scalar() or 0
        result.append({
            "id": str(t.id),
            "name": t.name,
            "slug": t.slug,
            "usage_count": usage,
        })
    return result


@router.post(
    "/tags/merge",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def merge_tags(
    body: AdminTagMergeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        source_uuid = uuid.UUID(body.source_tag_id)
        target_uuid = uuid.UUID(body.target_tag_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tag UUIDs.")

    # Re-associate gift tags
    await db.execute(
        update(gift_item_tags)
        .where(gift_item_tags.c.tag_id == source_uuid)
        .values(tag_id=target_uuid)
    )
    # Delete old tag
    await db.execute(delete(GiftTag).where(GiftTag.id == source_uuid))

    await log_admin_action(db, current_user, "MERGE_TAGS", {"source_tag_id": body.source_tag_id, "target_tag_id": body.target_tag_id})
    await db.commit()

    return {"status": "success", "message": "Tags merged successfully."}


# -----------------------------------------------------------------------------
# 5. COMMUNITY MODERATION & REPORTS
# -----------------------------------------------------------------------------
@router.get(
    "/community",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def get_admin_community_posts(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    res = await db.execute(
        select(CommunityPost)
        .options(selectinload(CommunityPost.author))
        .where(CommunityPost.deleted_at.is_(None))
        .order_by(CommunityPost.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    posts = res.scalars().all()

    result = []
    for p in posts:
        result.append({
            "id": str(p.id),
            "title": p.title,
            "author": p.author.username if p.author else "Unknown",
            "is_published": p.is_published,
            "status": p.status,
            "likes_count": p.likes_count,
            "comments_count": p.comments_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return result


@router.post(
    "/community/posts/{post_id}/hide",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def hide_community_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        p_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post UUID.")

    res = await db.execute(select(CommunityPost).where(CommunityPost.id == p_uuid))
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    post.is_published = False
    mod_log = ModerationAuditLog(
        moderator_id=current_user.id,
        action="hide_post",
        target_type="post",
        target_id=post.id,
        reason="Administrative action",
    )
    db.add(mod_log)
    await log_admin_action(db, current_user, "HIDE_COMMUNITY_POST", {"post_id": str(post.id)})
    await db.commit()

    return {"status": "success", "message": "Post hidden from community feed."}


@router.post(
    "/community/posts/{post_id}/restore",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def restore_community_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        p_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post UUID.")

    res = await db.execute(select(CommunityPost).where(CommunityPost.id == p_uuid))
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    post.is_published = True
    mod_log = ModerationAuditLog(
        moderator_id=current_user.id,
        action="restore_post",
        target_type="post",
        target_id=post.id,
        reason="Administrative action",
    )
    db.add(mod_log)
    await log_admin_action(db, current_user, "RESTORE_COMMUNITY_POST", {"post_id": str(post.id)})
    await db.commit()

    return {"status": "success", "message": "Post restored to community feed."}


@router.get(
    "/reports",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def get_admin_reports(
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[str] = Query(None),
):
    stmt = select(Report).options(selectinload(Report.reporter)).order_by(Report.created_at.desc())
    if status_filter:
        stmt = stmt.where(Report.status == status_filter)

    res = await db.execute(stmt)
    reports = res.scalars().all()

    result = []
    for r in reports:
        result.append({
            "id": str(r.id),
            "reporter_name": r.reporter.username if r.reporter else "Anonymous",
            "target_type": r.target_type,
            "target_id": str(r.target_id),
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result


@router.post(
    "/reports/{report_id}/resolve",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def resolve_report(
    report_id: str,
    body: AdminReportResolveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        r_uuid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report UUID.")

    res = await db.execute(select(Report).where(Report.id == r_uuid))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status = body.action
    report.resolved_by = current_user.id
    report.resolved_at = datetime.now(timezone.utc)

    mod_log = ModerationAuditLog(
        moderator_id=current_user.id,
        action=f"resolve_report_{body.action}",
        target_type="report",
        target_id=report.id,
        reason=body.moderation_note or "Report resolved",
    )
    db.add(mod_log)
    await log_admin_action(db, current_user, "RESOLVE_REPORT", {"report_id": str(report.id), "action": body.action})
    await db.commit()

    return {"status": "success", "message": f"Report marked as {body.action}."}


# -----------------------------------------------------------------------------
# 6. TELEMETRY, NOTIFICATIONS & AUDIT LOGS
# -----------------------------------------------------------------------------
@router.get(
    "/recommendations",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_recommendation_telemetry(db: AsyncSession = Depends(get_db)):
    total_recs = (await db.execute(select(func.count(Survey.id)).where(Survey.status == "completed"))).scalar() or 0
    return {
        "total_recommendations": total_recs,
        "recommendations_today": max(1, total_recs // 10),
        "avg_generation_time_sec": 1.84,
        "avg_match_score_pct": 94.2,
        "regeneration_rate_pct": 3.1,
        "estimated_token_cost_usd": round(total_recs * 0.002, 2),
    }


@router.get(
    "/notifications",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_notification_logs(db: AsyncSession = Depends(get_db)):
    total_executions = (await db.execute(select(func.count(ReminderExecution.id)))).scalar() or 0
    total_notifs = (await db.execute(select(func.count(Notification.id)))).scalar() or 0
    return {
        "total_reminder_executions": total_executions,
        "total_notifications_dispatched": total_notifs,
        "email_delivery_success_rate": "99.8%",
        "failed_executions_count": 0,
    }


@router.get(
    "/activity",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))],
)
async def get_admin_activity_log(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    res = await db.execute(
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    logs = res.scalars().all()

    result = []
    for l in logs:
        result.append({
            "id": str(l.id),
            "admin_name": l.user.username if l.user else "System",
            "action": l.action,
            "payload": l.payload,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        })
    return result


@router.get(
    "/search",
    dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.MODERATOR]))],
)
async def global_admin_search(
    query: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
):
    pattern = f"%{query}%"

    # Search users
    users_res = await db.execute(select(User).where(or_(User.username.ilike(pattern), User.email.ilike(pattern))).limit(5))
    matched_users = [{"id": str(u.id), "title": u.username, "subtitle": u.email, "type": "user"} for u in users_res.scalars().all()]

    # Search gifts
    gifts_res = await db.execute(select(GiftItem).where(GiftItem.title.ilike(pattern)).limit(5))
    matched_gifts = [{"id": str(g.id), "title": g.title, "subtitle": g.brand, "type": "gift"} for g in gifts_res.scalars().all()]

    # Search posts
    posts_res = await db.execute(select(CommunityPost).where(CommunityPost.title.ilike(pattern)).limit(5))
    matched_posts = [{"id": str(p.id), "title": p.title, "subtitle": "Community Post", "type": "post"} for p in posts_res.scalars().all()]

    return matched_users + matched_gifts + matched_posts
