"""Demo (made-up) manufacturers seeded for testing.

They are hidden from every public page, search and API unless
SHOW_DEMO_CONTENT=true (local development), so the public registry never
presents invented companies as real manufacturers.
"""

from sqlalchemy import ColumnElement, true

from app.core.config import settings
from app.models.company import Company

DEMO_COMPANY_NAMES = (
    "ACME Corp", "TechVision", "GreenLeaf", "Nova Tools", "Casa Home", "ZenFit",
)


def public_company_filter() -> ColumnElement[bool]:
    """WHERE clause that hides demo companies (for queries joined to Company)."""
    if settings.show_demo_content:
        return true()
    return Company.display_name.not_in(DEMO_COMPANY_NAMES)


def is_hidden_demo(company: Company | None) -> bool:
    return bool(company) and not settings.show_demo_content and company.display_name in DEMO_COMPANY_NAMES
