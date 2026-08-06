"""Seed database with mock data for testing."""

import hashlib
from datetime import date, datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.company import Company, CompanyStatus
from app.models.product import Product, ProductStatus
from app.models.product_document import ProductDocument, DocType
from app.models.product_document_version import ProductDocumentVersion
from app.models.product_image import ProductImage
from app.models.product_translation import ProductTranslation
from app.models.user import User, UserRole
from app.services.id_generator import generate_identification_id, generate_manufacturer_id

# Public sample PDF used as a placeholder manual for seeded products so the
# "Open" download link works without Supabase storage configured.
SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# Seeded demo manufacturers (kept as active registry members for demos).
DEMO_COMPANY_NAMES = (
    "ACME Corp", "TechVision", "GreenLeaf", "Nova Tools", "Casa Home", "ZenFit",
)

# ---------------------------------------------------------------------------
# Real product images from Unsplash (free, no attribution required).
# All URLs use the Unsplash CDN: images.unsplash.com/photo-{id}
# ---------------------------------------------------------------------------
_U = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=800&q=80"

MOCK_IMAGES: dict[str, list[tuple[str, str]]] = {
    "ProChef Air Fryer 5.5L": [
        (_U.format("1628557044797-f21a177c37ec"), "ProChef Air Fryer 5.5L – main view"),
        (_U.format("1556909114-f6e7ad7d3136"),    "ProChef Air Fryer 5.5L – cooked result"),
    ],
    "BrewMaster Coffee Maker": [
        (_U.format("1495474472287-4d71bcdd2085"), "BrewMaster Coffee Maker – main view"),
        (_U.format("1509042239860-f550ce710b93"), "BrewMaster Coffee Maker – brewing"),
    ],
    "SilentBlend 1200W": [
        (_U.format("1570197788417-0e82375c9371"), "SilentBlend 1200W – full unit"),
        (_U.format("1577003833619-76bbd7f3948a"), "SilentBlend 1200W – smoothie result"),
    ],
    "PowerDrill Pro 3000": [
        (_U.format("1572981779307-38b8cabb2407"), "PowerDrill Pro 3000 – main view"),
        (_U.format("1504222498345-5a17b44a7bde"), "PowerDrill Pro 3000 – in use"),
    ],
    "CircularSaw 7.25\" Pro": [
        (_U.format("1504526502898-f31e219e57ab"), "CircularSaw 7.25\" Pro – cutting wood"),
        (_U.format("1504222498345-5a17b44a7bde"), "CircularSaw 7.25\" Pro – power tool"),
    ],
    "OrbitalSander OS-5": [
        (_U.format("1540479859555-17af45c78602"), "OrbitalSander OS-5 – sanding"),
        (_U.format("1504526502898-f31e219e57ab"), "OrbitalSander OS-5 – woodworking"),
    ],
    "SmartThermo X1": [
        (_U.format("1558618666-fcd25c85cd64"), "SmartThermo X1 – wall mounted"),
        (_U.format("1585771724684-38269d6639fd"), "SmartThermo X1 – smart home app"),
    ],
    "VisionCam Pro 4K": [
        (_U.format("1557804506-669a67965ba0"), "VisionCam Pro 4K – camera unit"),
        (_U.format("1510511459019-5dda7724fd87"), "VisionCam Pro 4K – mounted outdoors"),
    ],
    "SmartLock V2": [
        (_U.format("1580618865001-3771a2fb5c48"), "SmartLock V2 – smart door lock"),
        (_U.format("1558618666-fcd25c85cd64"),    "SmartLock V2 – smart device panel"),
    ],
    "StandDesk Pro 160": [
        (_U.format("1518455027359-f3f8164ba6bd"), "StandDesk Pro 160 – workspace setup"),
        (_U.format("1593642632559-0c6d3fc62b89"), "StandDesk Pro 160 – home office"),
    ],
    "ErgoChair Lumbar Pro": [
        (_U.format("1523726491678-bf852e717f6a"), "ErgoChair Lumbar Pro – main view"),
        (_U.format("1580480055273-228ff5388ef8"), "ErgoChair Lumbar Pro – side profile"),
    ],
    "TrailRunner Jacket": [
        (_U.format("1542291026-7eec264c27ff"), "TrailRunner Jacket – main view"),
        (_U.format("1551698618-1dfe5d97d256"), "TrailRunner Jacket – running outdoors"),
    ],
    "ZenFit Compression Tights": [
        (_U.format("1506629082955-511b1aa562c8"), "ZenFit Compression Tights – full length"),
        (_U.format("1581009146145-b5ef050c2e1e"), "ZenFit Compression Tights – workout"),
    ],
    "RoboKit STEM Builder": [
        (_U.format("1485827404703-89b55fcc595e"), "RoboKit STEM Builder – assembled robot"),
        (_U.format("1561144257-e32e8506e12a"),    "RoboKit STEM Builder – STEM components"),
    ],
    "WoodCraft Junior Set": [
        (_U.format("1515488042361-ee00e0ddd4e4"), "WoodCraft Junior Set – wooden blocks"),
        (_U.format("1566576912321-d58ddd7a6088"), "WoodCraft Junior Set – colorful toy set"),
    ],
    "ZenMat Pro 6mm": [
        (_U.format("1544367567-0f2fcb009e0b"), "ZenMat Pro 6mm – yoga mat"),
        (_U.format("1599901860904-17e6ed7083a0"), "ZenMat Pro 6mm – in use"),
    ],
    "ResistaBand Set X5": [
        (_U.format("1517836357463-d25dfeac3438"), "ResistaBand Set X5 – resistance training"),
        (_U.format("1595078475328-1ab05d0a6a0e"), "ResistaBand Set X5 – band set"),
    ],
    "JumpStart Pro 2000A": [
        (_U.format("1492144534655-ae79c964c9d7"), "JumpStart Pro 2000A – car battery"),
        (_U.format("1503376780353-7e6692767b70"), "JumpStart Pro 2000A – automotive"),
    ],
    "DriveCam 4K Duo": [
        (_U.format("1503376780353-7e6692767b70"), "DriveCam 4K Duo – dashboard view"),
        (_U.format("1494976388531-d1058494cdd8"), "DriveCam 4K Duo – car interior"),
    ],
}


