"""Product images and PDFs work without Supabase (stored in Postgres)."""

from app.core.config import settings
from tests.db import requires_db, run
from tests.test_legal import client_for, make_member, make_publishable_product

pytestmark = requires_db

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


def test_image_upload_without_supabase(monkeypatch):
    monkeypatch.setattr(settings, "supabase_url", "")
    monkeypatch.setattr(settings, "supabase_service_role_key", "")

    async def scenario(db):
        user, company = await make_member(db)
        product = await make_publishable_product(db, company, "electronics")
        async with client_for(db, user) as c:
            r = await c.post(f"/manufacturer/products/{product.id}/images", files={"file": ("a.png", PNG, "image/png")})
            assert r.status_code == 200, r.text
            url = r.json()["url"]
            assert url.startswith(settings.public_api_url) and "/api/v1/files/images/" in url
            key = url.split("/api/v1/files/", 1)[1]
        async with client_for(db) as anon:
            f = await anon.get(f"/files/{key}")
            assert f.status_code == 200
            assert f.content == PNG
            assert f.headers["content-type"] == "image/png"
            assert f.headers["x-content-type-options"] == "nosniff"
            assert (await anon.get("/files/images/nope.png")).status_code == 404

    run(scenario)


def test_pdf_upload_without_supabase(monkeypatch):
    monkeypatch.setattr(settings, "supabase_url", "")
    monkeypatch.setattr(settings, "supabase_service_role_key", "")

    async def scenario(db):
        user, company = await make_member(db)
        product = await make_publishable_product(db, company, "electronics")
        pdf = b"%PDF-1.4\n%test\n"
        async with client_for(db, user) as c:
            r = await c.post(f"/manufacturer/products/{product.id}/documents",
                             data={"doc_type": "manual", "title": "Manual 2"},
                             files={"file": ("m.pdf", pdf, "application/pdf")})
            assert r.status_code in (200, 201), r.text
            url = r.json()["file_url"]
            key = url.split("/api/v1/files/", 1)[1]
        async with client_for(db) as anon:
            f = await anon.get(f"/files/{key}")
            assert f.status_code == 200 and f.content == pdf

    run(scenario)
