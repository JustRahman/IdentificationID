"""Automatic manufacturer trust scoring.

Runs a set of free, zero-effort checks against data the manufacturer already
provides at signup (work email + company website) and produces a trust score.
No action is required from the manufacturer — no DNS records, no paperwork.

Wording matters: a high score means "these automated signals check out",
NOT "we legally vetted this company". Keep the public label modest.
"""

from __future__ import annotations

import asyncio
import re
import socket
import ssl
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

# Free/consumer mail providers — a manufacturer using these can't be
# domain-matched, so they simply score lower (not rejected).
FREE_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com",
    "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com",
    "mail.com", "gmx.com", "gmx.de", "yandex.ru", "mail.ru", "qq.com",
    "163.com", "126.com", "protonmail.com", "proton.me", "zoho.com",
}

# Throwaway / disposable mail domains — a strong negative signal.
DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
    "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
    "sharklasers.com", "getnada.com", "dispostable.com", "maildrop.cc",
    "fakeinbox.com", "tempinbox.com", "mytemp.email", "moakt.com",
}

# Score weights (max 100).
W_EMAIL_DOMAIN_MATCH = 30
W_CORPORATE_EMAIL = 20
W_DOMAIN_AGE = 20
W_SITE_LIVE = 10
W_NAME_MATCH = 10
W_MX = 5
W_SSL = 5

AUTO_VERIFY_THRESHOLD = 70   # >= this → verified automatically
REVIEW_THRESHOLD = 40        # >= this → needs human review; below → rejected

# Public trust levels. Deliberately named so each one states what was actually
# checked — an automated check must never read as a legal vetting.
LEVEL_REGISTERED = "registered"    # signed up, holds a Manufacturer ID
LEVEL_VERIFIED = "verified"        # corporate email + company domain confirmed
LEVEL_BUSINESS = "business"        # legal entity confirmed (manual/paid, later)

LEVEL_LABELS = {
    LEVEL_REGISTERED: "Registered Manufacturer",
    LEVEL_VERIFIED: "Verified Manufacturer",
    LEVEL_BUSINESS: "Business Verified",
}


def level_for(score: Optional[int], checks: Optional[dict]) -> str:
    """Map automated results to a public trust level.

    'Verified Manufacturer' requires the two checks we can genuinely stand
    behind: a corporate email on a domain that matches the company website.
    """
    checks = checks or {}
    if (
        (score or 0) >= AUTO_VERIFY_THRESHOLD
        and checks.get("corporate_email")
        and checks.get("email_domain_matches_website")
    ):
        return LEVEL_VERIFIED
    return LEVEL_REGISTERED


def verified_attributes(checks: Optional[dict]) -> list[str]:
    """Human-readable list of what was actually confirmed."""
    checks = checks or {}
    out: list[str] = []
    if checks.get("corporate_email"):
        out.append("Corporate email")
    if checks.get("email_domain_matches_website"):
        out.append("Company domain")
    if checks.get("website_live"):
        out.append("Active website")
    if checks.get("company_name_on_website"):
        out.append("Company name on website")
    age = checks.get("domain_age_days")
    if isinstance(age, int) and age >= 365:
        out.append(f"Domain age ({age // 365}+ years)")
    return out


def _domain_from_email(email: str) -> str:
    return email.split("@")[-1].strip().lower() if "@" in email else ""


def _domain_from_url(url: str) -> str:
    if not url:
        return ""
    d = re.sub(r"^https?://", "", url.strip().lower())
    d = d.split("/")[0].split(":")[0]
    return d[4:] if d.startswith("www.") else d


def _normalize(text: str) -> str:
    """Lowercase alphanumerics only — for fuzzy company-name matching."""
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


async def _check_mx(domain: str) -> bool:
    """Domain has mail servers → it's a real, mail-receiving domain."""
    if not domain:
        return False
    try:
        import dns.resolver

        def _q():
            resolver = dns.resolver.Resolver()
            resolver.lifetime = 5.0
            return resolver.resolve(domain, "MX")

        answers = await asyncio.to_thread(_q)
        return len(answers) > 0
    except Exception:
        return False


