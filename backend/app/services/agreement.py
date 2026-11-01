"""Terms of Service and Manufacturer Agreement: versions and acceptance.

The documents live in the frontend (frontend/src/content/legal/<slug>/<version>.md)
and are published at /legal/<slug>/<version>. Published files never change; to
publish a new version, add a new file, bump the version and hash below (and in
frontend/src/lib/constants.ts). Existing members are then asked to accept again,
and payments wait until they do.
"""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.agreement_acceptance import AgreementAcceptance

AGREEMENT_TYPE = "terms_of_service_and_manufacturer_agreement"
AGREEMENT_VERSION = "1.1"
# SHA-256 of frontend/src/content/legal/terms/1.1.md
AGREEMENT_HASH = "b4838d41cb56f09d7ca7528d1121ab5d874062e93f15f9b3b9a7a5e804921cac"
TERMS_URL = f"https://identificationid.com/legal/terms/{AGREEMENT_VERSION}"

PRIVACY_VERSION = "1.1"
# SHA-256 of frontend/src/content/legal/privacy/1.1.md
PRIVACY_HASH = "d421fa07d336025ff982109ee860f93db0d5dee20470671d65dda7e098b748d4"

CHECKBOX_TEXT_VERSION = "2026-10-05"
CURRENCY = "USD"
PRICES_CENTS = {"monthly": 500, "annual": 4900}


def checkbox_text(company_name: str, billing_period: Optional[str]) -> str:
    """The exact sentence shown next to the box (kept in sync with AgreementCheckbox.tsx)."""
    text = (
        f"I confirm that I am authorized to act on behalf of {company_name} and agree to the "
        f"Identification ID Terms of Service and Manufacturer Agreement (Version {AGREEMENT_VERSION}). "
        f"I acknowledge that I have read the Privacy Policy."
    )
    if billing_period in PRICES_CENTS:
        amount = PRICES_CENTS[billing_period] / 100
        period = "month" if billing_period == "monthly" else "year"
        text += (
            f" I understand that the Manufacturer Registry Membership renews automatically at "
            f"USD ${amount:g} per {period} until cancelled."
        )
    return text


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
            "Please accept the Terms of Service and Manufacturer Agreement before paying.",
            409,
            {"version": AGREEMENT_VERSION},
        )


async def accept(
    *,
    user_id: uuid.UUID,
    user_email: str,
    company_id: Optional[uuid.UUID],
    company_name: Optional[str],
    manufacturer_id: Optional[str],
    authorized_person_name: str,
    billing_period: Optional[str],
    ip_address: Optional[str],
    user_agent: Optional[str],
    db: AsyncSession,
) -> AgreementAcceptance:
    """Write a new, separate acceptance record (one per confirmation)."""
    period = billing_period if billing_period in PRICES_CENTS else None
    row = AgreementAcceptance(
        user_id=user_id,
        company_id=company_id,
        manufacturer_id=manufacturer_id,
        version=AGREEMENT_VERSION,
        agreement_type=AGREEMENT_TYPE,
        document_hash=AGREEMENT_HASH,
        terms_url=TERMS_URL,
        privacy_version=PRIVACY_VERSION,
        privacy_document_hash=PRIVACY_HASH,
        company_name=company_name,
        authorized_person_name=authorized_person_name,
        authorized_person_email=user_email,
        price_presented_cents=PRICES_CENTS.get(period) if period else None,
        currency=CURRENCY if period else None,
        billing_period=period,
        auto_renewal_disclosed=period is not None,
        checkbox_text_version=CHECKBOX_TEXT_VERSION,
        checkbox_text=checkbox_text(company_name or "the Manufacturer", period),
        ip_address=ip_address,
        user_agent=(user_agent or "")[:512] or None,
    )
    db.add(row)
    await db.flush()
    return row


async def link_checkout(user_id: uuid.UUID, checkout_id: str, db: AsyncSession) -> None:
    """Attach the Stripe Checkout Session to the latest acceptance that preceded it."""
    result = await db.execute(
        select(AgreementAcceptance)
        .where(
            AgreementAcceptance.user_id == user_id,
            AgreementAcceptance.version == AGREEMENT_VERSION,
            AgreementAcceptance.checkout_id.is_(None),
        )
        .order_by(AgreementAcceptance.accepted_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row:
        row.checkout_id = checkout_id


async def record_payment_ids(
    checkout_id: str, customer_id: Optional[str], subscription_id: Optional[str], db: AsyncSession
) -> None:
    result = await db.execute(
        select(AgreementAcceptance).where(AgreementAcceptance.checkout_id == checkout_id)
    )
    for row in result.scalars().all():
        if customer_id and not row.payment_provider_customer_id:
            row.payment_provider_customer_id = customer_id
        if subscription_id and not row.payment_provider_subscription_id:
            row.payment_provider_subscription_id = subscription_id
