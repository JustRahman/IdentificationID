"""Manufacturer Agreement versions and acceptance.

Bump AGREEMENT_VERSION when the agreement text changes: existing members are
then asked to accept again, and payments wait until they do.
"""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.agreement_acceptance import AgreementAcceptance

AGREEMENT_VERSION = "2026-10-01"


async def has_accepted(user_id: uuid.UUID, db: AsyncSession, version: str = AGREEMENT_VERSION) -> bool:
    result = await db.execute(
        select(AgreementAcceptance.id).where(
            AgreementAcceptance.user_id == user_id,
            AgreementAcceptance.version == version,
        ).limit(1)
    )
    return result.first() is not None


async def require_agreement(user_id: uuid.UUID, db: AsyncSession) -> None:
    if not await has_accepted(user_id, db):
        raise AppException(
            "AGREEMENT_REQUIRED",
            "Please accept the Manufacturer Agreement and Terms of Service before paying.",
            409,
            {"version": AGREEMENT_VERSION},
        )


async def accept(
    user_id: uuid.UUID,
    company_id: Optional[uuid.UUID],
    ip_address: Optional[str],
    db: AsyncSession,
) -> None:
    if await has_accepted(user_id, db):
        return
    db.add(AgreementAcceptance(
        user_id=user_id,
        company_id=company_id,
        version=AGREEMENT_VERSION,
        ip_address=ip_address,
    ))
    await db.flush()
