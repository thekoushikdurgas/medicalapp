"""
Return Service — Handles GST credit notes, invoice returns, tax reversals, and retailer ledger credit.
"""

import uuid
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Invoice,
    InvoiceReturn,
    InvoiceReturnItem,
    Order,
    ShopkeeperProfile,
    StockBatch,
    LedgerEntryType,
)
from app.services.ledger_service import record_ledger_entry
from app.core.logger import logger


async def generate_credit_note_number(session: AsyncSession) -> str:
    """Generate sequential credit note number: CRN-YYYYMMDD-XXXX."""
    today_str = date.today().strftime("%Y%m%d")
    count_q = select(func.count(InvoiceReturn.id))
    current_count = (await session.execute(count_q)).scalar() or 0
    return f"CRN-{today_str}-{(current_count + 1):04d}"


async def create_invoice_return(
    session: AsyncSession,
    invoice_id: uuid.UUID,
    return_items: list[dict],
    restock_status: str,  # "RESTOCKED" or "QUARANTINED"
    reason: str | None,
    created_by: uuid.UUID,
) -> InvoiceReturn:
    """
    Generate an official GST Credit Note (InvoiceReturn) with reverse GST calculation
    and credit the retailer's outstanding balance.
    """
    invoice_res = await session.execute(
        select(Invoice).options(selectinload(Invoice.order)).where(Invoice.id == invoice_id)
    )
    invoice = invoice_res.scalar_one_or_none()
    if not invoice:
        raise ValueError(f"Invoice {invoice_id} not found")

    crn_number = await generate_credit_note_number(session)

    refund_subtotal = 0.0
    refund_sgst = 0.0
    refund_cgst = 0.0

    parsed_lines = []
    for item in return_items:
        p_id = uuid.UUID(str(item["product_id"]))
        b_id = uuid.UUID(str(item["stock_batch_id"]))
        qty = int(item["quantity"])
        rate = float(item["rate"])
        discount_pct = float(item.get("discount_pct", 0.0))

        line_sub = round(qty * rate * (1.0 - discount_pct / 100.0), 2)
        line_sgst = round(line_sub * 0.025, 2)
        line_cgst = round(line_sub * 0.025, 2)

        refund_subtotal += line_sub
        refund_sgst += line_sgst
        refund_cgst += line_cgst

        parsed_lines.append(
            {
                "product_id": p_id,
                "stock_batch_id": b_id,
                "quantity": qty,
                "rate": rate,
                "discount_pct": discount_pct,
            }
        )

    grand_refund = round(refund_subtotal + refund_sgst + refund_cgst, 2)

    credit_note = InvoiceReturn(
        invoice_id=invoice.id,
        credit_note_no=crn_number,
        return_date=date.today(),
        refund_subtotal=refund_subtotal,
        refund_sgst=refund_sgst,
        refund_cgst=refund_cgst,
        grand_refund=grand_refund,
        reason=reason,
        restock_status=restock_status,
        created_by=created_by,
    )
    session.add(credit_note)
    await session.flush()

    for pl in parsed_lines:
        line_record = InvoiceReturnItem(
            invoice_return_id=credit_note.id,
            product_id=pl["product_id"],
            stock_batch_id=pl["stock_batch_id"],
            quantity=pl["quantity"],
            rate=pl["rate"],
            discount_pct=pl["discount_pct"],
        )
        session.add(line_record)

        # Restock if requested
        if restock_status == "RESTOCKED":
            b_res = await session.execute(
                select(StockBatch).where(StockBatch.id == pl["stock_batch_id"])
            )
            batch = b_res.scalar_one_or_none()
            if batch:
                batch.quantity_available += pl["quantity"]
                batch.quantity_sold = max(0, batch.quantity_sold - pl["quantity"])

    # Credit retailer's outstanding balance
    if invoice.order:
        sp_res = await session.execute(
            select(ShopkeeperProfile).where(
                ShopkeeperProfile.user_id == invoice.order.shopkeeper_id
            )
        )
        profile = sp_res.scalar_one_or_none()
        if profile:
            new_balance = max(0.0, float(profile.outstanding_balance) - grand_refund)
            profile.outstanding_balance = new_balance

            await record_ledger_entry(
                session=session,
                shopkeeper_id=invoice.order.shopkeeper_id,
                entry_type=LedgerEntryType.CREDIT,
                amount=grand_refund,
                balance_after=new_balance,
                reference_number=crn_number,
                description=f"GST Credit Note for invoice {invoice.invoice_number}",
            )

            logger.info(
                f"Updated shopkeeper {profile.shop_name} outstanding balance to ₹{new_balance:.2f} "
                f"after credit note {crn_number}"
            )

    logger.info(
        f"Issued credit note {crn_number} for invoice {invoice.invoice_number} "
        f"(Grand Refund: ₹{grand_refund:.2f})"
    )
    return credit_note
