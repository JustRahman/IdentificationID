from pydantic import BaseModel, Field, field_validator


def _clean_website(v: str | None) -> str | None:
    """Only http(s) URLs — blocks javascript:/data: links on public pages."""
    if v is None or not v.strip():
        return None
    v = v.strip()
    if v.lower().startswith(("http://", "https://")):
        return v
    if ":" in v:
        raise ValueError("Website must start with http:// or https://")
    return f"https://{v}"


def _clean_brands(v: list[str] | None) -> list[str] | None:
    if v is None:
        return None
    out: list[str] = []
    for b in v:
        b = b.strip()[:100]
        if b and b not in out:
            out.append(b)
    return out[:20]


class CompanyCreate(BaseModel):
    legal_name: str
    display_name: str
    country_code: str
    website: str | None = None
    support_email: str | None = None
    logo_url: str | None = None
    description: str | None = None
    contact_phone: str | None = Field(None, max_length=50)
    brands: list[str] | None = None

    @field_validator("website")
    @classmethod
    def _website(cls, v: str | None) -> str | None:
        return _clean_website(v)

    @field_validator("brands")
    @classmethod
    def _brands(cls, v: list[str] | None) -> list[str] | None:
        return _clean_brands(v)


class CompanyUpdate(BaseModel):
    legal_name: str | None = None
    display_name: str | None = None
    country_code: str | None = None
    website: str | None = None
    support_email: str | None = None
    logo_url: str | None = None
    description: str | None = None
    contact_phone: str | None = Field(None, max_length=50)
    brands: list[str] | None = None

    @field_validator("website")
    @classmethod
    def _website(cls, v: str | None) -> str | None:
        return _clean_website(v)

    @field_validator("brands")
    @classmethod
    def _brands(cls, v: list[str] | None) -> list[str] | None:
        return _clean_brands(v)


class CompanyResponse(BaseModel):
    id: str
    manufacturer_id: str | None = None
    legal_name: str
    display_name: str
    country_code: str
    website: str | None
    support_email: str | None
    logo_url: str | None = None
    description: str | None = None
    contact_phone: str | None = None
    brands: list[str] = []
    status: str
    admin_note: str | None
    verified_at: str | None
    trust_score: int | None = None
    trust_checks: dict | None = None
    trust_checked_at: str | None = None

    class Config:
        from_attributes = True
