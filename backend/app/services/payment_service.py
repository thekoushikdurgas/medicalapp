"""
Payment Service — Handles advance deposits, retailer balance credits, and payment receipts.
"""

import uuid
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AdvancePayment,
    PaymentMethod,
    ShopkeeperProfile,
    User,
    LedgerEntryType,
)
from app.services.ledger_service import record_ledger_entry
from app.core.logger import logger


async def generate_receipt_number(session: AsyncSession) -> str:
    """Generate sequential advance receipt number: ADV-YYYYMMDD-XXXX."""
    today_str = date.today().strftime("%Y%m%d")
    count_q = select(func.count(AdvancePayment.id))
    current_count = (await session.execute(count_q)).scalar() or 0
    return f"ADV-{today_str}-{(current_count + 1):04d}"


async def record_advance_payment(
    session: AsyncSession,
    shopkeeper_id: uuid.UUID,
    amount: float,
    payment_method: PaymentMethod,
    reference_no: str | None,
    notes: str | None,
    recorded_by: uuid.UUID,
) -> AdvancePayment:
    """
    Record an advance deposit/payment from a retail shopkeeper and adjust
    their outstanding ledger balance.
    """
    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")

    user_res = await session.execute(select(User).where(User.id == shopkeeper_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise ValueError(f"Shopkeeper user {shopkeeper_id} not found")

    sp_res = await session.execute(
        select(ShopkeeperProfile).where(ShopkeeperProfile.user_id == shopkeeper_id)
    )
    profile = sp_res.scalar_one_or_none()
    if not profile:
        raise ValueError(f"Shopkeeper profile for user {shopkeeper_id} not found")

    receipt_num = await generate_receipt_number(session)
    payment = AdvancePayment(
        receipt_number=receipt_num,
        shopkeeper_id=shopkeeper_id,
        amount=amount,
        payment_method=payment_method,
        reference_no=reference_no,
        notes=notes,
        recorded_by=recorded_by,
    )
    session.add(payment)

    new_balance = max(0.0, float(profile.outstanding_balance) - amount)
    profile.outstanding_balance = new_balance

    await record_ledger_entry(
        session=session,
        shopkeeper_id=shopkeeper_id,
        entry_type=LedgerEntryType.CREDIT,
        amount=amount,
        balance_after=new_balance,
        reference_number=receipt_num,
        description=f"Advance Deposit Receipt ({payment_method.value})",
    )

    logger.info(
        f"Recorded advance payment {receipt_num} of ₹{amount:.2f} for {profile.shop_name} "
        f"(New Balance: ₹{new_balance:.2f})"
    )
    return payment
