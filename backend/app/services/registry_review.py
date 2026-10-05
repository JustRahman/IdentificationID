"""Registry review: records with a report marked "under review" are publicly
flagged and locked for editing until the review is resolved, instead of being
deleted (IP & Trademark Complaint Policy)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.content_report import ContentReport, ReportStatus


async def is_under_review(target_type: str, target_id: str | None, db: AsyncSession) -> bool:
    if not target_id:
        return False
    result = await db.execute(
        select(ContentReport.id).where(
            ContentReport.target_type == target_type,
            ContentReport.target_id == target_id.upper(),
            ContentReport.status == ReportStatus.under_review,
        ).limit(1)
    )
    return result.first() is not None


async def require_not_under_review(target_type: str, target_id: str | None, db: AsyncSession) -> None:
    if await is_under_review(target_type, target_id, db):
        raise AppException(
            "UNDER_REVIEW",
            "This record is under registry review after a report, so it can't be edited right now. "
            "We will contact you by email. Questions: legal@identificationid.com",
            423,
        )
