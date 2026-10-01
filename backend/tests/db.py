"""Disposable-Postgres helper for tests that need a database.

Set TEST_DATABASE_URL (e.g. postgresql+asyncpg://localhost/identification_id_test).
Tables and startup migrations are applied; every test rolls back, nothing is committed.
"""

import asyncio
import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.core.migrations import run_migrations
from app.models import Base

TEST_DB = os.environ.get("TEST_DATABASE_URL")
requires_db = pytest.mark.skipif(not TEST_DB, reason="TEST_DATABASE_URL not set")


def run(scenario):
    async def main():
        engine = create_async_engine(TEST_DB)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await run_migrations(conn)
        async with AsyncSession(engine, expire_on_commit=False) as db:
            try:
                await scenario(db)
            finally:
                await db.rollback()
        await engine.dispose()

    asyncio.run(main())
