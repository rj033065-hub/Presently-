from typing import TypeVar, List, Dict, Any
from math import ceil
from app.schemas.common import PaginatedResponse

T = TypeVar("T")


def build_paginated_response(
    items: List[T], total: int, page: int, limit: int
) -> PaginatedResponse[T]:
    pages = ceil(total / limit) if limit > 0 else 1
    return PaginatedResponse[T](
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )
