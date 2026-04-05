"""Email service using SMTP (works with Gmail, Supabase SMTP relay, etc.)"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


async def send_email(to: str, subject: str, html: str) -> bool:
    """Send an email. Returns True on success, False if SMTP not configured."""
    if not is_configured():
        logger.warning("SMTP not configured — skipping email to %s", to)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.from_email
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)
        return False


async def send_verification_email(to: str, token: str) -> bool:
    verify_url = f"{settings.frontend_url}/verify?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #64748b; margin-bottom: 24px;">
        Click the button below to verify your email address and activate your Identification ID account.
      </p>
      <a href="{verify_url}"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
        Verify Email
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        This link expires in 24 hours. If you did not create an account, ignore this email.
      </p>
    </div>
    """
    return await send_email(to, "Verify your Identification ID account", html)


async def send_welcome_email(to: str) -> bool:
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Welcome to Identification ID</h2>
      <p style="color: #64748b; margin-bottom: 24px;">
        Your account is ready. Here's how to get started:
      </p>
      <ol style="color: #374151; font-size: 14px; line-height: 1.8;">
        <li>Create your company profile</li>
        <li>Submit it for verification</li>
        <li>Once verified, add your products</li>
        <li>Publish them to get unique IDs</li>
      </ol>
      <a href="{settings.frontend_url}/dashboard"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 24px;">
        Go to Dashboard
      </a>
    </div>
    """
    return await send_email(to, "Welcome to Identification ID", html)
