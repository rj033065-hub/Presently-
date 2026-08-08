from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.gift import GiftItemResponse
from app.services.gift_service import GiftService

router = APIRouter()
gift_service = GiftService()


@router.get("/search")
async def global_search(
    q: str = Query(..., min_length=1, description="Search query keyword"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Global search endpoint returning catalog matches, category matches, and autocomplete suggestions.
    """
    gifts, total = await gift_service.get_gifts_filtered(
        db, search_query=q, limit=limit
    )

    categories = await gift_service.get_categories(db)
    matched_categories = [
        {"id": str(c.id), "name": c.name, "slug": c.slug}
        for c in categories
        if q.lower() in c.name.lower() or q.lower() in (c.description or "").lower()
    ]

    suggestions = list(set([g.title for g in gifts[:5]] + [c["name"] for c in matched_categories[:3]]))

    return {
        "query": q,
        "total_results": total,
        "suggestions": suggestions,
        "categories": matched_categories,
        "gifts": [GiftItemResponse.model_validate(g) for g in gifts],
    }
