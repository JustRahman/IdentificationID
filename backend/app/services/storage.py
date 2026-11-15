"""File storage for product images and PDF documents.

Uses Supabase Storage when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are set.
Otherwise files are kept in Postgres (table stored_files) and served by
GET /api/v1/files/{key}. Database storage needs no extra service or secret.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.stored_file import StoredFile


def supabase_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_role_key)


def is_configured() -> bool:
    """Storage is always available: Supabase if configured, else the database."""
    return True


def _get_supabase():
    from supabase import create_client

    if not supabase_configured():
        raise RuntimeError("Supabase is not configured")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def db_file_url(file_key: str) -> str:
    return f"{settings.public_api_url.rstrip('/')}/api/v1/files/{file_key}"


async def save_file(db: AsyncSession, file_key: str, content: bytes, content_type: str) -> str:
    """Store a file and return a long-lived URL for it."""
    if supabase_configured():
        sb = _get_supabase()
        bucket = settings.supabase_storage_bucket
        sb.storage.from_(bucket).upload(
            path=file_key, file=content,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        res = sb.storage.from_(bucket).create_signed_url(file_key, 315360000)
        return res["signedURL"]

    existing = (await db.execute(select(StoredFile).where(StoredFile.key == file_key))).scalar_one_or_none()
    if existing:
        existing.data, existing.content_type, existing.size_bytes = content, content_type, len(content)
    else:
        db.add(StoredFile(key=file_key, content_type=content_type, size_bytes=len(content), data=content))
    await db.flush()
    return db_file_url(file_key)


def get_signed_url(file_key: str, expires_in: int = 3600) -> str:
    """Download URL for a stored file."""
    if supabase_configured():
        sb = _get_supabase()
        res = sb.storage.from_(settings.supabase_storage_bucket).create_signed_url(file_key, expires_in)
        return res["signedURL"]
    return db_file_url(file_key)
