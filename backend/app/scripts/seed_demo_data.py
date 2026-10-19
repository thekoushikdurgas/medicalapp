"""
Comprehensive seed script for Pharmacy Fantasy.
Populates realistic users, products from real invoice bills, inventory batches,
sample orders across all lifecycle states, GST invoices, and delivery assignments.

Usage:
    python -m app.scripts.seed_demo_data
"""

import asyncio
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy import select
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import (
    User,
    UserRole,
    ShopkeeperProfile,
    DeliveryProfile,
    Product,
    StockBatch,
    Order,
    OrderItem,
    OrderStatus,
    Invoice,
    DeliveryAssignment,
    DeliveryStatus,
    Payment,
    PaymentMethod,
)
from app.db.session import engine, async_session_factory
from app.utils.gst import calculate_line_total, calculate_invoice_totals


async def seed_all():
    print("[*] Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if already seeded or admin configured
        existing_admin = await session.execute(
            select(User).where(User.role == UserRole.SUPER_ADMIN)
        )
        if existing_admin.scalar_one_or_none():
            print(
                "[INFO] Database already has an active Super Admin. Skipping demo seeding."
            )
            return

        print("[*] Seeding system users...")
        now = datetime.utcnow()

        # 1. Users
        superadmin = User(
            id=uuid.uuid4(),
            email="superadmin@pharmacyfantasy.com",
            phone="9800000001",
            password_hash=hash_password("admin123"),
            full_name="Rajesh Mukherjee (Super Admin)",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )

        admin = User(
            id=uuid.uuid4(),
            email="admin@pharmacyfantasy.com",
            phone="9800000002",
            password_hash=hash_password("admin123"),
            full_name="Pooja Sharma (Operations Admin)",
            role=UserRole.ADMIN,
            is_active=True,
        )

        warehouse_user = User(
            id=uuid.uuid4(),
            email="warehouse@pharmacyfantasy.com",
            phone="9800000003",
            password_hash=hash_password("warehouse123"),
            full_name="Sunil Ghosh (Warehouse Manager)",
            role=UserRole.WAREHOUSE,
            is_active=True,
        )

        delivery_user_1 = User(
            id=uuid.uuid4(),
            email="delivery@pharmacyfantasy.com",
            phone="9800000004",
            password_hash=hash_password("delivery123"),
            full_name="Rahul Sharma",
            role=UserRole.DELIVERY,
            is_active=True,
        )

        delivery_user_2 = User(
            id=uuid.uuid4(),
            email="bikash@pharmacyfantasy.com",
            phone="9800000005",
            password_hash=hash_password("delivery123"),
            full_name="Bikash Roy",
            role=UserRole.DELIVERY,
            is_active=True,
        )

        shop_user_1 = User(
            id=uuid.uuid4(),
            email="cheapmedical@pharmacyfantasy.com",
            phone="9832145678",
            password_hash=hash_password("shop123"),
            full_name="Amitabh Das (Cheap Medical)",
            role=UserRole.SHOPKEEPER,
            is_active=True,
        )

        shop_user_2 = User(
            id=uuid.uuid4(),
            email="guptapharmacy@pharmacyfantasy.com",
            phone="9832145679",
            password_hash=hash_password("shop123"),
            full_name="Ramesh Gupta (Gupta Pharmacy)",
            role=UserRole.SHOPKEEPER,
            is_active=True,
        )

        session.add_all(
            [
                superadmin,
                admin,
                warehouse_user,
                delivery_user_1,
                delivery_user_2,
                shop_user_1,
                shop_user_2,
            ]
        )
        await session.flush()

        # Profiles
        shop_profile_1 = ShopkeeperProfile(
            user_id=shop_user_1.id,
            shop_name="Cheap Medical Stores",
            shop_address="Shop No 14, Main Market, Benachity, Durgapur, West Bengal 713213",
            gstin="19AAACC1234D1Z5",
            drug_license_no="WB-BUR-20B-10492",
            area="Benachity",
            city="Durgapur",
            credit_limit=100000.0,
            outstanding_balance=23375.0,
        )

        shop_profile_2 = ShopkeeperProfile(
            user_id=shop_user_2.id,
            shop_name="Gupta Pharmacy & Clinic",
            shop_address="A-22 Commercial Complex, City Centre, Durgapur, West Bengal 713216",
            gstin="19BBBDD5678E1Z9",
            drug_license_no="WB-BUR-20B-11883",
            area="City Centre",
            city="Durgapur",
            credit_limit=150000.0,
            outstanding_balance=8617.25,
        )

        deliv_profile_1 = DeliveryProfile(
            user_id=delivery_user_1.id,
            vehicle_type="Two-Wheeler",
            vehicle_number="WB-40-AB-3421",
            assigned_area="Benachity Market",
            is_available=True,
        )

        deliv_profile_2 = DeliveryProfile(
            user_id=delivery_user_2.id,
            vehicle_type="Van / Three-Wheeler",
            vehicle_number="WB-40-CD-8812",
            assigned_area="City Centre Hub",
            is_available=True,
        )

        session.add_all(
            [shop_profile_1, shop_profile_2, deliv_profile_1, deliv_profile_2]
        )

        # 2. Products from real invoices
        print("[*] Seeding products & warehouse stock batches...")
        products_data = [
            {
                "name": "AZITHRAL 500MG TAB",
                "composition": "Azithromycin 500mg",
                "manufacturer": "Alembic Pharmaceuticals Ltd",
                "pack_size": "10S",
                "hsn_code": "30041090",
                "category": "Antibiotics",
                "default_mrp": 126.73,
                "batch_number": "2613000703",
                "expiry_date": date(2028, 12, 31),
                "purchase_rate": 85.00,
                "selling_rate": 96.56,
                "discount1_pct": 12.0,
                "stock": 450,
            },
            {
                "name": "HIFENAC MR TAB",
                "composition": "Aceclofenac 100mg + Paracetamol 325mg + Chlorzoxazone 250mg",
                "manufacturer": "Intas Pharmaceuticals Ltd",
                "pack_size": "10S",
                "hsn_code": "30049069",
                "category": "Pain Relief",
                "default_mrp": 88.01,
                "batch_number": "2614002301",
                "expiry_date": date(2028, 8, 31),
                "purchase_rate": 62.00,
                "selling_rate": 72.50,
                "discount1_pct": 14.0,
                "stock": 320,
            },
            {
                "name": "PAN D CAP",
                "composition": "Pantoprazole 40mg + Domperidone 30mg SR",
                "manufacturer": "Alkem Laboratories Ltd",
                "pack_size": "15S",
                "hsn_code": "30049099",
                "category": "Gastrointestinal",
                "default_mrp": 199.00,
                "batch_number": "2611004510",
                "expiry_date": date(2028, 5, 31),
                "purchase_rate": 125.00,
                "selling_rate": 145.00,
                "discount1_pct": 10.0,
                "stock": 600,
            },
            {
                "name": "TELMA 40MG TAB",
                "composition": "Telmisartan 40mg",
                "manufacturer": "Glenmark Pharmaceuticals",
                "pack_size": "15S",
                "hsn_code": "30049069",
                "category": "Cardiovascular",
                "default_mrp": 145.50,
                "batch_number": "2612008920",
                "expiry_date": date(2028, 10, 31),
                "purchase_rate": 95.00,
                "selling_rate": 110.00,
                "discount1_pct": 10.0,
                "stock": 280,
            },
            {
                "name": "MONTEK LC TAB",
                "composition": "Montelukast 10mg + Levocetirizine 5mg",
                "manufacturer": "Sun Pharmaceutical Industries",
                "pack_size": "10S",
                "hsn_code": "30049099",
                "category": "Anti-allergic",
                "default_mrp": 185.00,
                "batch_number": "2615003112",
                "expiry_date": date(2028, 11, 30),
                "purchase_rate": 118.00,
                "selling_rate": 138.00,
                "discount1_pct": 15.0,
                "stock": 500,
            },
            {
                "name": "AUGMENTIN 625 DUO",
                "composition": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
                "manufacturer": "GlaxoSmithKline Pharmaceuticals",
                "pack_size": "10S",
                "hsn_code": "30041090",
                "category": "Antibiotics",
                "default_mrp": 223.50,
                "batch_number": "2610009943",
                "expiry_date": date(2028, 3, 31),
                "purchase_rate": 150.00,
                "selling_rate": 172.00,
                "discount1_pct": 8.0,
                "stock": 350,
            },
            {
                "name": "CALPOL 650MG TAB",
                "composition": "Paracetamol 650mg",
                "manufacturer": "GlaxoSmithKline Pharmaceuticals",
                "pack_size": "15S",
                "hsn_code": "30049069",
                "category": "Analgesic",
                "default_mrp": 34.50,
                "batch_number": "2614008129",
                "expiry_date": date(2028, 9, 30),
                "purchase_rate": 21.00,
                "selling_rate": 26.00,
                "discount1_pct": 5.0,
                "stock": 1200,
            },
            {
                "name": "DOLO 650MG TAB",
                "composition": "Paracetamol 650mg Fast-Action",
                "manufacturer": "Micro Labs Ltd",
                "pack_size": "15S",
                "hsn_code": "30049069",
                "category": "Analgesic",
                "default_mrp": 33.75,
                "batch_number": "2613005521",
                "expiry_date": date(2028, 7, 31),
                "purchase_rate": 20.50,
                "selling_rate": 25.50,
                "discount1_pct": 5.0,
                "stock": 1500,
            },
            {
                "name": "CLAVAM 625 TAB",
                "composition": "Amoxycillin 500mg + Clavulanic Acid 125mg",
                "manufacturer": "Alkem Laboratories Ltd",
                "pack_size": "10S",
                "hsn_code": "30041090",
                "category": "Antibiotics",
                "default_mrp": 218.00,
                "batch_number": "2612004412",
                "expiry_date": date(2028, 6, 30),
                "purchase_rate": 145.00,
                "selling_rate": 168.00,
                "discount1_pct": 10.0,
                "stock": 420,
            },
            {
                "name": "PANTOCID 40 TAB",
                "composition": "Pantoprazole Gastro-Resistant 40mg",
                "manufacturer": "Sun Pharmaceutical Industries",
                "pack_size": "15S",
                "hsn_code": "30049099",
                "category": "Gastrointestinal",
                "default_mrp": 162.00,
                "batch_number": "2615007788",
                "expiry_date": date(2028, 4, 30),
                "purchase_rate": 100.00,
                "selling_rate": 120.00,
                "discount1_pct": 12.0,
                "stock": 480,
            },
        ]

        created_products = []
        for pdata in products_data:
            p = Product(
                id=uuid.uuid4(),
                name=pdata["name"],
                composition=pdata["composition"],
                manufacturer=pdata["manufacturer"],
                pack_size=pdata["pack_size"],
                hsn_code=pdata["hsn_code"],
                category=pdata["category"],
                default_mrp=pdata["default_mrp"],
                default_sgst_rate=2.5,
                default_cgst_rate=2.5,
                is_active=True,
            )
            session.add(p)
            await session.flush()

            batch = StockBatch(
                id=uuid.uuid4(),
                product_id=p.id,
                batch_number=pdata["batch_number"],
                expiry_date=pdata["expiry_date"],
                purchase_rate=pdata["purchase_rate"],
                mrp=pdata["default_mrp"],
                quantity_received=pdata["stock"] + 100,
                quantity_available=pdata["stock"],
                quantity_sold=100,
                supplier_invoice_no="MME-2026-PUR-0192",
            )
            session.add(batch)
            created_products.append((p, pdata))

        await session.flush()

        # 3. Create realistic Orders mirroring real invoices
        print("[*] Seeding demo orders, invoices, and delivery assignments...")

        # Order 1: DISPATCHED / OUT FOR DELIVERY (Mirroring Bill A004448)
        p_azithral = created_products[0][0]
        p_hifenac = created_products[1][0]
        p_pand = created_products[2][0]

        calc1 = calculate_line_total(quantity=36, rate=96.56, discount1_pct=12.0)
        calc2 = calculate_line_total(quantity=20, rate=72.50, discount1_pct=14.0)
        calc3 = calculate_line_total(quantity=60, rate=145.00, discount1_pct=10.0)

        inv_totals_1 = calculate_invoice_totals([calc1, calc2, calc3])

        order_1 = Order(
            id=uuid.uuid4(),
            order_number="ORD-2026-004448",
            shopkeeper_id=shop_user_1.id,
            status=OrderStatus.DISPATCHED,
            total_amount=inv_totals_1["subtotal"],
            discount_amount=inv_totals_1["total_discount"],
            gst_amount=inv_totals_1["total_sgst"] + inv_totals_1["total_cgst"],
            net_amount=inv_totals_1["grand_total"],
            placed_at=now - timedelta(days=1, hours=3),
            confirmed_at=now - timedelta(days=1, hours=1),
            confirmed_by=admin.id,
            remarks="Urgent monthly stock refill - Please deliver before 2 PM",
        )
        session.add(order_1)
        await session.flush()

        item_1_1 = OrderItem(
            order_id=order_1.id,
            product_id=p_azithral.id,
            quantity=36,
            free_quantity=3,
            rate=96.56,
            mrp=126.73,
            discount1_pct=12.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc1["sgst"],
            cgst_amount=calc1["cgst"],
            line_total=calc1["total"],
        )
        item_1_2 = OrderItem(
            order_id=order_1.id,
            product_id=p_hifenac.id,
            quantity=20,
            free_quantity=1,
            rate=72.50,
            mrp=88.01,
            discount1_pct=14.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc2["sgst"],
            cgst_amount=calc2["cgst"],
            line_total=calc2["total"],
        )
        item_1_3 = OrderItem(
            order_id=order_1.id,
            product_id=p_pand.id,
            quantity=60,
            free_quantity=4,
            rate=145.00,
            mrp=199.00,
            discount1_pct=10.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc3["sgst"],
            cgst_amount=calc3["cgst"],
            line_total=calc3["total"],
        )
        session.add_all([item_1_1, item_1_2, item_1_3])

        invoice_1 = Invoice(
            id=uuid.uuid4(),
            order_id=order_1.id,
            invoice_number="INV-2026-004448",
            invoice_date=date.today(),
            subtotal=inv_totals_1["subtotal"],
            total_discount=inv_totals_1["total_discount"],
            total_sgst=inv_totals_1["total_sgst"],
            total_cgst=inv_totals_1["total_cgst"],
            grand_total=inv_totals_1["grand_total"],
            pdf_url="/invoices/INV-2026-004448.pdf",
        )
        session.add(invoice_1)

        delivery_1 = DeliveryAssignment(
            id=uuid.uuid4(),
            order_id=order_1.id,
            delivery_boy_id=delivery_user_1.id,
            assigned_by=warehouse_user.id,
            status=DeliveryStatus.IN_TRANSIT,
            assigned_at=now - timedelta(hours=2),
            delivery_notes="Package safely loaded on two-wheeler. Approaching Benachity roundabout.",
        )
        session.add(delivery_1)

        # Order 2: PICKING in warehouse (Mirroring Bill A000538)
        p_telma = created_products[3][0]
        p_montek = created_products[4][0]

        calc4 = calculate_line_total(quantity=40, rate=110.00, discount1_pct=10.0)
        calc5 = calculate_line_total(quantity=30, rate=138.00, discount1_pct=15.0)
        inv_totals_2 = calculate_invoice_totals([calc4, calc5])

        order_2 = Order(
            id=uuid.uuid4(),
            order_number="ORD-2026-000538",
            shopkeeper_id=shop_user_2.id,
            status=OrderStatus.PICKING,
            total_amount=inv_totals_2["subtotal"],
            discount_amount=inv_totals_2["total_discount"],
            gst_amount=inv_totals_2["total_sgst"] + inv_totals_2["total_cgst"],
            net_amount=inv_totals_2["grand_total"],
            placed_at=now - timedelta(hours=4),
            confirmed_at=now - timedelta(hours=2),
            remarks="City Centre clinic replenishment",
        )
        session.add(order_2)
        await session.flush()

        item_2_1 = OrderItem(
            order_id=order_2.id,
            product_id=p_telma.id,
            quantity=40,
            free_quantity=2,
            rate=110.00,
            mrp=145.50,
            discount1_pct=10.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc4["sgst"],
            cgst_amount=calc4["cgst"],
            line_total=calc4["total"],
        )
        item_2_2 = OrderItem(
            order_id=order_2.id,
            product_id=p_montek.id,
            quantity=30,
            free_quantity=2,
            rate=138.00,
            mrp=185.00,
            discount1_pct=15.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc5["sgst"],
            cgst_amount=calc5["cgst"],
            line_total=calc5["total"],
        )
        session.add_all([item_2_1, item_2_2])

        invoice_2 = Invoice(
            id=uuid.uuid4(),
            order_id=order_2.id,
            invoice_number="INV-2026-000538",
            invoice_date=date.today(),
            subtotal=inv_totals_2["subtotal"],
            total_discount=inv_totals_2["total_discount"],
            total_sgst=inv_totals_2["total_sgst"],
            total_cgst=inv_totals_2["total_cgst"],
            grand_total=inv_totals_2["grand_total"],
            pdf_url="/invoices/INV-2026-000538.pdf",
        )
        session.add(invoice_2)

        delivery_2 = DeliveryAssignment(
            id=uuid.uuid4(),
            order_id=order_2.id,
            delivery_boy_id=delivery_user_2.id,
            assigned_by=warehouse_user.id,
            status=DeliveryStatus.ASSIGNED,
            assigned_at=now - timedelta(hours=1),
            delivery_notes="Assigned to Bikash Roy. Waiting for packing completion.",
        )
        session.add(delivery_2)

        # Order 3: DELIVERED with proof of delivery
        p_calpol = created_products[6][0]
        p_dolo = created_products[7][0]

        calc6 = calculate_line_total(quantity=100, rate=26.00, discount1_pct=5.0)
        calc7 = calculate_line_total(quantity=150, rate=25.50, discount1_pct=5.0)
        inv_totals_3 = calculate_invoice_totals([calc6, calc7])

        order_3 = Order(
            id=uuid.uuid4(),
            order_number="ORD-2026-000109",
            shopkeeper_id=shop_user_1.id,
            status=OrderStatus.DELIVERED,
            total_amount=inv_totals_3["subtotal"],
            discount_amount=inv_totals_3["total_discount"],
            gst_amount=inv_totals_3["total_sgst"] + inv_totals_3["total_cgst"],
            net_amount=inv_totals_3["grand_total"],
            placed_at=now - timedelta(days=3),
            confirmed_at=now - timedelta(days=3, hours=-1),
            confirmed_by=admin.id,
            delivered_at=now - timedelta(days=2, hours=-2),
            remarks="Completed delivery with stamp & signature",
        )
        session.add(order_3)
        await session.flush()

        item_3_1 = OrderItem(
            order_id=order_3.id,
            product_id=p_calpol.id,
            quantity=100,
            free_quantity=5,
            rate=26.00,
            mrp=34.50,
            discount1_pct=5.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc6["sgst"],
            cgst_amount=calc6["cgst"],
            line_total=calc6["total"],
        )
        item_3_2 = OrderItem(
            order_id=order_3.id,
            product_id=p_dolo.id,
            quantity=150,
            free_quantity=10,
            rate=25.50,
            mrp=33.75,
            discount1_pct=5.0,
            discount2_pct=0.0,
            sgst_pct=2.5,
            cgst_pct=2.5,
            sgst_amount=calc7["sgst"],
            cgst_amount=calc7["cgst"],
            line_total=calc7["total"],
        )
        session.add_all([item_3_1, item_3_2])

        delivery_3 = DeliveryAssignment(
            id=uuid.uuid4(),
            order_id=order_3.id,
            delivery_boy_id=delivery_user_1.id,
            assigned_by=warehouse_user.id,
            status=DeliveryStatus.DELIVERED,
            assigned_at=now - timedelta(days=3),
            delivered_at=now - timedelta(days=2, hours=-2),
            proof_image_url="/proofs/deliv-000109-stamp.jpg",
            delivery_notes="Delivered to Amitabh Das. Cash voucher collected.",
        )
        session.add(delivery_3)

        payment_3 = Payment(
            id=uuid.uuid4(),
            order_id=order_3.id,
            shopkeeper_id=shop_user_1.id,
            amount=inv_totals_3["grand_total"],
            method=PaymentMethod.UPI,
            reference_number="UPI/2026/019283746",
            notes="Paid via PhonePe QR",
            paid_at=now - timedelta(days=2),
        )
        session.add(payment_3)

        # Commit everything
        await session.commit()

        print("\n=== Seed Completed Successfully! ===")
        print("------------------------------------------------------------")
        print("Super Admin:   superadmin@pharmacyfantasy.com / admin123")
        print("Admin:         admin@pharmacyfantasy.com       / admin123")
        print("Warehouse:     warehouse@pharmacyfantasy.com   / warehouse123")
        print("Delivery Boy:  delivery@pharmacyfantasy.com    / delivery123")
        print("Shopkeeper 1:  cheapmedical@pharmacyfantasy.com / shop123")
        print("Shopkeeper 2:  guptapharmacy@pharmacyfantasy.com / shop123")
        print("------------------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(seed_all())
