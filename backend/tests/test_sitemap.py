"""The sitemap endpoint lists public product and manufacturer IDs only."""

from app.models.product import Product, ProductStatus
from tests.db import requires_db, run
from tests.test_legal import client_for, make_member

pytestmark = requires_db


def test_sitemap_lists_published_only():
    async def scenario(db):
        _, company = await make_member(db)
        pub = Product(company_id=company.id, identification_id="IID-SITE-PUB1", name="A", category="electronics",
                      status=ProductStatus.published)
        draft = Product(company_id=company.id, identification_id="IID-SITE-DRF1", name="B", category="electronics")
        db.add_all([pub, draft])
        await db.flush()
        async with client_for(db) as c:
            data = (await c.get("/public/sitemap")).json()["data"]
        ids = {p["id"] for p in data["products"]}
        assert "IID-SITE-PUB1" in ids and "IID-SITE-DRF1" not in ids
        assert company.manufacturer_id in {m["id"] for m in data["manufacturers"]}

    run(scenario)
