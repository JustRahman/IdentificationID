"""Supabase Storage service for document uploads."""

from supabase import create_client

from app.core.config import settings


def get_supabase():
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase is not configured")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def upload_file(file_key: str, content: bytes, content_type: str = "application/pdf") -> str:
    """Upload file to Supabase Storage. Returns public URL."""
    supabase = get_supabase()
    bucket = settings.supabase_storage_bucket

    supabase.storage.from_(bucket).upload(
        path=file_key,
        file=content,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    # Return signed URL valid for 10 years
    res = supabase.storage.from_(bucket).create_signed_url(file_key, 315360000)
    return res["signedURL"]


def get_signed_url(file_key: str, expires_in: int = 3600) -> str:
    """Get a signed download URL for a file."""
    supabase = get_supabase()
    res = supabase.storage.from_(settings.supabase_storage_bucket).create_signed_url(
        file_key, expires_in
    )
    return res["signedURL"]


def is_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_role_key)
