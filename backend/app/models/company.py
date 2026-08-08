from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.payment import Payment
    from app.models.product import Product
    from app.models.subscription import Subscription
    from app.models.user import User


class CompanyStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class Company(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "companies"

    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True
    )
    # Permanent registry identifier (MID-XXXX-XXXX). Never reissued or removed.
    manufacturer_id: Mapped[Optional[str]] = mapped_column(
        String(13), unique=True, index=True, nullable=True
    )
    # Registry Membership: activates the PUBLIC manufacturer profile. The ID
    # itself stays valid forever; lapsing only makes the profile "Inactive".
    registry_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    registry_paid_until: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    legal_name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    support_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Automated trust signals (see services/verification.py). Not a legal check.
    trust_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    trust_checks: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    trust_checked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[CompanyStatus] = mapped_column(
        Enum(CompanyStatus), default=CompanyStatus.pending, nullable=False
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    owner: Mapped[User] = relationship(back_populates="company")
    products: Mapped[list[Product]] = relationship(back_populates="company")
    subscription: Mapped[Optional[Subscription]] = relationship(
        back_populates="company", uselist=False
    )
    payments: Mapped[list[Payment]] = relationship(back_populates="company")
