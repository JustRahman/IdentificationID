"""Seed database with mock data for testing."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.company import Company, CompanyStatus
from app.models.product import Product, ProductStatus
from app.models.product_document import ProductDocument, DocType
from app.models.product_translation import ProductTranslation
from app.models.user import User, UserRole
from app.services.id_generator import generate_identification_id


async def seed_data(session: AsyncSession) -> None:
    # Check if mock data already seeded (use a mock user, not admin)
    result = await session.execute(
        select(User).where(User.email == "john@acmecorp.com")
    )
    if result.scalar_one_or_none():
        return  # Already seeded

    now = datetime.now(timezone.utc)

    # ── Users ──
    # Admin may already exist from previous deploy
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
        await session.flush()

    john = User(
        email="john@acmecorp.com",
        password_hash=hash_password("demo12345678"),
        role=UserRole.manufacturer,
        is_active=True,
    )
    sarah = User(
        email="sarah@techvision.io",
        password_hash=hash_password("demo12345678"),
        role=UserRole.manufacturer,
        is_active=True,
    )
    mike = User(
        email="mike@greenleaf.co",
        password_hash=hash_password("demo12345678"),
        role=UserRole.manufacturer,
        is_active=True,
    )
    consumer = User(
        email="consumer@example.com",
        password_hash=hash_password("demo12345678"),
        role=UserRole.consumer,
        is_active=True,
    )
    session.add_all([john, sarah, mike, consumer])
    await session.flush()

    # ── Companies ──
    acme = Company(
        owner_user_id=john.id,
        legal_name="ACME Corporation LLC",
        display_name="ACME Corp",
        country_code="US",
        website="https://acmecorp.com",
        support_email="support@acmecorp.com",
        status=CompanyStatus.verified,
        verified_at=now,
    )
    techvision = Company(
        owner_user_id=sarah.id,
        legal_name="TechVision Industries GmbH",
        display_name="TechVision",
        country_code="DE",
        website="https://techvision.io",
        support_email="help@techvision.io",
        status=CompanyStatus.verified,
        verified_at=now,
    )
    greenleaf = Company(
        owner_user_id=mike.id,
        legal_name="GreenLeaf Manufacturing Ltd",
        display_name="GreenLeaf",
        country_code="GB",
        website="https://greenleaf.co",
        support_email="info@greenleaf.co",
        status=CompanyStatus.pending,
    )
    session.add_all([acme, techvision, greenleaf])
    await session.flush()

    # ── Products ──
    products_data = [
        {
            "company": acme,
            "name": "SmartThermo X1",
            "category": "electronics",
            "brand": "ACME",
            "model": "ST-X1",
            "country": "US",
            "status": ProductStatus.published,
            "short": "Smart thermostat with WiFi connectivity and energy-saving features.",
            "full": (
                "The SmartThermo X1 is a next-generation smart thermostat designed for modern homes. "
                "Features include voice control, learning algorithms that adapt to your schedule, "
                "and real-time energy monitoring via the companion app. Compatible with all major "
                "smart home ecosystems including Alexa, Google Home, and Apple HomeKit."
            ),
            "usage": (
                "1. Mount on wall using included bracket\n"
                "2. Connect to WiFi via the ACME Home app\n"
                "3. Set your preferred temperature schedule\n"
                "4. Enable auto-learning mode for optimal energy savings"
            ),
        },
        {
            "company": acme,
            "name": "PowerDrill Pro 3000",
            "category": "home_appliances",
            "brand": "ACME",
            "model": "PD-3000",
            "country": "US",
            "status": ProductStatus.published,
            "short": "Professional-grade cordless drill with 20V lithium battery.",
            "full": (
                "The PowerDrill Pro 3000 delivers 750 in-lbs of torque with a brushless motor "
                "for maximum efficiency. Includes 2-speed gearbox, LED work light, and quick-charge "
                "20V 4.0Ah battery. Built for contractors and serious DIY enthusiasts."
            ),
            "usage": (
                "1. Charge battery fully before first use (approx 90 min)\n"
                "2. Select speed setting (1 for screwing, 2 for drilling)\n"
                "3. Attach appropriate bit to keyless chuck\n"
                "4. Adjust torque ring for material being drilled"
            ),
        },
        {
            "company": acme,
            "name": "AirPure 500",
            "category": "home_appliances",
            "brand": "ACME",
            "model": "AP-500",
            "country": "CN",
            "status": ProductStatus.draft,
            "short": "HEPA air purifier for rooms up to 500 sq ft.",
            "full": (
                "The AirPure 500 uses a true HEPA H13 filter to capture 99.97% of airborne particles. "
                "Features quiet night mode (24dB), auto-sensing air quality indicator, and filter "
                "replacement alerts. Covers rooms up to 500 sq ft with 5x air changes per hour."
            ),
            "usage": (
                "1. Remove filter packaging before first use\n"
                "2. Place unit on flat surface at least 50cm from walls\n"
                "3. Press power button to start\n"
                "4. Use mode button to cycle through fan speeds"
            ),
        },
        {
            "company": techvision,
            "name": "VisionCam Pro 4K",
            "category": "electronics",
            "brand": "TechVision",
            "model": "VC-4K",
            "country": "DE",
            "status": ProductStatus.published,
            "short": "4K security camera with night vision and two-way audio.",
            "full": (
                "The VisionCam Pro 4K delivers crystal-clear 4K video surveillance with a 130-degree "
                "wide-angle lens. Features include color night vision up to 30m, AI-powered person "
                "detection, and weatherproof IP67 housing. Supports local SD card and cloud storage."
            ),
            "usage": (
                "1. Download TechVision app and create account\n"
                "2. Mount camera using included hardware\n"
                "3. Connect to WiFi via QR code scan\n"
                "4. Configure motion zones and notification preferences"
            ),
        },
        {
            "company": techvision,
            "name": "SmartLock V2",
            "category": "electronics",
            "brand": "TechVision",
            "model": "SL-V2",
            "country": "DE",
            "status": ProductStatus.published,
            "short": "Biometric smart lock with fingerprint and app control.",
            "full": (
                "The SmartLock V2 supports fingerprint, PIN code, NFC card, and smartphone unlocking. "
                "Stores up to 100 fingerprints. Features auto-lock timer, tamper alarm, and battery "
                "life of 12 months on 4xAA batteries. Works with TechVision smart home ecosystem."
            ),
            "usage": (
                "1. Install lock following the included mounting guide\n"
                "2. Set master admin fingerprint during first setup\n"
                "3. Add additional users via the TechVision app\n"
                "4. Test all unlock methods before closing door"
            ),
        },
        {
            "company": techvision,
            "name": "SolarPanel Mini 100W",
            "category": "electronics",
            "brand": "TechVision",
            "model": "SP-M100",
            "country": "CN",
            "status": ProductStatus.draft,
            "short": "Portable 100W solar panel for outdoor charging.",
            "full": (
                "Foldable monocrystalline solar panel with 23% conversion efficiency. USB-C PD (60W) "
                "and USB-A (18W) outputs. Weighs only 4.5kg with carrying case. IPX4 splash resistant."
            ),
            "usage": (
                "1. Unfold panel and position toward direct sunlight\n"
                "2. Connect device via USB-C or USB-A port\n"
                "3. LED indicator shows charging status\n"
                "4. Fold and store in carrying case after use"
            ),
        },
        {
            "company": greenleaf,
            "name": "EcoBottle 750",
            "category": "other",
            "brand": "GreenLeaf",
            "model": "EB-750",
            "country": "GB",
            "status": ProductStatus.draft,
            "short": "Insulated stainless steel water bottle, 750ml.",
            "full": (
                "Double-wall vacuum insulated bottle keeps drinks cold for 24h or hot for 12h. "
                "Made from food-grade 18/8 stainless steel. BPA-free cap with leak-proof seal. "
                "Available in 6 colors."
            ),
            "usage": (
                "1. Wash before first use with warm soapy water\n"
                "2. Fill with beverage of choice\n"
                "3. Secure cap tightly — twist until it clicks\n"
                "4. Hand wash recommended — not dishwasher safe"
            ),
        },
    ]

    for pd in products_data:
        product = Product(
            company_id=pd["company"].id,
            identification_id=generate_identification_id(),
            name=pd["name"],
            category=pd["category"],
            brand=pd["brand"],
            model=pd["model"],
            country_of_origin=pd["country"],
            status=pd["status"],
            published_at=now if pd["status"] == ProductStatus.published else None,
        )
        session.add(product)
        await session.flush()

        # English translation
        session.add(ProductTranslation(
            product_id=product.id,
            lang="en",
            short_description=pd["short"],
            full_description=pd["full"],
            usage_instructions=pd["usage"],
        ))

        # Mock manual document for published products
        if pd["status"] == ProductStatus.published:
            session.add(ProductDocument(
                product_id=product.id,
                doc_type=DocType.manual,
                title=f"{pd['name']} — User Manual",
            ))

    await session.commit()
