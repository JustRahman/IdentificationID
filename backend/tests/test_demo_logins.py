"""Seeded demo manufacturers must not be able to log in unless explicitly enabled."""

import hashlib
import uuid

from app.core.config import settings
from app.core.security import hash_password
from app.models import ApiKey, Company, User, UserRole
from app.seed import DEMO_PASSWORD, _sync_demo_logins
from tests.db import requires_db, run

pytestmark = requires_db


async def add_user(db, email):
    user = User(email=email, role=UserRole.manufacturer, is_active=True,
                password_hash=hash_password(DEMO_PASSWORD))
    db.add(user)
    await db.flush()
    company = Company(owner_user_id=user.id, legal_name="X", display_name=f"X-{uuid.uuid4().hex[:6]}",
                      country_code="US")
    db.add(company)
    await db.flush()
    key = ApiKey(company_id=company.id, name="k", key_prefix="iid_live_x",
                 key_hash=hashlib.sha256(uuid.uuid4().bytes).hexdigest())
    db.add(key)
    await db.flush()
    return user, company, key


def test_demo_logins_disabled_by_default(monkeypatch):
    monkeypatch.setattr(settings, "demo_logins_enabled", False)

    async def scenario(db):
        demo, _, demo_key = await add_user(db, "john@acmecorp.com")
        real, _, real_key = await add_user(db, f"real-{uuid.uuid4().hex[:6]}@customer.dev")

        await _sync_demo_logins(db)
        for obj in (demo, demo_key, real, real_key):
            await db.refresh(obj)

        assert demo.password_hash is None and demo.is_active is False
        assert demo_key.is_active is False
        # Real accounts are untouched.
        assert real.is_active and real.password_hash and real_key.is_active

    run(scenario)


def test_demo_logins_can_be_enabled_for_local_dev(monkeypatch):
    monkeypatch.setattr(settings, "demo_logins_enabled", True)

    async def scenario(db):
        demo, _, _ = await add_user(db, "sarah@techvision.io")
        demo.password_hash, demo.is_active = None, False
        await db.flush()

        await _sync_demo_logins(db)

        assert demo.is_active and demo.password_hash

    run(scenario)
