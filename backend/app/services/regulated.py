"""Regulated product categories: published only after an admin review."""

REGULATED_CATEGORIES = frozenset({
    "medical",
    "pharmaceuticals",
    "food_beverage",
    "toys",
    "baby_children",
    "automotive",
})


def is_regulated(category: str | None) -> bool:
    return (category or "").strip().lower() in REGULATED_CATEGORIES
