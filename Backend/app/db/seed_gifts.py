import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import AsyncSessionLocal
from app.models.gift import GiftCategory, GiftTag, GiftItem

logger = logging.getLogger("presently.seed_gifts")

CATEGORIES_DATA = [
    {"name": "Electronics & Tech", "slug": "electronics", "icon_name": "Cpu", "description": "Smart gadgets, audio gear, and desktop tech accessories."},
    {"name": "Books & Literature", "slug": "books", "icon_name": "BookOpen", "description": "Bestsellers, rare collector editions, and reading lights."},
    {"name": "Fashion & Style", "slug": "fashion", "icon_name": "Shirt", "description": "Apparel, leather goods, and wearable accessories."},
    {"name": "Jewelry & Keepsakes", "slug": "jewelry", "icon_name": "Gem", "description": "Personalized necklaces, luxury watches, and rings."},
    {"name": "Beauty & Wellness", "slug": "beauty", "icon_name": "Sparkles", "description": "Skincare sets, spa kits, and aromatherapy diffusers."},
    {"name": "Fitness & Outdoor", "slug": "fitness", "icon_name": "Dumbbell", "description": "Gym accessories, massage guns, and hydration gear."},
    {"name": "Gaming & Esports", "slug": "gaming", "icon_name": "Gamepad2", "description": "Consoles, mechanical keyboards, and gaming headsets."},
    {"name": "Home & Kitchen", "slug": "home", "icon_name": "Home", "description": "Pour-over kettles, decor, and smart home appliances."},
    {"name": "Plants & Gardening", "slug": "plants", "icon_name": "Flower2", "description": "Indoor planters, bonsai kits, and rare botanical plants."},
    {"name": "Experiences & Travel", "slug": "experiences", "icon_name": "Plane", "description": "Concert passes, resort stays, and adventure travel passes."},
    {"name": "Food & Gourmet", "slug": "food", "icon_name": "Utensils", "description": "Artisan chocolates, craft beer boxes, and specialty coffee."},
    {"name": "Custom & Handmade", "slug": "custom", "icon_name": "HeartHandshake", "description": "Handcrafted goods, engraved items, and custom portraits."},
]

TAGS_DATA = ["Romantic", "Luxury", "Funny", "Minimalist", "Tech", "Travel", "Eco-Friendly", "Personalized", "Handmade", "Trending"]

