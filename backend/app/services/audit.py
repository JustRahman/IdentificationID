"""Append-only audit trail of changes to products, documents, images and companies."""

import uuid
from datetime import date, datetime
from enum import Enum
from typing import Any, Iterable, Optional

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


def client_ip(request: Optional[Request]) -> Optional[str]:
    """Best-effort client IP. Railway's proxy appends the caller's address last,
    so earlier (client-supplied) X-Forwarded-For entries are ignored."""
    if request is None:
        return None
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()[:64]
    return request.client.host if request.client else None


def _plain(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, uuid.UUID):
        return str(value)
    return value


def snapshot(obj: Any, fields: Iterable[str]) -> dict:
    return {f: _plain(getattr(obj, f, None)) for f in fields}


def diff(old: dict, new: dict) -> tuple[dict, dict]:
    """Only the fields that changed: (old_values, new_values)."""
    changed = [k for k in new if old.get(k) != new.get(k)]
    return {k: old.get(k) for k in changed}, {k: new[k] for k in changed}


async def record(
    db: AsyncSession,
    request: Optional[Request],
    actor_id: Optional[uuid.UUID],
    action: str,
    entity_type: str,
    entity_id: Any,
    old: Optional[dict] = None,
    new: Optional[dict] = None,
) -> None:
    db.add(AuditLog(
        actor_user_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        old_values=old or None,
        new_values=new or None,
        ip_address=client_ip(request),
    ))
