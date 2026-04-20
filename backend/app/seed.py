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
    result = await session.execute(
        select(User).where(User.email == "john@acmecorp.com")
    )
    if result.scalar_one_or_none():
        return  # Already seeded

    now = datetime.now(timezone.utc)

    # ── Admin ──
    result = await session.execute(
        select(User).where(User.email == "danilbobrow1234@gmail.com")
    )
    if not result.scalar_one_or_none():
        session.add(User(
            email="danilbobrow1234@gmail.com",
            password_hash=hash_password("123123123"),
            role=UserRole.admin,
            is_active=True,
        ))
        await session.flush()

    # ── Users ──
    john   = User(email="john@acmecorp.com",       password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    sarah  = User(email="sarah@techvision.io",      password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    mike   = User(email="mike@greenleaf.co",        password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    lisa   = User(email="lisa@novatools.com",       password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    carlos = User(email="carlos@casahome.es",       password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    yuki   = User(email="yuki@zenfit.jp",           password_hash=hash_password("demo12345678"), role=UserRole.manufacturer, is_active=True)
    session.add_all([john, sarah, mike, lisa, carlos, yuki])
    await session.flush()

    # ── Companies ──
    acme = Company(
        owner_user_id=john.id, legal_name="ACME Corporation LLC",
        display_name="ACME Corp", country_code="US",
        website="https://acmecorp.com", support_email="support@acmecorp.com",
        status=CompanyStatus.verified, verified_at=now,
    )
    techvision = Company(
        owner_user_id=sarah.id, legal_name="TechVision Industries GmbH",
        display_name="TechVision", country_code="DE",
        website="https://techvision.io", support_email="help@techvision.io",
        status=CompanyStatus.verified, verified_at=now,
    )
    greenleaf = Company(
        owner_user_id=mike.id, legal_name="GreenLeaf Manufacturing Ltd",
        display_name="GreenLeaf", country_code="GB",
        website="https://greenleaf.co", support_email="info@greenleaf.co",
        status=CompanyStatus.verified, verified_at=now,
    )
    novatools = Company(
        owner_user_id=lisa.id, legal_name="Nova Tools Inc",
        display_name="Nova Tools", country_code="US",
        website="https://novatools.com", support_email="support@novatools.com",
        status=CompanyStatus.verified, verified_at=now,
    )
    casahome = Company(
        owner_user_id=carlos.id, legal_name="Casa Home S.L.",
        display_name="Casa Home", country_code="ES",
        website="https://casahome.es", support_email="hello@casahome.es",
        status=CompanyStatus.verified, verified_at=now,
    )
    zenfit = Company(
        owner_user_id=yuki.id, legal_name="ZenFit Co. Ltd.",
        display_name="ZenFit", country_code="JP",
        website="https://zenfit.jp", support_email="support@zenfit.jp",
        status=CompanyStatus.verified, verified_at=now,
    )
    session.add_all([acme, techvision, greenleaf, novatools, casahome, zenfit])
    await session.flush()

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

        if pd["status"] == ProductStatus.published:
            session.add(ProductDocument(
                product_id=product.id,
                doc_type=DocType.manual,
                title=f"{pd['name']} — User Manual",
            ))

    await session.commit()
