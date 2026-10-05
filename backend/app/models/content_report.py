import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ReportReason(str, enum.Enum):
    incorrect_manufacturer_info = "incorrect_manufacturer_info"
    unauthorized_profile = "unauthorized_profile"  # company / brand registered by someone else
    trademark = "trademark"
    copyright = "copyright"
    counterfeit = "counterfeit"  # counterfeit or suspicious product
    incorrect_product_info = "incorrect_product_info"
    safety_concern = "safety_concern"
    other = "other"
    # Older values, kept so existing reports still load.
    incorrect_info = "incorrect_info"
    ip_infringement = "ip_infringement"
    impersonation = "impersonation"


# Reasons that may lead to restricting a record, so we need a way to reply.
REASONS_NEEDING_EMAIL = {
    ReportReason.unauthorized_profile, ReportReason.trademark, ReportReason.copyright,
}


class ReportStatus(str, enum.Enum):
    open = "open"
    under_review = "under_review"  # record publicly marked "Under review", editing locked
    resolved = "resolved"


class ContentReport(Base, UUIDMixin):
    """A public report about a product page or manufacturer profile."""

    __tablename__ = "content_reports"

    target_type: Mapped[str] = mapped_column(String(20), nullable=False)  # product | manufacturer
    target_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # IID or MID
    reason: Mapped[ReportReason] = mapped_column(Enum(ReportReason), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reporter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reporter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # links / description of evidence
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus), default=ReportStatus.open, nullable=False
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
