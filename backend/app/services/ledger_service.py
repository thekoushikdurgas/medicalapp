"""
Ledger Service — Handles party ledger recording, running balance audits, and financial statements.
"""

import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LedgerEntry, LedgerEntryType
from app.core.logger import logger


async def record_ledger_entry(
    session: AsyncSession,
    shopkeeper_id: uuid.UUID,
    entry_type: LedgerEntryType,
    amount: float,
    balance_after: float,
    reference_number: str,
    description: str,
) -> LedgerEntry:
    """
    Append an immutable financial ledger transaction for audit and monthly party statements.
    """
    entry = LedgerEntry(
        shopkeeper_id=shopkeeper_id,
        entry_type=entry_type,
        amount=round(amount, 2),
        balance_after=round(balance_after, 2),
        reference_number=reference_number,
        description=description,
    )
    session.add(entry)
    logger.info(
        f"Ledger [{entry_type.value}]: Shopkeeper {shopkeeper_id} - "
        f"Amt: ₹{amount:.2f}, Balance After: ₹{balance_after:.2f} ({reference_number})"
    )
    return entry


async def get_shopkeeper_ledger(
    session: AsyncSession,
    shopkeeper_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[LedgerEntry]:
    """
    Retrieve ledger entries for a shopkeeper ordered by date descending.
    """
    stmt = (
        select(LedgerEntry)
        .options(selectinload(LedgerEntry.shopkeeper))
        .where(LedgerEntry.shopkeeper_id == shopkeeper_id)
        .order_by(LedgerEntry.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
