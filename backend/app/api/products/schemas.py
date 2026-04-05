from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    category: str
    brand: str | None = None
    model: str | None = None
    country_of_origin: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    brand: str | None = None
    model: str | None = None
    country_of_origin: str | None = None
    status: str | None = None


class ProductResponse(BaseModel):
    id: str
    identification_id: str
    name: str
    category: str
    brand: str | None
    model: str | None
    country_of_origin: str | None
    status: str
    published_at: str | None
    company_id: str

    class Config:
        from_attributes = True


class TranslationCreate(BaseModel):
    lang: str = "en"
    short_description: str | None = None
    full_description: str | None = None
    usage_instructions: str | None = None


class TranslationResponse(BaseModel):
    id: str
    product_id: str
    lang: str
    short_description: str | None
    full_description: str | None
    usage_instructions: str | None

    class Config:
        from_attributes = True
