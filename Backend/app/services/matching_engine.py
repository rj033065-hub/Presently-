from typing import Dict, Any, Tuple, List
from app.models.gift import GiftItem


def calculate_gift_match_score(
    gift: GiftItem, survey_payload: Dict[str, Any]
) -> Tuple[int, str, str]:
    """
    Computes a weighted match score (0-100), strategy label, and reasoning text
    by comparing a GiftItem's attributes against survey psychometrics.
    """
    score = 50.0  # Base score

    budget = survey_payload.get("budget", {"min": 0, "max": 1000})
    min_b = float(budget.get("min", 0))
    max_b = float(budget.get("max", 1000))
    price = float(gift.estimated_price)

    # 1. Price Bounds Alignment (Max 25 pts)
    if min_b <= price <= max_b:
        score += 25.0
    elif price < min_b and price >= min_b * 0.7:
        score += 15.0
    elif price > max_b and price <= max_b * 1.2:
        score += 10.0

    # 2. Interest Alignment (Max 35 pts)
    survey_interests = [i.lower() for i in survey_payload.get("interests", [])]
    suitable_interests = [i.lower() for i in (gift.suitable_interests or [])]
    
    # Check category name overlap
    cat_name = gift.category.name.lower() if gift.category else ""
    if cat_name in survey_interests:
        score += 15.0

    interest_matches = set(survey_interests).intersection(set(suitable_interests))
    if interest_matches:
        score += min(20.0, len(interest_matches) * 10.0)

    # 3. Personality & Lifestyle Alignment (Max 20 pts)
    survey_personality = [p.lower() for p in survey_payload.get("personality", [])]
    suitable_personalities = [p.lower() for p in (gift.suitable_personalities or [])]
    personality_matches = set(survey_personality).intersection(set(suitable_personalities))
    if personality_matches:
        score += min(15.0, len(personality_matches) * 7.5)

    lifestyle = survey_payload.get("lifestyle", {})
    if lifestyle.get("eco_friendly") and ("eco-friendly" in cat_name or gift.is_handmade):
        score += 5.0
    if lifestyle.get("luxury_buyer") and gift.estimated_price >= max_b * 0.7:
        score += 5.0

    # 4. Occasion & Relationship Alignment (Max 20 pts)
    occasion = (survey_payload.get("occasion") or "").lower()
    relationship = (survey_payload.get("relationship") or "").lower()
    suitable_occasions = [o.lower() for o in (gift.suitable_occasions or [])]
    suitable_relationships = [r.lower() for r in (gift.suitable_relationships or [])]

    if occasion in suitable_occasions:
        score += 10.0
    if relationship in suitable_relationships:
        score += 10.0

    final_score = int(min(99.0, max(60.0, score)))

    # Determine strategy label
    strategy_label = "Top Pick"
    if gift.gift_type == "Experience":
        strategy_label = "Experience Gift"
    elif gift.is_handmade:
        strategy_label = "Handmade Idea"
    elif price <= min_b + (max_b - min_b) * 0.3:
        strategy_label = "Best Value"
    elif price >= max_b * 0.75:
        strategy_label = "Luxury Choice"
    elif interest_matches or personality_matches:
        strategy_label = "Most Personalized"

    # Generate explanation
    reasoning_parts = []
    if interest_matches:
        reasoning_parts.append(f"matches interest in {', '.join(interest_matches)}")
    if personality_matches:
        reasoning_parts.append(f"suits {', '.join(personality_matches)} vibe")
    if min_b <= price <= max_b:
        reasoning_parts.append(f"fits target budget range ({price} {gift.currency})")

    reasoning = (
        f"Scored {final_score}/100 because it " + (" and ".join(reasoning_parts) if reasoning_parts else "aligns with recipient psychometrics") + "."
    )

    return final_score, strategy_label, reasoning
