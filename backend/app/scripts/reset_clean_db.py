"""
Database Reset and Super Admin Provisioning Script.
Purges all demo data and demo users, then creates the primary Super Admin account.

Usage:
    python -m app.scripts.reset_clean_db
"""

import asyncio
import os
import uuid

from sqlalchemy import text, select, func
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import User, UserRole
from app.db.session import engine, async_session_factory


async def reset_and_seed():
    admin_email = os.getenv("SUPERADMIN_EMAIL")
    admin_password = os.getenv("SUPERADMIN_PASSWORD", "admin123")
    admin_name = os.getenv("SUPERADMIN_NAME", "Super Admin")

    print("[*] Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[*] Truncating all data tables (removing all users and records)...")
    tables_to_truncate = [
        "payments",
        "delivery_assignments",
        "invoices",
        "order_items",
        "orders",
        "stock_batches",
        "purchase_items",
        "purchase_entries",
        "products",
        "shopkeeper_profiles",
        "delivery_profiles",
        "users",
    ]

    async with engine.begin() as conn:
        truncate_sql = (
            f"TRUNCATE TABLE {', '.join(tables_to_truncate)} RESTART IDENTITY CASCADE;"
        )
        await conn.execute(text(truncate_sql))
    print("    -> All data tables truncated cleanly.")

    if admin_email:
        print(f"[*] Provisioning Super Admin: {admin_email}...")
        async with async_session_factory() as session:
            super_admin = User(
                id=uuid.uuid4(),
                email=admin_email,
                phone=os.getenv("SUPERADMIN_PHONE", "9614081313"),
                password_hash=hash_password(admin_password),
                full_name=admin_name,
                role=UserRole.SUPER_ADMIN,
                is_active=True,
            )
            session.add(super_admin)
            await session.commit()

            # Verification query
            user_count = await session.scalar(select(func.count()).select_from(User))
            print("\n" + "=" * 50)
            print("✅ DATABASE CLEANUP & SUPER ADMIN INITIALIZED")
            print("=" * 50)
            print(f"• Active Users in DB: {user_count}")
            print(f"• Super Admin Email:  {admin_email}")
            print(f"• Super Admin Role:   {UserRole.SUPER_ADMIN.value}")
            print("=" * 50 + "\n")
    else:
        print("\n" + "=" * 50)
        print("✅ DATABASE PURGED — 0 USERS REMAINING")
        print("=" * 50 + "\n")


if __name__ == "__main__":
    asyncio.run(reset_and_seed())