SEED_GIFTS = [
    {
        "title": "Fellow Stagg EKG Electric Gooseneck Kettle",
        "slug": "fellow-stagg-ekg-kettle",
        "brand": "Fellow",
        "category_slug": "home",
        "short_description": "Variable temperature control gooseneck kettle for pour-over coffee lovers.",
        "description": "Precision temperature control pour-over electric kettle with sleek minimalist design, counterbalanced handle, and built-in stopwatch.",
        "estimated_price": 165.00,
        "currency": "USD",
        "affiliate_url": "https://presently.app/out/fellow-kettle",
        "purchase_url": "https://fellowproducts.com/products/stagg-ekg",
        "merchant_name": "Fellow Products",
        "primary_image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
        "is_verified": True,
        "is_handmade": False,
        "gift_type": "Physical",
        "rating_avg": 4.90,
        "rating_count": 128,
        "popularity_score": 98,
        "suitable_interests": ["Cooking", "Technology", "Home"],
        "suitable_personalities": ["Minimalist", "Practical", "Luxury Lover"],
        "suitable_occasions": ["Birthday", "Anniversary", "Christmas", "Wedding"],
        "suitable_relationships": ["Partner", "Friend", "Spouse", "Colleague"],
    },
    {
        "title": "Keychron Q1 Max Wireless Mechanical Keyboard",
        "slug": "keychron-q1-max-keyboard",
        "brand": "Keychron",
        "category_slug": "gaming",
        "short_description": "Full aluminum QMK wireless mechanical keyboard with double-gasket design.",
        "description": "Premium CNC aluminum custom mechanical keyboard with hot-swappable switches, RGB backlighting, and Bluetooth 5.1 multi-device connectivity.",
        "estimated_price": 219.00,
        "currency": "USD",
        "affiliate_url": "https://presently.app/out/keychron-q1",
        "purchase_url": "https://keychron.com",
        "merchant_name": "Keychron",
        "primary_image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        "is_verified": True,
        "is_handmade": False,
        "gift_type": "Physical",
        "rating_avg": 4.85,
        "rating_count": 94,
        "popularity_score": 95,
        "suitable_interests": ["Gaming", "Technology"],
        "suitable_personalities": ["Introvert", "Practical", "Minimalist"],
        "suitable_occasions": ["Birthday", "Graduation", "Congratulations"],
        "suitable_relationships": ["Boyfriend", "Husband", "Friend", "Brother"],
    },
    {
        "title": "Personalized Leather Travel Passport & Wallet Set",
        "slug": "personalized-leather-passport-wallet",
        "brand": "Harber London",
        "category_slug": "custom",
        "short_description": "Full-grain Italian leather passport cover with custom monogram engraving.",
        "description": "Handcrafted full-grain leather travel organizer with RFID blocking protection, passport slot, boarding pass holder, and custom laser engraving.",
        "estimated_price": 75.00,
        "currency": "USD",
        "affiliate_url": "https://presently.app/out/leather-passport",
        "purchase_url": "https://harberlondon.com",
        "merchant_name": "Etsy Artisan",
        "primary_image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
        "is_verified": True,
        "is_handmade": True,
        "gift_type": "Physical",
        "rating_avg": 4.95,
        "rating_count": 210,
        "popularity_score": 92,
        "suitable_interests": ["Travel", "Fashion", "Books"],
        "suitable_personalities": ["Romantic", "Adventurous", "Creative"],
        "suitable_occasions": ["Anniversary", "Valentine's Day", "Birthday", "Graduation"],
        "suitable_relationships": ["Wife", "Husband", "Girlfriend", "Boyfriend"],
    },
    {
        "title": "Theragun Mini 2.0 Massage Gun",
        "slug": "theragun-mini-massage-gun",
        "brand": "Therabody",
        "category_slug": "fitness",
        "short_description": "Compact ultra-portable percussive therapy device.",
        "description": "Pocket-sized deep tissue muscle treatment gun with 3 speed settings, ergonomic grip, and QuietForce technology.",
        "estimated_price": 149.00,
        "currency": "USD",
        "affiliate_url": "https://presently.app/out/theragun-mini",
        "purchase_url": "https://therabody.com",
        "merchant_name": "Therabody",
        "primary_image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
        "is_verified": True,
        "is_handmade": False,
        "gift_type": "Physical",
        "rating_avg": 4.75,
        "rating_count": 340,
        "popularity_score": 90,
        "suitable_interests": ["Fitness", "Sports"],
        "suitable_personalities": ["Practical", "Adventurous", "Extrovert"],
        "suitable_occasions": ["Birthday", "Christmas", "Father's Day"],
        "suitable_relationships": ["Father", "Mother", "Friend", "Brother"],
    },
    {
        "title": "Airbnb Experience Pass & Resort Voucher",
        "slug": "airbnb-experience-pass",
        "brand": "Airbnb",
        "category_slug": "experiences",
        "short_description": "Flexible travel experience pass for weekend getaways and local tours.",
        "description": "Digital experience gift card redeemable for cooking classes, boutique resort stays, guided outdoor tours, and cultural workshops worldwide.",
        "estimated_price": 200.00,
        "currency": "USD",
        "affiliate_url": "https://presently.app/out/airbnb-pass",
        "purchase_url": "https://airbnb.com/giftcards",
        "merchant_name": "Airbnb",
        "primary_image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
        "is_verified": True,
        "is_handmade": False,
        "gift_type": "Experience",
        "rating_avg": 4.90,
        "rating_count": 520,
        "popularity_score": 96,
        "suitable_interests": ["Travel", "Cooking", "Photography"],
        "suitable_personalities": ["Adventurous", "Romantic", "Creative"],
        "suitable_occasions": ["Wedding", "Anniversary", "Graduation"],
        "suitable_relationships": ["Wife", "Husband", "Friend", "Colleague"],
    },
]


async def seed_catalog(db: AsyncSession):
    # Seed Categories
    cat_map = {}
    for cat_data in CATEGORIES_DATA:
        result = await db.execute(select(GiftCategory).where(GiftCategory.slug == cat_data["slug"]))
        cat = result.scalars().first()
        if not cat:
            cat = GiftCategory(**cat_data)
            db.add(cat)
            await db.flush()
        cat_map[cat_data["slug"]] = cat

    # Seed Tags
    for tag_name in TAGS_DATA:
        slug = tag_name.lower().replace(" ", "-")
        result = await db.execute(select(GiftTag).where(GiftTag.slug == slug))
        if not result.scalars().first():
            db.add(GiftTag(name=tag_name, slug=slug))

    await db.commit()

    # Seed Gifts
    for gift_data in SEED_GIFTS:
        category_slug = gift_data.pop("category_slug")
        category = cat_map.get(category_slug)
        if not category:
            continue

        result = await db.execute(select(GiftItem).where(GiftItem.slug == gift_data["slug"]))
        if not result.scalars().first():
            gift = GiftItem(**gift_data, category_id=category.id)
            db.add(gift)

    await db.commit()
    logger.info("Successfully seeded gift catalog categories, tags, and initial items!")


if __name__ == "__main__":
    async def main():
        async with AsyncSessionLocal() as session:
            await seed_catalog(session)
    asyncio.run(main())
