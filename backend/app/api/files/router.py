"""Serve files kept in the database (product images, PDF documents)."""

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.exceptions import NotFound
from app.models.stored_file import StoredFile

router = APIRouter(prefix="/files", tags=["files"])

SAFE_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


@router.get("/{file_key:path}")
async def get_file(file_key: str, db: AsyncSession = Depends(get_db)):
    f = (await db.execute(select(StoredFile).where(StoredFile.key == file_key))).scalar_one_or_none()
    if not f:
        raise NotFound("File not found")
    ctype = f.content_type if f.content_type in SAFE_TYPES else "application/octet-stream"
    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    }
    if ctype == "application/pdf":
        headers["Content-Disposition"] = "inline"
    return Response(content=f.data, media_type=ctype, headers=headers)
