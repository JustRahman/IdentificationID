from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler

from app.api.auth.router import router as auth_router
from app.api.companies.router import router as companies_router
from app.api.products.router import router as products_router
from app.api.documents.router import router as documents_router
from app.api.billing.router import router as billing_router
from app.api.public.router import router as public_router
from app.api.admin.router import router as admin_router
from app.api.images.router import router as images_router
from app.api.translate.router import router as translate_router
from app.api.apikeys.router import router as apikeys_router
from app.api.partner.router import router as partner_router
from app.api.webhooks.router import router as webhooks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup
    from sqlalchemy import text
    from app.core.database import engine
    from app.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Lightweight idempotent migrations for columns added to existing tables
        # (create_all only creates missing tables, not missing columns).
        for stmt in (
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan VARCHAR(32) NOT NULL DEFAULT 'free'",
            "ALTER TABLE companies ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(13)",
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_companies_manufacturer_id ON companies (manufacturer_id)",
        ):
            await conn.execute(text(stmt))

    # Seed mock data
    from app.core.database import AsyncSessionLocal
    from app.seed import seed_data
    async with AsyncSessionLocal() as session:
        await seed_data(session)

    yield


app = FastAPI(
    title="Identification ID API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://identificationid.com",
        "https://www.identificationid.com",
        "https://identificationid.up.railway.app",
        "http://localhost:8888",
        "http://localhost:3000",
    ],
    # Also allow apex/any subdomain of the domain + Railway preview URLs.
    allow_origin_regex=r"https://([a-z0-9-]+\.)?identificationid\.com|https://[a-z0-9-]+\.up\.railway\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)

API_V1 = "/api/v1"
app.include_router(auth_router, prefix=API_V1)
app.include_router(companies_router, prefix=API_V1)
app.include_router(products_router, prefix=API_V1)
app.include_router(documents_router, prefix=API_V1)
app.include_router(billing_router, prefix=API_V1)
app.include_router(public_router, prefix=API_V1)
app.include_router(admin_router, prefix=API_V1)
app.include_router(images_router, prefix=API_V1)
app.include_router(translate_router, prefix=API_V1)
app.include_router(apikeys_router, prefix=API_V1)
app.include_router(webhooks_router, prefix=API_V1)
# Partner (public developer) API — clean short base: /v1/...
app.include_router(partner_router)


@app.get("/health")
async def root_health():
    return {"status": "ok", "service": "identification-id-api"}


# ── Partner API: clean, scoped OpenAPI spec + interactive Swagger UI ──
from fastapi.openapi.docs import get_swagger_ui_html  # noqa: E402
from fastapi.openapi.utils import get_openapi  # noqa: E402
from fastapi.responses import HTMLResponse, JSONResponse  # noqa: E402


@app.get("/v1/openapi.json", include_in_schema=False)
async def partner_openapi():
    schema = get_openapi(
        title="Identification ID Partner API",
        version="1.0",
        description=(
            "Public developer API for Identification ID. "
            "Authenticate every request with your `X-API-Key` header. "
            "Provided by Global Product Identification Inc."
        ),
        routes=partner_router.routes,
    )
    schema["servers"] = [{"url": "https://api.identificationid.com"}]
    return JSONResponse(schema)


@app.get("/v1/docs", include_in_schema=False)
async def partner_docs() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url="/v1/openapi.json",
        title="Identification ID Partner API — Reference",
    )
