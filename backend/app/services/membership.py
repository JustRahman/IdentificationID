"""Manufacturer Registry Membership — required to publish and manage products.

Membership comes from the Registry Membership itself ($5/mo or $49/yr) or from
a product plan that includes it (Popular, Best Value, Enterprise). The
Manufacturer ID is permanent: a lapsed member is shown publicly as "Inactive"
with a "Last active" month, and can't add or edit products until they renew.
"""

import uuid
from dataclasses import dataclass
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.company import Company
from app.models.subscription import Subscription, SubscriptionStatus

PLANS_WITH_MEMBERSHIP = ("popular", "best_value", "enterprise")

INACTIVE_MESSAGE = (
    "Your Manufacturer Registry Membership is inactive. "
    "Renew it to add or edit products."
)


@dataclass
class Membership:
    active: bool
    included_in_plan: bool  # active through Popular / Best Value / Enterprise
    paid_until: Optional[date]
    last_active: Optional[date]  # set only when inactive after having been a member

    @property
    def ever_active(self) -> bool:
        return self.active or self.last_active is not None


def membership_for(company: Company, sub: Optional[Subscription]) -> Membership:
    today = date.today()

    registry_until = company.registry_paid_until
    registry_ok = bool(company.registry_active) and (
        registry_until is None or registry_until >= today
    )

    plan_until = (
        sub.paid_until if sub and sub.plan in PLANS_WITH_MEMBERSHIP else None
    )
    plan_ok = (
        plan_until is not None
        and sub.status == SubscriptionStatus.active
        and plan_until >= today
    )

    dates = [d for d in (registry_until, plan_until) if d]
    paid_until = max(dates) if dates else None
    active = registry_ok or plan_ok
    return Membership(
        active=active,
        included_in_plan=plan_ok,
        paid_until=paid_until,
        # A cancelled subscription can still carry a future date — cap at today.
        last_active=None if active or not paid_until else min(paid_until, today),
    )


async def get_membership(company: Company, db: AsyncSession) -> Membership:
    result = await db.execute(
        select(Subscription).where(Subscription.company_id == company.id)
    )
    return membership_for(company, result.scalar_one_or_none())


async def require_membership(company_id: uuid.UUID, db: AsyncSession) -> None:
    """Block product changes (not reads, not public pages) without membership."""
    company = await db.get(Company, company_id)
    if company is None or not (await get_membership(company, db)).active:
        raise AppException("MEMBERSHIP_INACTIVE", INACTIVE_MESSAGE, 402)
