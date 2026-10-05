"""Public "Report incorrect information" for product pages and manufacturer profiles."""

import html
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db
from app.core.exceptions import NotFound, RateLimited, ValidationError
from app.models.company import Company
from app.models.content_report import REASONS_NEEDING_EMAIL, ContentReport, ReportReason
from app.models.product import Product
from app.services.audit import client_ip
from app.services.email import send_email

router = APIRouter(prefix="/public/reports", tags=["reports"])

SUPPORT_EMAIL = "support@identificationid.com"
MAX_REPORTS_PER_HOUR = 5

REASON_LABELS = {
    ReportReason.incorrect_manufacturer_info: "Incorrect manufacturer information",
    ReportReason.unauthorized_profile: "Unauthorized company / brand profile",
    ReportReason.trademark: "Trademark infringement",
    ReportReason.copyright: "Copyright infringement",
    ReportReason.counterfeit: "Counterfeit / suspicious product",
    ReportReason.incorrect_product_info: "Incorrect product information",
    ReportReason.safety_concern: "Safety concern",
    ReportReason.other: "Other",
    ReportReason.incorrect_info: "Incorrect information",
    ReportReason.ip_infringement: "Intellectual property infringement",
    ReportReason.impersonation: "Impersonation",
}


class ReportRequest(BaseModel):
    target_type: str = Field(pattern="^(product|manufacturer)$")
    target_id: str = Field(min_length=3, max_length=32)
    reason: ReportReason
    message: str = Field(min_length=5, max_length=4000)
    evidence: str | None = Field(default=None, max_length=4000)
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None


async def _notify_support(report: ContentReport) -> None:
    e = html.escape
    path = "p" if report.target_type == "product" else "manufacturer"
    link = f"{settings.frontend_url}/{path}/{report.target_id}"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="font-size: 18px;">New report: {e(REASON_LABELS[report.reason])}</h2>
      <p><b>Page:</b> <a href="{e(link)}">{e(report.target_id)}</a> ({e(report.target_type)})</p>
      <p><b>Reporter:</b> {e(report.reporter_name or "name not given")} / {e(report.reporter_email or "email not given")}</p>
      <p style="white-space: pre-wrap;">{e(report.message)}</p>
      <p><b>Evidence:</b></p>
      <p style="white-space: pre-wrap;">{e(report.evidence or "none given")}</p>
    </div>
    """
    await send_email(SUPPORT_EMAIL, f"Report: {report.target_id} - {REASON_LABELS[report.reason]}", body)


@router.post("")
async def create_report(
    body: ReportRequest,
    request: Request,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    if body.reason in REASONS_NEEDING_EMAIL and not body.email:
        raise ValidationError("Please give an email address so we can follow up on this complaint.")
    target_id = body.target_id.strip().upper()
    if body.target_type == "product":
        exists = await db.execute(select(Product.id).where(Product.identification_id == target_id))
    else:
        exists = await db.execute(select(Company.id).where(Company.manufacturer_id == target_id))
    if exists.first() is None:
        raise NotFound("Page not found")

    ip = client_ip(request)
    since = datetime.now(timezone.utc) - timedelta(hours=1)
    recent = await db.execute(
        select(func.count()).select_from(ContentReport).where(
            ContentReport.ip_address == ip, ContentReport.created_at >= since
        )
    )
    if (recent.scalar() or 0) >= MAX_REPORTS_PER_HOUR:
        raise RateLimited("Too many reports. Please try again later.")

    report = ContentReport(
        target_type=body.target_type,
        target_id=target_id,
        reason=body.reason,
        message=body.message.strip(),
        reporter_email=body.email,
        reporter_name=(body.name or "").strip() or None,
        evidence=(body.evidence or "").strip() or None,
        ip_address=ip,
    )
    db.add(report)
    await db.flush()
    background.add_task(_notify_support, report)
    return {"success": True, "data": {"id": str(report.id)}}
