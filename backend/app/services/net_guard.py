"""SSRF guard for outbound requests to user-supplied hosts.

Only public internet addresses are allowed — never loopback, private (RFC1918),
link-local (incl. cloud metadata 169.254.169.254), reserved or multicast.
"""

import asyncio
import ipaddress
import socket
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx

MAX_REDIRECTS = 3


def _is_public_ip(ip: str) -> bool:
    addr = ipaddress.ip_address(ip.split("%")[0])
    if isinstance(addr, ipaddress.IPv6Address) and addr.ipv4_mapped:
        addr = addr.ipv4_mapped
    return addr.is_global and not addr.is_multicast


async def resolve_public(host: str) -> Optional[str]:
    """Resolve `host`; return one of its IPs only if ALL of them are public."""
    if not host:
        return None
    try:
        infos = await asyncio.to_thread(socket.getaddrinfo, host, None)
        ips = {info[4][0] for info in infos}
        if ips and all(_is_public_ip(ip) for ip in ips):
            return next(iter(ips))
    except (OSError, ValueError):
        pass
    return None


async def is_public_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    return await resolve_public(parsed.hostname or "") is not None


async def safe_get(client: httpx.AsyncClient, url: str) -> Optional[httpx.Response]:
    """GET that re-checks every redirect hop. None if any hop is not public."""
    for _ in range(MAX_REDIRECTS + 1):
        if not await is_public_url(url):
            return None
        resp = await client.get(url, follow_redirects=False)
        if not resp.is_redirect:
            return resp
        url = urljoin(url, resp.headers.get("location", ""))
    return None
