"""Webhook delivery.

When a subscribed event happens, we POST a signed JSON payload to each of the
company's active webhook endpoints. Delivery is best-effort and fire-and-forget
(no retry queue in this version) so it never blocks or fails the main request.
"""

import asyncio
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.webhook_endpoint import WebhookEndpoint

logger = logging.getLogger("webhooks")

TIMEOUT = 8.0


async def _deliver(url: str, secret: str, body: str) -> None:
    signature = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            await client.post(
                url,
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-IID-Signature": f"sha256={signature}",
                    "User-Agent": "IdentificationID-Webhooks/1",
                },
            )
    except Exception as e:  # never let a bad endpoint affect anything
        logger.info("webhook delivery to %s failed: %s", url, e)


async def dispatch_event(
    db: AsyncSession,
    company_id: uuid.UUID,
    event: str,
    data: dict,
) -> None:
    """Find matching active endpoints and fire signed deliveries in the background."""
    result = await db.execute(
        select(WebhookEndpoint).where(
            WebhookEndpoint.company_id == company_id,
            WebhookEndpoint.is_active == True,  # noqa: E712
        )
    )
    endpoints = [e for e in result.scalars().all() if event in (e.events or [])]
    if not endpoints:
        return

    body = json.dumps(
        {
            "event": event,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
    )
    for e in endpoints:
        asyncio.create_task(_deliver(e.url, e.secret, body))
