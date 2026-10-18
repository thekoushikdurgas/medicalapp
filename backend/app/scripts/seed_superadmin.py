"""
Seed script — creates the initial Super Admin user.

Usage:
    python -m app.scripts.seed_superadmin
"""

import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models import User, UserRole
from app.db.session import async_session_factory


async def seed():
    async with async_session_factory() as session:
        # Check if super admin already exists
        result = await session.execute(
            select(User).where(User.role == UserRole.SUPER_ADMIN)
        )
        if result.scalar_one_or_none():
            print("Super Admin already exists. Skipping.")
            return

        admin = User(
            email="admin@pharmacyfantasy.com",
            password_hash=hash_password("admin123"),
            full_name="Super Admin",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print(f"Super Admin created: admin@pharmacyfantasy.com / admin123")
        print("⚠️  Change the password immediately in production!")


if __name__ == "__main__":
    asyncio.run(seed())
