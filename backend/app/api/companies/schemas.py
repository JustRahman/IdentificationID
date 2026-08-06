from pydantic import BaseModel


class CompanyCreate(BaseModel):
    legal_name: str
    display_name: str
    country_code: str
    website: str | None = None
    support_email: str | None = None
    logo_url: str | None = None
    description: str | None = None


class CompanyUpdate(BaseModel):
    legal_name: str | None = None
    display_name: str | None = None
    country_code: str | None = None
    website: str | None = None
    support_email: str | None = None
    logo_url: str | None = None
    description: str | None = None


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
    status: str
    admin_note: str | None
    verified_at: str | None

    class Config:
        from_attributes = True
