"""Cached UI translation endpoint.

Translates short UI strings into a target language using the free MyMemory
API, caching every result in the database so each unique phrase is fetched
from the external API at most once — not once per visitor.
"""

import asyncio
import hashlib

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.ui_translation import UiTranslation

router = APIRouter(prefix="/translate", tags=["translate"])

# A contact email raises the free MyMemory quota to ~50k words/day at no cost.
CONTACT_EMAIL = "support@identificationid.com"
MYMEMORY = "https://api.mymemory.translated.net/get"
MAX_TEXTS = 300          # per request
MAX_CHARS = 480          # MyMemory per-request char limit
CONCURRENCY = 6          # parallel external calls (only for uncached phrases)


class TranslateRequest(BaseModel):
    texts: list[str] = Field(default_factory=list)
    target: str


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


async def _mymemory(client: httpx.AsyncClient, text: str, target: str) -> str:
    """Translate a single phrase EN -> target; returns source text on failure."""
    chunk = text if len(text) <= MAX_CHARS else text[:MAX_CHARS]
    try:
        resp = await client.get(
            MYMEMORY,
            params={"q": chunk, "langpair": f"en|{target}", "de": CONTACT_EMAIL},
        )
        resp.raise_for_status()
        data = resp.json()
        translated = (data.get("responseData") or {}).get("translatedText")
        status = data.get("responseStatus")
        # MyMemory returns warnings (rate limit, etc.) in translatedText with a
        # non-200 responseStatus — treat those as failures, keep English.
        if translated and str(status) == "200":
            return translated
    except Exception:
        pass
    return text


@router.post("")
async def translate_batch(
    body: TranslateRequest,
    db: AsyncSession = Depends(get_db),
):
    target = (body.target or "en").strip()
    # Deduplicate, drop blanks, cap volume.
    seen: list[str] = []
    for t in body.texts:
        if t and t.strip() and t not in seen:
            seen.append(t)
        if len(seen) >= MAX_TEXTS:
            break

    if target == "en" or not seen:
        return {"success": True, "data": {t: t for t in seen}}

    hashes = {t: _hash(t) for t in seen}

    # 1) Pull whatever is already cached.
    rows = await db.execute(
        select(UiTranslation).where(
            UiTranslation.lang == target,
            UiTranslation.source_hash.in_(list(hashes.values())),
        )
    )
    cached = {r.source_hash: r.translated_text for r in rows.scalars().all()}

    result: dict[str, str] = {}
    missing: list[str] = []
    for t in seen:
        h = hashes[t]
        if h in cached:
            result[t] = cached[h]
        else:
            missing.append(t)

    # 2) Translate only the missing phrases, then cache them.
    if missing:
        sem = asyncio.Semaphore(CONCURRENCY)
        async with httpx.AsyncClient(timeout=12.0) as client:
            async def worker(text: str):
                async with sem:
                    return text, await _mymemory(client, text, target)

            pairs = await asyncio.gather(*(worker(t) for t in missing))

        for text, translated in pairs:
            result[text] = translated
            db.add(UiTranslation(
                source_hash=hashes[text],
                lang=target,
                source_text=text,
                translated_text=translated,
            ))
        await db.commit()

    return {"success": True, "data": result}
