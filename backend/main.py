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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup
    from app.core.database import engine
    from app.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed admin user if not exists
    from app.core.database import AsyncSessionLocal
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    from sqlalchemy import select
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == "danilbobrow1234@gmail.com")
        )
        if not result.scalar_one_or_none():
            admin = User(
                email="danilbobrow1234@gmail.com",
                password_hash=hash_password("123123123"),
                role=UserRole.admin,
                is_active=True,
            )
            session.add(admin)
            await session.commit()

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
        "http://localhost:8888",
        "http://localhost:3000",
    ],
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


@app.get("/health")
async def root_health():
    return {"status": "ok", "service": "identification-id-api"}
