"""Public unsubscribe for business outreach emails (CASL: works without login,
takes effect immediately, and the address is never emailed again)."""

import html

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.services.audit import client_ip
from app.services.email import send_email
from app.services.suppression import suppress

router = APIRouter(prefix="/public/unsubscribe", tags=["outreach"])

OUTREACH_INBOX = "hello@identificationid.com"


class UnsubscribeRequest(BaseModel):
    email: EmailStr
    comment: str | None = Field(default=None, max_length=1000)


async def _notify(email: str, comment: str | None) -> None:
    e = html.escape
    await send_email(
        OUTREACH_INBOX,
        f"Unsubscribed: {email}",
        f"<p><b>{e(email)}</b> unsubscribed from Identification ID outreach and was added to the "
        f"do-not-contact list automatically. Do not email this address again.</p>"
        f"<p>Comment: {e(comment or 'none')}</p>",
    )


@router.post("")
async def unsubscribe(
    body: UnsubscribeRequest,
    request: Request,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    _, created = await suppress(
        body.email, "unsubscribe", "link", db,
        note=(body.comment or "").strip() or None,
        ip=client_ip(request), user_agent=request.headers.get("user-agent"),
    )
    if created:
        background.add_task(_notify, str(body.email), body.comment)
    # Same answer either way, so the form can't be used to probe the list.
    return {"success": True, "data": {"unsubscribed": True}}