async def _get_or_create_user(session: AsyncSession, email: str, **kwargs) -> User:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(email=email, **kwargs)
        session.add(user)
        await session.flush()
    return user


async def _get_or_create_company(session: AsyncSession, display_name: str, owner_id, **kwargs) -> Company:
    result = await session.execute(select(Company).where(Company.display_name == display_name))
    company = result.scalar_one_or_none()
    if not company:
        company = Company(
            owner_user_id=owner_id,
            display_name=display_name,
            manufacturer_id=generate_manufacturer_id(),
            registry_active=True,
            registry_paid_until=date(2099, 12, 31),
            **kwargs,
        )
        session.add(company)
        await session.flush()
    else:
        # Keep demo companies fully populated for testing/demos.
        if not company.manufacturer_id:
            company.manufacturer_id = generate_manufacturer_id()
        if not company.registry_active:
            company.registry_active = True
            company.registry_paid_until = date(2099, 12, 31)
        await session.flush()
    return company


async def seed_data(session: AsyncSession) -> None:
    # Backfill Manufacturer IDs for any company missing one. Runs on every
    # startup (before the seeded-already guard) so existing databases get
    # registry IDs too.
    missing = await session.execute(
        select(Company).where(Company.manufacturer_id.is_(None))
    )
    backfilled = False
    for company in missing.scalars().all():
        company.manufacturer_id = generate_manufacturer_id()
        backfilled = True

    # Demo companies keep an active registry membership so the public
    # manufacturer profiles stay populated for testing and demos.
    demo = await session.execute(
        select(Company).where(
            Company.display_name.in_(DEMO_COMPANY_NAMES),
            Company.registry_active.is_(False),
        )
    )
    for company in demo.scalars().all():
        company.registry_active = True
        company.registry_paid_until = date(2099, 12, 31)
        backfilled = True

    if backfilled:
        await session.commit()

    # Check if products are already seeded
    result = await session.execute(
        select(Product).where(Product.name == "DriveCam 4K Duo")
    )
    drivecam = result.scalar_one_or_none()
    products_done = drivecam is not None

    # Check if images are already seeded with REAL images (not Picsum placeholders)
    img_check = await session.execute(select(ProductImage).limit(1))
    first_img_row = img_check.scalar_one_or_none()
    images_done = first_img_row is not None and "picsum" not in (first_img_row.url or "")

    # Check if document versions (downloadable manuals) are seeded
    ver_check = await session.execute(select(ProductDocumentVersion).limit(1))
    versions_done = ver_check.scalar_one_or_none() is not None

    if products_done and images_done and versions_done:
        return  # Fully seeded — nothing to do

    now = datetime.now(timezone.utc)

    # ── Admin ──
    await _get_or_create_user(
        session, "danilbobrow1234@gmail.com",
        password_hash=hash_password("123123123"),
        role=UserRole.admin, is_active=True,
    )

    # ── Users ──
    john   = await _get_or_create_user(session, "john@acmecorp.com",   password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    sarah  = await _get_or_create_user(session, "sarah@techvision.io", password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    mike   = await _get_or_create_user(session, "mike@greenleaf.co",   password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    lisa   = await _get_or_create_user(session, "lisa@novatools.com",  password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    carlos = await _get_or_create_user(session, "carlos@casahome.es",  password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    yuki   = await _get_or_create_user(session, "yuki@zenfit.jp",      password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)

    # ── Companies ──
    acme       = await _get_or_create_company(session, "ACME Corp",   john.id,   legal_name="ACME Corporation LLC",         country_code="US", website="https://acmecorp.com",   support_email="support@acmecorp.com",  status=CompanyStatus.verified, verified_at=now)
    techvision = await _get_or_create_company(session, "TechVision",  sarah.id,  legal_name="TechVision Industries GmbH",   country_code="DE", website="https://techvision.io",  support_email="help@techvision.io",    status=CompanyStatus.verified, verified_at=now)
    greenleaf  = await _get_or_create_company(session, "GreenLeaf",   mike.id,   legal_name="GreenLeaf Manufacturing Ltd",  country_code="GB", website="https://greenleaf.co",   support_email="info@greenleaf.co",     status=CompanyStatus.verified, verified_at=now)
    novatools  = await _get_or_create_company(session, "Nova Tools",  lisa.id,   legal_name="Nova Tools Inc",               country_code="US", website="https://novatools.com",  support_email="support@novatools.com", status=CompanyStatus.verified, verified_at=now)
    casahome   = await _get_or_create_company(session, "Casa Home",   carlos.id, legal_name="Casa Home S.L.",               country_code="ES", website="https://casahome.es",    support_email="hello@casahome.es",     status=CompanyStatus.verified, verified_at=now)
    zenfit     = await _get_or_create_company(session, "ZenFit",      yuki.id,   legal_name="ZenFit Co. Ltd.",              country_code="JP", website="https://zenfit.jp",      support_email="support@zenfit.jp",     status=CompanyStatus.verified, verified_at=now)

    products_data = [

        # ── Kitchen Appliances ──
        dict(company=acme, name="ProChef Air Fryer 5.5L", category="kitchen_appliances", brand="ACME", model="AF-550", country="US", status=ProductStatus.published,
             short="Large 5.5L digital air fryer with 8 cooking presets.",
             full="The ProChef Air Fryer 5.5L uses rapid air circulation to cook with up to 80% less fat than traditional frying. Features a digital touchscreen with 8 presets including fries, chicken, fish, steak, shrimp, cake, and pizza. The non-stick dishwasher-safe basket makes cleanup effortless.",
             usage="1. Preheat for 3 minutes before cooking\n2. Place food in the basket — do not overfill\n3. Select preset or manually set temperature (80–200°C) and time\n4. Shake basket halfway through for even cooking\n5. Allow to cool before cleaning"),
        dict(company=greenleaf, name="BrewMaster Coffee Maker", category="kitchen_appliances", brand="GreenLeaf", model="BM-12", country="GB", status=ProductStatus.published,
             short="12-cup programmable coffee maker with thermal carafe.",
             full="Brew up to 12 cups of rich, flavorful coffee with the BrewMaster. Features a 24-hour programmable timer, adjustable brew strength (mild, medium, bold), and a double-wall thermal stainless steel carafe that keeps coffee hot for up to 4 hours without a warming plate.",
             usage="1. Fill the water reservoir to the desired level\n2. Insert a paper or reusable filter and add ground coffee\n3. Set timer or press Brew Now\n4. Pour and enjoy — carafe keeps coffee hot without burning"),
        dict(company=casahome, name="SilentBlend 1200W", category="kitchen_appliances", brand="Casa Home", model="SB-1200", country="ES", status=ProductStatus.published,
             short="High-performance blender with noise-reduction enclosure.",
             full="The SilentBlend 1200W delivers powerful blending at up to 24,000 RPM while keeping noise below 65dB thanks to the included acoustic enclosure. Ideal for smoothies, soups, nut butters, and crushing ice. 2L BPA-free jug with self-cleaning function.",
             usage="1. Assemble jug and ensure lid is secured\n2. Add liquid first, then solid ingredients\n3. Select speed or use a preset program\n4. Self-clean: add warm water + 1 drop of dish soap, run Clean cycle"),

        # ── Power Tools ──
        dict(company=acme, name="PowerDrill Pro 3000", category="power_tools", brand="ACME", model="PD-3000", country="US", status=ProductStatus.published,
             short="Professional-grade cordless drill with 20V lithium battery.",
             full="The PowerDrill Pro 3000 delivers 750 in-lbs of torque with a brushless motor for maximum efficiency. Includes 2-speed gearbox, LED work light, and quick-charge 20V 4.0Ah battery. Built for contractors and serious DIY enthusiasts.",
             usage="1. Charge battery fully before first use (approx 90 min)\n2. Select speed setting (1 for screwing, 2 for drilling)\n3. Attach appropriate bit to keyless chuck\n4. Adjust torque ring for material being drilled"),
        dict(company=novatools, name="CircularSaw 7.25\" Pro", category="power_tools", brand="Nova Tools", model="CS-725", country="US", status=ProductStatus.published,
             short="Powerful 15A circular saw with laser guide and bevel cut.",
             full="The CS-725 features a 15A motor delivering 5,800 RPM for fast, precise cuts through lumber, plywood, and hardwood. Laser guide system ensures straight cuts every time. Bevel adjustment 0–56° for versatile angled cuts. Compatible with standard 7-1/4\" blades.",
             usage="1. Set blade depth to 6mm below material thickness\n2. Align laser guide with cut line\n3. Keep blade guard in place during all cuts\n4. Let blade reach full speed before contacting material"),
        dict(company=novatools, name="OrbitalSander OS-5", category="power_tools", brand="Nova Tools", model="OS-5", country="US", status=ProductStatus.published,
             short="Random orbital sander, 5-inch with variable speed.",
             full="5-inch random orbital sander with variable speed dial (4,000–12,000 OPM) for everything from stock removal to fine finishing. Hook-and-loop pad change system, integrated dust collection bag, and low-vibration design for fatigue-free extended use.",
             usage="1. Attach sanding disc to hook-and-loop pad\n2. Set speed — lower for fine finish, higher for stock removal\n3. Keep sander moving to avoid swirl marks\n4. Empty dust bag when full"),

        # ── Electronics ──
        dict(company=acme, name="SmartThermo X1", category="electronics", brand="ACME", model="ST-X1", country="US", status=ProductStatus.published,
             short="Smart thermostat with WiFi connectivity and energy-saving features.",
             full="The SmartThermo X1 is a next-generation smart thermostat designed for modern homes. Features include voice control, learning algorithms that adapt to your schedule, and real-time energy monitoring via the companion app. Compatible with Alexa, Google Home, and Apple HomeKit.",
             usage="1. Mount on wall using included bracket\n2. Connect to WiFi via the ACME Home app\n3. Set your preferred temperature schedule\n4. Enable auto-learning mode for optimal energy savings"),
        dict(company=techvision, name="VisionCam Pro 4K", category="electronics", brand="TechVision", model="VC-4K", country="DE", status=ProductStatus.published,
             short="4K security camera with night vision and two-way audio.",
             full="The VisionCam Pro 4K delivers crystal-clear 4K video surveillance with a 130-degree wide-angle lens. Features include color night vision up to 30m, AI-powered person detection, and weatherproof IP67 housing.",
             usage="1. Download TechVision app and create account\n2. Mount camera using included hardware\n3. Connect to WiFi via QR code scan\n4. Configure motion zones and notification preferences"),
        dict(company=techvision, name="SmartLock V2", category="electronics", brand="TechVision", model="SL-V2", country="DE", status=ProductStatus.published,
             short="Biometric smart lock with fingerprint and app control.",
             full="The SmartLock V2 supports fingerprint, PIN code, NFC card, and smartphone unlocking. Stores up to 100 fingerprints. Auto-lock timer, tamper alarm, and 12-month battery life.",
             usage="1. Install lock following the included mounting guide\n2. Set master admin fingerprint during first setup\n3. Add additional users via the TechVision app\n4. Test all unlock methods before closing door"),

        # ── Furniture ──
        dict(company=casahome, name="StandDesk Pro 160", category="furniture", brand="Casa Home", model="SD-160", country="ES", status=ProductStatus.published,
             short="Electric height-adjustable standing desk, 160×80cm.",
             full="The StandDesk Pro 160 features a dual-motor lift system for smooth, quiet height adjustment (72–122cm) supporting up to 120kg. Includes 3-memory presets, anti-collision safety, and child-lock. Solid MDF top with steel frame in white or black.",
             usage="1. Assemble frame per included instructions (approx 30 min)\n2. Attach desktop and connect motor cable\n3. Program memory presets: hold preset button until LED flashes\n4. Use anti-collision by enabling in settings"),
        dict(company=casahome, name="ErgoChair Lumbar Pro", category="furniture", brand="Casa Home", model="EC-LP", country="ES", status=ProductStatus.published,
             short="Ergonomic office chair with adjustable lumbar and 4D armrests.",
             full="Designed for 8+ hours of comfortable use. Features adjustable lumbar support, 4D armrests, seat depth adjustment, and recline up to 135°. Breathable mesh back promotes air circulation. Supports up to 150kg. Available in black and grey.",
             usage="1. Adjust seat height so feet are flat on floor\n2. Set lumbar support to curve of your lower back\n3. Position armrests so elbows are at 90°\n4. Adjust recline tension to your preferred resistance"),

        # ── Clothing ──
        dict(company=greenleaf, name="TrailRunner Jacket", category="clothing", brand="GreenLeaf", model="TRJ-M", country="GB", status=ProductStatus.published,
             short="Lightweight windproof running jacket, unisex.",
             full="The TrailRunner Jacket is made from recycled ripstop nylon with a water-resistant DWR coating. Packable into its own chest pocket. Reflective detailing for visibility in low light. Available in S, M, L, XL. Machine washable.",
             usage="1. Machine wash cold, gentle cycle\n2. Do not tumble dry — hang to air dry\n3. Re-apply DWR coating annually with Nikwax TX.Direct\n4. Store in chest pocket when not in use"),
        dict(company=zenfit, name="ZenFit Compression Tights", category="clothing", brand="ZenFit", model="CT-BLK-M", country="JP", status=ProductStatus.published,
             short="4-way stretch compression tights for training and recovery.",
             full="Made from 78% polyamide / 22% elastane with graduated compression (15–20 mmHg). Moisture-wicking, anti-odor fabric. Flat-seam construction prevents chafing. UPF 50+ sun protection. Available in XS–XXL.",
             usage="1. Machine wash cold, inside out\n2. Do not bleach or iron\n3. Air dry — avoid direct sunlight\n4. Replace every 6 months or when compression decreases"),

        # ── Toys ──
        dict(company=techvision, name="RoboKit STEM Builder", category="toys", brand="TechVision", model="RK-200", country="DE", status=ProductStatus.published,
             short="200-piece programmable robotics kit for ages 8+.",
             full="Build and code over 15 different robots with the RoboKit STEM Builder. Includes motor modules, sensors (light, touch, ultrasonic), and a colour-coded programming interface. Compatible with Scratch and Python. Teaches engineering and coding fundamentals through play.",
             usage="1. Download the RoboKit app on a tablet or PC\n2. Follow the step-by-step build guide for your chosen robot\n3. Connect via Bluetooth to program movements and sensor responses\n4. Progress from drag-and-drop blocks to Python as skills grow"),
        dict(company=novatools, name="WoodCraft Junior Set", category="toys", brand="Nova Tools", model="WCJ-30", country="US", status=ProductStatus.published,
             short="30-piece real wood construction toy set for ages 4+.",
             full="Handcrafted from sustainably sourced beechwood. Sanded smooth, no sharp edges. Includes arches, columns, planks, and cylinders. Stimulates spatial reasoning and creative play. Coated with child-safe, non-toxic paint. Conforms to EN71 and ASTM F963 safety standards.",
             usage="1. Suitable for ages 4 and above — always adult supervision for under 3s\n2. Clean with damp cloth only — do not submerge in water\n3. Sand any splinters lightly with fine grit sandpaper\n4. Store in included cotton bag"),

        # ── Sports ──
        dict(company=zenfit, name="ZenMat Pro 6mm", category="sports", brand="ZenFit", model="ZM-PRO-6", country="JP", status=ProductStatus.published,
             short="Non-slip yoga mat, 6mm thick, with alignment lines.",
             full="Premium TPE foam yoga mat with double-layer non-slip texture for grip on both sides. Closed-cell surface prevents sweat absorption and bacteria growth. Printed alignment lines for perfect pose positioning. Includes carry strap. Dimensions: 183×61×0.6cm.",
             usage="1. Unroll and wipe with damp cloth before first use\n2. Place non-slip side down on floor\n3. Clean after each use with mat spray and cloth\n4. Allow to air dry completely before rolling up"),
        dict(company=zenfit, name="ResistaBand Set X5", category="sports", brand="ZenFit", model="RB-X5", country="JP", status=ProductStatus.published,
             short="Set of 5 resistance bands with handles, door anchor, and carry bag.",
             full="Stackable resistance bands from 4.5kg to 22kg total resistance. Made from natural latex with reinforced clip attachments. Includes foam handles, ankle straps, door anchor, and workout guide. Suitable for strength training, physiotherapy, and stretching.",
             usage="1. Inspect bands before each use for tears or weak spots\n2. Secure door anchor at appropriate height for chosen exercise\n3. Start with lighter resistance and progress gradually\n4. Store away from direct sunlight to extend band life"),

        # ── Automotive ──
        dict(company=novatools, name="JumpStart Pro 2000A", category="automotive", brand="Nova Tools", model="JSP-2000", country="US", status=ProductStatus.published,
             short="2000A peak portable car jump starter with USB-C.",
             full="The JumpStart Pro 2000A safely jump starts vehicles up to 8L gas or 6L diesel. Built-in 20,000mAh battery bank charges phones and laptops via USB-C PD (65W) and USB-A. Bright 500-lumen LED flashlight with SOS mode. Reverse polarity and overcharge protection.",
             usage="1. Ensure jump starter is charged above 25%\n2. Connect red clamp to positive battery terminal, black to negative\n3. Start the vehicle — do not hold starter for more than 5 seconds\n4. Disconnect clamps in reverse order after vehicle starts"),
        dict(company=techvision, name="DriveCam 4K Duo", category="automotive", brand="TechVision", model="DC-4KD", country="DE", status=ProductStatus.published,
             short="Front and rear 4K dashcam with night vision and GPS.",
             full="Dual-channel dashcam with 4K front and 1080P rear recording. GPS tracking records speed and route. SONY STARVIS sensor for clear night footage. Loop recording overwrites oldest footage. 24H parking mode with hardwire kit (included). WiFi for phone preview.",
             usage="1. Mount front camera behind rearview mirror using included suction mount\n2. Route rear camera cable along headliner and A-pillar\n3. Connect to 12V socket or hardwire to fuse box for parking mode\n4. Format SD card (Class 10, up to 256GB) before first use"),
    ]

    for pd in products_data:
        # Get existing product or create it
        existing = await session.execute(select(Product).where(Product.name == pd["name"]))
        product = existing.scalar_one_or_none()

        if not product:
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

            session.add(ProductTranslation(
                product_id=product.id,
                lang="en",
                short_description=pd["short"],
                full_description=pd["full"],
                usage_instructions=pd["usage"],
            ))

        # ── Seed a downloadable manual (document + version), idempotent ──
        if pd["status"] == ProductStatus.published:
            doc_result = await session.execute(
                select(ProductDocument).where(
                    ProductDocument.product_id == product.id,
                    ProductDocument.doc_type == DocType.manual,
                )
            )
            doc = doc_result.scalar_one_or_none()
            if not doc:
                doc = ProductDocument(
                    product_id=product.id,
                    doc_type=DocType.manual,
                    title=f"{pd['name']} — User Manual",
                )
                session.add(doc)
                await session.flush()
            # Attach a version pointing to a public sample PDF if missing.
            if not doc.current_version_id:
                version = ProductDocumentVersion(
                    document_id=doc.id,
                    version=1,
                    file_key=SAMPLE_PDF_URL,
                    file_name=f"{pd['name']} Manual.pdf",
                    size_bytes=13264,
                    sha256=hashlib.sha256(pd["name"].encode()).hexdigest(),
                    uploaded_by=pd["company"].owner_user_id,
                )
                session.add(version)
                await session.flush()
                doc.current_version_id = version.id

        # ── Seed mock images (auto-replaces Picsum placeholders with real ones) ──
        existing_img = await session.execute(
            select(ProductImage).where(ProductImage.product_id == product.id).limit(1)
        )
        cur_img = existing_img.scalar_one_or_none()
        # Replace old Picsum placeholder images with real Unsplash product photos
        if cur_img and "picsum" in (cur_img.url or ""):
            await session.execute(
                delete(ProductImage).where(ProductImage.product_id == product.id)
            )
            await session.flush()
            cur_img = None
        if not cur_img:
            for order, (url, alt) in enumerate(MOCK_IMAGES.get(pd["name"], [])):
                session.add(ProductImage(
                    product_id=product.id,
                    file_key=f"mock/images/{product.id}/{order + 1}.jpg",
                    url=url,
                    display_order=order,
                    alt_text=alt,
                ))

    await session.commit()
