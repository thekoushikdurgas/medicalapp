"""
Invoice Service — Handles legal GST invoice creation, calculations, and numbering.
"""

from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Invoice, Order
from app.core.logger import logger


async def generate_invoice_number(session: AsyncSession) -> str:
    """Generate sequential invoice number: INV-YYYYMMDD-XXXX."""
    today_str = date.today().strftime("%Y%m%d")
    count_q = select(func.count(Invoice.id))
    current_count = (await session.execute(count_q)).scalar() or 0
    return f"INV-{today_str}-{(current_count + 1):04d}"


async def create_invoice_for_order(session: AsyncSession, order: Order) -> Invoice:
    """
    Generate and save an Invoice record for a confirmed wholesale order.
    """
    # Check if invoice already exists
    existing = await session.execute(
        select(Invoice).where(Invoice.order_id == order.id)
    )
    if existing.scalar_one_or_none():
        raise ValueError(f"Invoice already exists for order {order.order_number}")

    inv_number = await generate_invoice_number(session)
    invoice = Invoice(
        order_id=order.id,
        invoice_number=inv_number,
        invoice_date=date.today(),
        subtotal=order.total_amount,
        total_discount=order.discount_amount,
        total_sgst=round(order.gst_amount / 2, 2),
        total_cgst=round(order.gst_amount / 2, 2),
        grand_total=order.net_amount,
    )
    session.add(invoice)
    logger.info(
        f"Created invoice {inv_number} for order {order.order_number} (Grand Total: {order.net_amount})"
    )
    return invoice
