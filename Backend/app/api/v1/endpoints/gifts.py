from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.schemas.gift import (
    GiftItemResponse,
    GiftItemCreate,
    GiftItemUpdate,
    GiftItemListResponse,
    GiftCategoryResponse,
    GiftTagResponse,
    CandidateMatchItemResponse,
)
from app.services.gift_service import GiftService

router = APIRouter()
gift_service = GiftService()


@router.get("/gifts", response_model=GiftItemListResponse)
async def get_gifts(
    category: Optional[str] = Query(None, description="Category slug"),
    tag: Optional[str] = Query(None, description="Tag slug"),
    q: Optional[str] = Query(None, description="Search query term"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    is_handmade: Optional[bool] = Query(None),
    gift_type: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("trending", description="trending | price_asc | price_desc | rating | newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Query paginated gift catalog with multi-attribute filtering, category/tag parameters, and keyword search.
    """
    skip = (page - 1) * limit
    items, total = await gift_service.get_gifts_filtered(
        db,
        category_slug=category,
        tag_slug=tag,
        search_query=q,
        min_price=min_price,
        max_price=max_price,
        is_handmade=is_handmade,
        gift_type=gift_type,
        sort_by=sort_by,
        skip=skip,
        limit=limit,
    )
    return GiftItemListResponse(total=total, page=page, limit=limit, items=items)


@router.get("/gifts/{id}", response_model=GiftItemResponse)
async def get_gift_by_id(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch gift details by ID.
    """
    gift = await gift_service.get_gift_by_id(db, gift_id=id)
    return gift


@router.post("/gifts", response_model=GiftItemResponse, status_code=status.HTTP_201_CREATED)
async def create_gift(
    gift_in: GiftItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new gift catalog item.
    """
    gift = await gift_service.create_gift(db, gift_in=gift_in)
    return gift


@router.put("/gifts/{id}", response_model=GiftItemResponse)
async def update_gift(
    id: UUID,
    gift_in: GiftItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an existing gift item.
    """
    gift = await gift_service.update_gift(db, gift_id=id, gift_in=gift_in)
    return gift


@router.delete("/gifts/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a gift catalog item.
    """
    await gift_service.delete_gift(db, gift_id=id)
    return None


@router.get("/categories", response_model=List[GiftCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    """
    List all catalog categories.
    """
    return await gift_service.get_categories(db)


@router.get("/tags", response_model=List[GiftTagResponse])
async def get_tags(
    db: AsyncSession = Depends(get_db),
):
    """
    List all gift tags.
    """
    return await gift_service.get_tags(db)


@router.get("/trending", response_model=List[GiftItemResponse])
async def get_trending_gifts(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    List top trending gifts by popularity score and rating.
    """
    return await gift_service.get_trending_gifts(db, limit=limit)


@router.get("/featured", response_model=List[GiftItemResponse])
async def get_featured_gifts(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    List verified featured top pick gifts.
    """
    return await gift_service.get_featured_gifts(db, limit=limit)


@router.get("/recommendation-candidates", response_model=List[CandidateMatchItemResponse])
async def get_recommendation_candidates(
    survey_id: UUID = Query(..., description="ID of survey to match candidates against"),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """
    Recommendation Intelligence API: Computes weighted match score (0-100) for catalog items against survey psychometrics.
    """
    candidates = await gift_service.get_recommendation_candidates(
        db, survey_id=survey_id, limit=limit
    )
    return candidates
