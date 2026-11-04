"""Tell Bing (and other IndexNow search engines, which ChatGPT/Copilot search uses)
right away when a public manufacturer or product page appears.

Fire-and-forget: never blocks or fails the request. Disabled when INDEXNOW_KEY
is empty (tests, local dev).
"""

import asyncio
import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("indexnow")

SITE = "https://identificationid.com"
_tasks: set[asyncio.Task] = set()


async def _post(urls: list[str]) -> None:
    key = settings.indexnow_key
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                "https://api.indexnow.org/indexnow",
                json={"host": "identificationid.com", "key": key,
                      "keyLocation": f"{SITE}/{key}.txt", "urlList": urls},
            )
    except Exception as exc:  # network errors must never matter to the user
        logger.info("indexnow ping failed: %s", exc)


def notify(*paths: str) -> None:
    if not settings.indexnow_key:
        return
    urls = [f"{SITE}{p}" for p in paths if p]
    if not urls:
        return
    try:
        task = asyncio.get_running_loop().create_task(_post(urls))
        _tasks.add(task)
        task.add_done_callback(_tasks.discard)
    except RuntimeError:
        pass


def notify_manufacturer(manufacturer_id: str | None) -> None:
    if manufacturer_id:
        notify(f"/manufacturer/{manufacturer_id}", "/sitemap.xml")


def notify_product(identification_id: str | None, manufacturer_id: str | None = None) -> None:
    if identification_id:
        notify(f"/p/{identification_id}", *( [f"/manufacturer/{manufacturer_id}"] if manufacturer_id else []))
