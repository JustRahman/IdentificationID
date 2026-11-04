"""Manufacturer ID (MID) issuance.

A MID is issued only once the Manufacturer Registry Membership is paid (or a
plan that includes it is active), never at sign-up. Once issued it is
permanent and never reassigned.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.models.company import Company
from app.services import indexnow
from app.services.id_generator import generate_manufacturer_id


async def unique_manufacturer_id(db: AsyncSession) -> str:
    """Generate a MID that isn't already taken."""
    for _ in range(10):
        mid = generate_manufacturer_id()
        existing = await db.execute(select(Company.id).where(Company.manufacturer_id == mid))
        if existing.first() is None:
            return mid
    raise ValidationError("Failed to generate a unique Manufacturer ID, try again")


async def ensure_manufacturer_id(company: Company, db: AsyncSession) -> str:
    """Issue the company's permanent MID if it doesn't have one yet."""
    if not company.manufacturer_id:
        company.manufacturer_id = await unique_manufacturer_id(db)
        await db.flush()
        indexnow.notify_manufacturer(company.manufacturer_id)
    return company.manufacturer_id
