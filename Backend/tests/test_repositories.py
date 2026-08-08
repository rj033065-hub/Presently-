import pytest
from app.repositories.gift_repository import GiftRepository, GiftCategoryRepository


@pytest.mark.asyncio
async def test_repository_instantiation():
    gift_repo = GiftRepository()
    category_repo = GiftCategoryRepository()
    assert gift_repo.model.__tablename__ == "gift_items"
    assert category_repo.model.__tablename__ == "gift_categories"