async def _check_ssl_and_age(domain: str) -> tuple[bool, Optional[int]]:
    """Valid TLS cert? Also returns cert age in days as a weak domain-age proxy."""
    if not domain:
        return False, None

    def _probe():
        ctx = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=6) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                return ssock.getpeercert()

    try:
        cert = await asyncio.to_thread(_probe)
        if not cert:
            return False, None
        age_days = None
        not_before = cert.get("notBefore")
        if not_before:
            try:
                issued = datetime.strptime(not_before, "%b %d %H:%M:%S %Y %Z").replace(
                    tzinfo=timezone.utc
                )
                age_days = (datetime.now(timezone.utc) - issued).days
            except Exception:
                pass
        return True, age_days
    except Exception:
        return False, None


async def _check_domain_age(domain: str) -> Optional[int]:
    """Domain age in days via RDAP (free, official registry protocol)."""
    if not domain:
        return None
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(f"https://rdap.org/domain/{domain}")
            if resp.status_code != 200:
                return None
            for event in resp.json().get("events", []):
                if event.get("eventAction") == "registration":
                    raw = event.get("eventDate", "").replace("Z", "+00:00")
                    registered = datetime.fromisoformat(raw)
                    if registered.tzinfo is None:
                        registered = registered.replace(tzinfo=timezone.utc)
                    return (datetime.now(timezone.utc) - registered).days
    except Exception:
        pass
    return None


async def _check_site(domain: str, company_name: str) -> tuple[bool, bool]:
    """(site_live, company_name_appears_on_site)."""
    if not domain:
        return False, False
    try:
        async with httpx.AsyncClient(
            timeout=10.0, follow_redirects=True, headers={"User-Agent": "IdentificationID-Verifier/1.0"}
        ) as client:
            resp = await client.get(f"https://{domain}")
            if resp.status_code >= 400:
                return False, False
            body = _normalize(resp.text[:200_000])
            name = _normalize(company_name)
            # Match on the distinctive part of the name (ignore short/common words).
            matched = bool(name) and (name in body or any(
                len(tok) >= 4 and _normalize(tok) in body
                for tok in re.split(r"\s+", company_name or "")
            ))
            return True, matched
    except Exception:
        return False, False


async def evaluate_company(
    *,
    company_name: str,
    website: Optional[str],
    contact_email: Optional[str],
) -> dict[str, Any]:
    """Run every free check and return a trust score + per-check breakdown."""
    email = (contact_email or "").strip().lower()
    email_domain = _domain_from_email(email)
    site_domain = _domain_from_url(website or "")

    is_disposable = email_domain in DISPOSABLE_EMAIL_DOMAINS
    is_free_provider = email_domain in FREE_EMAIL_DOMAINS
    domain_match = bool(email_domain) and bool(site_domain) and email_domain == site_domain

    # Run network checks concurrently.
    mx_ok, (ssl_ok, cert_age), rdap_age, (site_live, name_match) = await asyncio.gather(
        _check_mx(site_domain or email_domain),
        _check_ssl_and_age(site_domain),
        _check_domain_age(site_domain),
        _check_site(site_domain, company_name),
    )

    # Prefer RDAP age; fall back to certificate age.
    age_days = rdap_age if rdap_age is not None else cert_age

    score = 0
    if domain_match:
        score += W_EMAIL_DOMAIN_MATCH
    if email_domain and not is_free_provider and not is_disposable:
        score += W_CORPORATE_EMAIL
    if age_days is not None:
        if age_days >= 730:      # 2+ years
            score += W_DOMAIN_AGE
        elif age_days >= 365:
            score += int(W_DOMAIN_AGE * 0.6)
        elif age_days >= 90:
            score += int(W_DOMAIN_AGE * 0.3)
    if site_live:
        score += W_SITE_LIVE
    if name_match:
        score += W_NAME_MATCH
    if mx_ok:
        score += W_MX
    if ssl_ok:
        score += W_SSL

    if is_disposable:
        score = 0  # hard fail — throwaway email

    score = max(0, min(100, score))

    if score >= AUTO_VERIFY_THRESHOLD:
        status = "verified"
    elif score >= REVIEW_THRESHOLD:
        status = "review"
    else:
        status = "unverified"

    return {
        "score": score,
        "status": status,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "checks": {
            "email_domain_matches_website": domain_match,
            "corporate_email": bool(email_domain) and not is_free_provider and not is_disposable,
            "disposable_email": is_disposable,
            "domain_age_days": age_days,
            "website_live": site_live,
            "company_name_on_website": name_match,
            "mx_records": mx_ok,
            "valid_ssl": ssl_ok,
        },
    }
