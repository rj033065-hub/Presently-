from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime, timezone

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.wishlist import Wishlist
from app.repositories.wishlist_repository import WishlistRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.wishlist import (
    WishlistCreate,
    WishlistUpdate,
    WishlistResponse,
    WishlistItemCreate,
    WishlistItemUpdate,
    WishlistItemResponse,
    WishlistShareResponse
)

router = APIRouter()
wishlist_repo = WishlistRepository()
activity_repo = ActivityRepository()


def format_wishlist_response(wishlist: Wishlist) -> WishlistResponse:
    items_response = []
    for item in wishlist.items:
        gift = item.gift_item
        items_response.append(
            WishlistItemResponse(
                id=item.id,
                wishlist_id=item.wishlist_id,
                gift_item_id=item.gift_item_id,
                notes=item.notes,
                priority=item.priority or "medium",
                target_price=item.target_price,
                status=item.status or "considering",
                display_order=item.display_order or 0,
                added_at=item.added_at,
                updated_at=item.updated_at or item.added_at,
                gift_title=gift.title if gift else "Gift Item",
                gift_image_url=gift.images[0].image_url if gift and gift.images else None,
                gift_price=gift.price if gift else None,
                buy_url=gift.buy_url if gift else None
            )
        )
    return WishlistResponse(
        id=wishlist.id,
        user_id=wishlist.user_id,
        name=wishlist.name,
        description=wishlist.description,
        is_public=wishlist.is_public,
        share_token=wishlist.share_token,
        items=items_response,
        created_at=wishlist.created_at,
        updated_at=wishlist.updated_at or wishlist.created_at
    )


@router.get("", response_model=List[WishlistResponse])
async def list_user_wishlists(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlists = await wishlist_repo.get_by_user(db, current_user.id)
    return [format_wishlist_response(w) for w in wishlists]


@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist(
    payload: WishlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = Wishlist(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        is_public=payload.is_public
    )
    wishlist = await wishlist_repo.create(db, wishlist)

    # Log user activity
    await activity_repo.log_activity(
        db,
        user_id=current_user.id,
        activity_type="wishlist_update",
        title=f"Created wishlist '{payload.name}'",
        target_url=f"/wishlist?id={wishlist.id}"
    )

    full_wishlist = await wishlist_repo.get_by_id_and_user(db, wishlist.id, current_user.id)
    return format_wishlist_response(full_wishlist or wishlist)


@router.get("/public/{share_token}", response_model=WishlistResponse)
async def get_public_wishlist(
    share_token: str,
    db: AsyncSession = Depends(get_db)
):
    wishlist = await wishlist_repo.get_by_share_token(db, share_token)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public wishlist not found or sharing disabled."
        )
    return format_wishlist_response(wishlist)


@router.get("/{id}", response_model=WishlistResponse)
async def get_wishlist(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found."
        )
    return format_wishlist_response(wishlist)


@router.put("/{id}", response_model=WishlistResponse)
async def update_wishlist(
    id: UUID,
    payload: WishlistUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found."
        )

    if payload.name is not None:
        wishlist.name = payload.name
    if payload.description is not None:
        wishlist.description = payload.description
    if payload.is_public is not None:
        wishlist.is_public = payload.is_public

    wishlist.updated_at = datetime.now(timezone.utc)
    await db.commit()

    updated = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    return format_wishlist_response(updated)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found."
        )
    await wishlist_repo.delete(db, wishlist)


@router.post("/{id}/items", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_wishlist_item(
    id: UUID,
    payload: WishlistItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found."
        )

    item = await wishlist_repo.add_item(
        db,
        wishlist_id=id,
        gift_item_id=payload.gift_item_id,
        notes=payload.notes,
        priority=payload.priority,
        target_price=payload.target_price,
        status=payload.status
    )

    full_item = await wishlist_repo.get_item_by_id(db, item.id)
    gift = full_item.gift_item if full_item else None

    # Log user activity
    await activity_repo.log_activity(
        db,
        user_id=current_user.id,
        activity_type="saved_gift",
        title=f"Saved gift item to '{wishlist.name}'",
        target_url=f"/wishlist?id={id}"
    )

    return WishlistItemResponse(
        id=item.id,
        wishlist_id=item.wishlist_id,
        gift_item_id=item.gift_item_id,
        notes=item.notes,
        priority=item.priority or "medium",
        target_price=item.target_price,
        status=item.status or "considering",
        display_order=item.display_order or 0,
        added_at=item.added_at,
        updated_at=item.updated_at or item.added_at,
        gift_title=gift.title if gift else "Gift Item",
        gift_image_url=gift.images[0].image_url if gift and gift.images else None,
        gift_price=gift.price if gift else None,
        buy_url=gift.buy_url if gift else None
    )


@router.put("/{id}/items/{item_id}", response_model=WishlistItemResponse)
async def update_wishlist_item(
    id: UUID,
    item_id: UUID,
    payload: WishlistItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found.")

    item = await wishlist_repo.get_item_by_id(db, item_id)
    if not item or item.wishlist_id != id:
        raise HTTPException(status_code=404, detail="Wishlist item not found.")

    if payload.notes is not None:
        item.notes = payload.notes
    if payload.priority is not None:
        item.priority = payload.priority
    if payload.target_price is not None:
        item.target_price = payload.target_price
    if payload.status is not None:
        item.status = payload.status
    if payload.display_order is not None:
        item.display_order = payload.display_order

    item.updated_at = datetime.now(timezone.utc)
    await db.commit()

    updated_item = await wishlist_repo.get_item_by_id(db, item_id)
    gift = updated_item.gift_item if updated_item else None

    return WishlistItemResponse(
        id=item.id,
        wishlist_id=item.wishlist_id,
        gift_item_id=item.gift_item_id,
        notes=item.notes,
        priority=item.priority or "medium",
        target_price=item.target_price,
        status=item.status or "considering",
        display_order=item.display_order or 0,
        added_at=item.added_at,
        updated_at=item.updated_at or item.added_at,
        gift_title=gift.title if gift else "Gift Item",
        gift_image_url=gift.images[0].image_url if gift and gift.images else None,
        gift_price=gift.price if gift else None,
        buy_url=gift.buy_url if gift else None
    )


@router.delete("/{id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_wishlist_item(
    id: UUID,
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found.")

    item = await wishlist_repo.get_item_by_id(db, item_id)
    if not item or item.wishlist_id != id:
        raise HTTPException(status_code=404, detail="Wishlist item not found.")

    await wishlist_repo.delete_item(db, item)


@router.post("/{id}/share", response_model=WishlistShareResponse)
async def generate_wishlist_share_link(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found.")

    wishlist.is_public = True
    token = await wishlist_repo.generate_share_token(db, wishlist)
    share_url = f"/wishlist/share/{token}"

    return WishlistShareResponse(
        share_token=token,
        share_url=share_url,
        is_public=True
    )


@router.delete("/{id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def disable_wishlist_share(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wishlist = await wishlist_repo.get_by_id_and_user(db, id, current_user.id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found.")

    wishlist.is_public = False
    wishlist.share_token = None
    await db.commit()
