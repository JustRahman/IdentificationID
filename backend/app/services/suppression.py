"""Outreach do-not-contact list. Check is_suppressed() before every outreach email."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_suppression import EmailSuppression


def normalize(email: str) -> str:
    return email.strip().lower()


async def is_suppressed(email: str, db: AsyncSession) -> bool:
    result = await db.execute(select(EmailSuppression.id).where(EmailSuppression.email == normalize(email)))
    return result.first() is not None


async def suppress(
    email: str, reason: str, source: str, db: AsyncSession, *,
    note: Optional[str] = None, ip: Optional[str] = None, user_agent: Optional[str] = None,
) -> tuple[EmailSuppression, bool]:
    """Add an address. Returns (row, created). Existing rows are kept as they are."""
    addr = normalize(email)
    existing = (await db.execute(select(EmailSuppression).where(EmailSuppression.email == addr))).scalar_one_or_none()
    if existing:
        return existing, False
    row = EmailSuppression(email=addr, reason=reason, source=source, note=note, ip_address=ip,
                           user_agent=(user_agent or "")[:512] or None)
    db.add(row)
    await db.flush()
    return row, True
