from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.exceptions import Forbidden, Unauthorized
from app.core.security import decode_token
from app.models.user import User, UserRole


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise Unauthorized("Invalid authorization header")

    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise Unauthorized("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise Unauthorized("Invalid token payload")

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise Unauthorized("User not found or inactive")

    return user


async def get_current_admin(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != UserRole.admin:
        raise Forbidden("Admin access required")
    return user


async def get_verified_manufacturer(
    user: User = Depends(get_current_user),
) -> User:
    if user.role not in (UserRole.manufacturer, UserRole.admin):
        raise Forbidden("Manufacturer access required")
    return user
