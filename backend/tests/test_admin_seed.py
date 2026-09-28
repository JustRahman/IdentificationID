"""The admin login must never use a hardcoded or leaked password."""

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models import User, UserRole
from app.seed import ADMIN_EMAIL, LEAKED_ADMIN_PASSWORDS, _sync_admin
from tests.db import requires_db, run

pytestmark = requires_db

STRONG = "correct-horse-battery-staple-42"


async def get_admin(db):
    result = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
    return result.scalar_one_or_none()


async def add_admin(db, password):
    admin = User(email=ADMIN_EMAIL, role=UserRole.admin, is_active=True,
                 password_hash=hash_password(password))
    db.add(admin)
    await db.flush()
    return admin


def test_admin_with_leaked_password_is_disabled(monkeypatch):
    monkeypatch.setattr(settings, "admin_password", "")

    async def scenario(db):
        admin = await add_admin(db, LEAKED_ADMIN_PASSWORDS[0])
        await _sync_admin(db)
        assert admin.password_hash is None and admin.is_active is False

    run(scenario)


def test_no_admin_password_means_no_admin_created(monkeypatch):
    monkeypatch.setattr(settings, "admin_password", "")

    async def scenario(db):
        await _sync_admin(db)
        assert await get_admin(db) is None

    run(scenario)


def test_admin_with_other_password_left_alone_when_unset(monkeypatch):
    monkeypatch.setattr(settings, "admin_password", "")

    async def scenario(db):
        admin = await add_admin(db, "some-private-password-99")
        await _sync_admin(db)
        assert admin.is_active and verify_password("some-private-password-99", admin.password_hash)

    run(scenario)


def test_admin_password_from_env_creates_admin(monkeypatch):
    monkeypatch.setattr(settings, "admin_password", STRONG)

    async def scenario(db):
        await _sync_admin(db)
        admin = await get_admin(db)
        assert admin.role == UserRole.admin and admin.is_active
        assert verify_password(STRONG, admin.password_hash)

    run(scenario)


def test_admin_password_from_env_replaces_leaked_one(monkeypatch):
    monkeypatch.setattr(settings, "admin_password", STRONG)

    async def scenario(db):
        admin = await add_admin(db, LEAKED_ADMIN_PASSWORDS[0])
        await _sync_admin(db)
        assert admin.is_active
        assert verify_password(STRONG, admin.password_hash)
        assert not verify_password(LEAKED_ADMIN_PASSWORDS[0], admin.password_hash)

    run(scenario)


def test_weak_or_leaked_admin_password_is_ignored(monkeypatch):
    async def scenario(db):
        for weak in ("short", LEAKED_ADMIN_PASSWORDS[0]):
            monkeypatch.setattr(settings, "admin_password", weak)
            await _sync_admin(db)
            assert await get_admin(db) is None

    run(scenario)
