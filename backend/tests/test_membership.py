"""Membership rules, SSRF guard and company input validation (no DB needed)."""

import asyncio
from datetime import date, timedelta

import pytest

from app.api.companies.schemas import CompanyCreate
from app.models.company import Company
from app.models.subscription import Subscription, SubscriptionStatus
from app.services.membership import membership_for
from app.services.net_guard import is_public_url

TODAY = date.today()


def company(active=False, until=None):
    return Company(registry_active=active, registry_paid_until=until)


def sub(plan, status=SubscriptionStatus.active, until=TODAY + timedelta(days=365)):
    return Subscription(plan=plan, status=status, paid_until=until)


def test_new_company_is_not_a_member():
    m = membership_for(company(), None)
    assert not m.active and not m.ever_active and m.last_active is None


def test_paid_registry_membership_is_active():
    m = membership_for(company(True, TODAY + timedelta(days=30)), None)
    assert m.active and not m.included_in_plan


def test_expired_registry_membership_lapses_with_last_active():
    ended = TODAY - timedelta(days=40)
    m = membership_for(company(True, ended), None)
    assert not m.active and m.ever_active and m.last_active == ended


@pytest.mark.parametrize("plan", ["popular", "best_value", "enterprise"])
def test_big_plans_include_membership(plan):
    m = membership_for(company(), sub(plan))
    assert m.active and m.included_in_plan


def test_standard_plan_does_not_include_membership():
    assert not membership_for(company(), sub("standard")).active


def test_cancelled_plan_lapses_and_caps_last_active_at_today():
    m = membership_for(company(), sub("popular", SubscriptionStatus.canceled, date(2099, 12, 31)))
    assert not m.active and m.last_active == TODAY


@pytest.mark.parametrize(
    "url, ok",
    [
        ("https://example.com", True),
        ("http://127.0.0.1", False),
        ("http://localhost:8000", False),
        ("http://169.254.169.254/latest/meta-data", False),
        ("http://10.0.0.5", False),
        ("http://[::ffff:127.0.0.1]", False),
        ("ftp://example.com", False),
    ],
)
def test_ssrf_guard(url, ok):
    assert asyncio.run(is_public_url(url)) is ok


@pytest.mark.parametrize(
    "website, expected",
    [("acme.com", "https://acme.com"), ("https://acme.com", "https://acme.com"), ("", None)],
)
def test_website_is_normalized(website, expected):
    c = CompanyCreate(legal_name="A", display_name="A", country_code="US", website=website)
    assert c.website == expected


@pytest.mark.parametrize("website", ["javascript:alert(1)", "data:text/html,x"])
def test_website_rejects_non_http_schemes(website):
    with pytest.raises(ValueError):
        CompanyCreate(legal_name="A", display_name="A", country_code="US", website=website)
