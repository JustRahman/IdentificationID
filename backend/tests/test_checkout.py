"""Both Checkout endpoints must disable Stripe Managed Payments, and Stripe
failures must come back as a clear 502 (not a raw 500).

Stripe is replaced by a fake HTTP client, so this checks exactly what would be
sent over the wire.
"""

import json
from urllib.parse import parse_qsl

import pytest
import stripe

from app.api.billing import router as billing
from app.core.config import settings
from app.models import AgreementAcceptance
from app.services.agreement import AGREEMENT_VERSION
from tests.db import requires_db, run
from tests.test_legal import client_for, make_member

pytestmark = requires_db


class FakeStripe(stripe.HTTPClient):
    name = "fake"

    def __init__(self, fail=False):
        super().__init__()
        self.fail = fail
        self.requests = []

    def request(self, method, url, headers, post_data=None):
        self.requests.append({
            "url": url,
            "version": headers.get("Stripe-Version"),
            "body": dict(parse_qsl(post_data or "")),
        })
        if self.fail:
            error = {"error": {"type": "invalid_request_error", "message": "Product tax code is required"}}
            return json.dumps(error), 400, {}
        session = {"id": "cs_test_1", "object": "checkout.session",
                   "url": "https://checkout.stripe.com/c/pay/cs_test_1"}
        return json.dumps(session), 200, {}

    def close(self):
        pass


@pytest.fixture
def fake_stripe(monkeypatch):
    def install(fail=False):
        fake = FakeStripe(fail)
        monkeypatch.setattr(stripe, "default_http_client", fake)
        monkeypatch.setattr(stripe, "api_key", "sk_test_fake")
        monkeypatch.setattr(settings, "stripe_secret_key", "sk_test_fake")
        monkeypatch.setattr(settings, "stripe_price_registry_monthly", "price_monthly")
        monkeypatch.setattr(settings, "stripe_price_registry_yearly", "price_yearly")
        return fake

    return install


async def accepted_member(db):
    user, company = await make_member(db)
    db.add(AgreementAcceptance(user_id=user.id, company_id=company.id, version=AGREEMENT_VERSION))
    await db.flush()
    return user


def test_both_checkouts_disable_managed_payments(fake_stripe):
    fake = fake_stripe()

    async def scenario(db):
        user = await accepted_member(db)
        async with client_for(db, user) as c:
            r1 = await c.post("/billing/registry/checkout", json={"billing": "monthly"})
            r2 = await c.post("/billing/checkout", json={"plan": "popular"})
        for r in (r1, r2):
            assert r.status_code == 200
            assert r.json()["data"]["checkout_url"] == "https://checkout.stripe.com/c/pay/cs_test_1"

        assert len(fake.requests) == 2
        for req in fake.requests:
            assert req["url"].endswith("/v1/checkout/sessions")
            assert req["body"]["managed_payments[enabled]"] == "false"
            assert req["version"] == billing.CHECKOUT_API_VERSION
        assert fake.requests[0]["body"]["line_items[0][price]"] == "price_monthly"

    run(scenario)


def test_stripe_failure_returns_clear_502(fake_stripe):
    fake_stripe(fail=True)

    async def scenario(db):
        user = await accepted_member(db)
        async with client_for(db, user) as c:
            for path, body in (("/billing/registry/checkout", {"billing": "annual"}),
                               ("/billing/checkout", {"plan": "popular"})):
                r = await c.post(path, json=body)
                assert r.status_code == 502
                assert r.json()["error"]["code"] == "PAYMENT_PROVIDER_ERROR"

    run(scenario)
