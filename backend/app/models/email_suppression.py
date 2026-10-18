from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class EmailSuppression(Base, UUIDMixin):
    """Do-not-contact list for business outreach (CASL).

    One row per email address. Rows are never deleted: an address that
    unsubscribed, bounced or complained must never be emailed again by outreach.
    """

    __tablename__ = "email_suppressions"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)  # lower-case
    reason: Mapped[str] = mapped_column(String(32), nullable=False)  # unsubscribe | bounce | complaint | manual
    source: Mapped[str] = mapped_column(String(32), nullable=False)  # link | reply | admin
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )
