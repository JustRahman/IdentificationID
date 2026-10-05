import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class AgreementAcceptance(Base, UUIDMixin):
    """One acceptance of one version of the Terms of Service and Manufacturer Agreement.

    A new row is written every time the box is ticked and confirmed; rows are
    never edited, except that the Stripe checkout / customer / subscription IDs
    are filled in once the payment that followed the acceptance is known.
    """

    __tablename__ = "agreement_acceptances"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    company_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True
    )
    manufacturer_id: Mapped[Optional[str]] = mapped_column(String(13), nullable=True)  # null: MID not issued yet
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    agreement_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    document_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # SHA-256 of the exact text
    terms_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    privacy_version: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    privacy_document_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    authorized_person_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    authorized_person_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    price_presented_cents: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    billing_period: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)  # monthly | annual | null
    auto_renewal_disclosed: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    checkbox_text_version: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    checkbox_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    checkout_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    payment_provider_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_provider_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )
