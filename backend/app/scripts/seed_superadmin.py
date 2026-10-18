"""
Seed script — creates the initial Super Admin user.

Usage:
    python -m app.scripts.seed_superadmin
"""

import asyncio
import os

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models import User, UserRole
from app.db.session import async_session_factory


async def seed():
    admin_email = os.getenv("SUPERADMIN_EMAIL")
    admin_password = os.getenv("SUPERADMIN_PASSWORD", "admin123")
    admin_name = os.getenv("SUPERADMIN_NAME", "Super Admin")

    if not admin_email:
        print("No SUPERADMIN_EMAIL provided. Skipping Super Admin creation.")
        print("To create a super admin, run with: SUPERADMIN_EMAIL=your_email@example.com python -m app.scripts.seed_superadmin")
        return

    async with async_session_factory() as session:
        # Check if super admin already exists
        result = await session.execute(
            select(User).where(User.email == admin_email)
        )
        if result.scalar_one_or_none():
            print(f"Super Admin ({admin_email}) already exists. Skipping.")
            return

        admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            full_name=admin_name,
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print(f"Super Admin created: {admin_email} / {admin_password}")
        print("⚠️  Change the password immediately in production!")


if __name__ == "__main__":
    asyncio.run(seed())
