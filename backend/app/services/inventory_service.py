"""
Inventory Service — Handles FEFO batch management, reservations, and expiry alerts.
"""

import uuid
from datetime import date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import StockBatch, Product
from app.core.logger import logger


class InsufficientStockError(Exception):
    pass


class BatchExpiryWarning(Exception):
    pass


async def get_fefo_batches_for_product(
    session: AsyncSession, product_id: uuid.UUID
) -> list[StockBatch]:
    """
    Fetch non-expired stock batches with available quantity in FEFO order (earliest expiry first).
    """
    today = date.today()
    query = (
        select(StockBatch)
        .where(
            and_(
                StockBatch.product_id == product_id,
                StockBatch.quantity_available > 0,
                StockBatch.expiry_date > today,
            )
        )
        .order_by(StockBatch.expiry_date.asc())
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def allocate_batch_fefo(
    session: AsyncSession, product_id: uuid.UUID, requested_quantity: int
) -> StockBatch:
    """
    Auto-allocate a single nearest-expiry batch that has sufficient available quantity.
    Updates batch.quantity_available and returns the allocated StockBatch.
    // ponytail: single-batch allocation per line item matches standard wholesale invoice practice.
    """
    batches = await get_fefo_batches_for_product(session, product_id)
    if not batches:
        prod_res = await session.execute(
            select(Product.name).where(Product.id == product_id)
        )
        prod_name = prod_res.scalar_one_or_none() or str(product_id)
        raise InsufficientStockError(
            f"No available stock batch found for product '{prod_name}'."
        )

    # Pick first batch with sufficient quantity
    allocated_batch = None
    for batch in batches:
        if batch.quantity_available >= requested_quantity:
            allocated_batch = batch
            break

    if not allocated_batch:
        total_avail = sum(b.quantity_available for b in batches)
        raise InsufficientStockError(
            f"Requested {requested_quantity} units, but highest single batch has only "
            f"{max(b.quantity_available for b in batches)} units (total available across batches: {total_avail})."
        )

    # Check 60-day shelf-life advisory
    days_to_expiry = (allocated_batch.expiry_date - date.today()).days
    if days_to_expiry < 60:
        logger.warning(
            f"FEFO allocation warning: Batch {allocated_batch.batch_number} expires in {days_to_expiry} days."
        )

    allocated_batch.quantity_available -= requested_quantity
    allocated_batch.quantity_sold += requested_quantity
    logger.info(
        f"Allocated batch {allocated_batch.batch_number} for product {product_id} "
        f"({requested_quantity} units, {allocated_batch.quantity_available} remaining)."
    )
    return allocated_batch


async def allocate_batches_fefo_multi(
    session: AsyncSession, product_id: uuid.UUID, requested_quantity: int
) -> list[tuple[StockBatch, int]]:
    """
    Auto-allocate stock across multiple non-expired batches in FEFO order if necessary.
    Returns a list of (StockBatch, allocated_quantity) pairs.
    """
    batches = await get_fefo_batches_for_product(session, product_id)
    if not batches:
        prod_res = await session.execute(
            select(Product.name).where(Product.id == product_id)
        )
        prod_name = prod_res.scalar_one_or_none() or str(product_id)
        raise InsufficientStockError(
            f"No available stock batch found for product '{prod_name}'."
        )

    total_avail = sum(b.quantity_available for b in batches)
    if total_avail < requested_quantity:
        prod_res = await session.execute(
            select(Product.name).where(Product.id == product_id)
        )
        prod_name = prod_res.scalar_one_or_none() or str(product_id)
        raise InsufficientStockError(
            f"Insufficient stock for '{prod_name}': requested {requested_quantity}, "
            f"total available across all batches is {total_avail}."
        )

    # First check if any single batch satisfies the requested quantity
    for batch in batches:
        if batch.quantity_available >= requested_quantity:
            batch.quantity_available -= requested_quantity
            batch.quantity_sold += requested_quantity
            return [(batch, requested_quantity)]

    # Otherwise, split greedily in FEFO order
    allocations: list[tuple[StockBatch, int]] = []
    remaining = requested_quantity
    for batch in batches:
        if remaining <= 0:
            break
        alloc_qty = min(batch.quantity_available, remaining)
        batch.quantity_available -= alloc_qty
        batch.quantity_sold += alloc_qty
        remaining -= alloc_qty
        allocations.append((batch, alloc_qty))

    return allocations


async def restore_batch_stock(
    session: AsyncSession, stock_batch_id: uuid.UUID, quantity: int
) -> None:
    """
    Restore available stock to a batch upon order cancellation.
    """
    result = await session.execute(
        select(StockBatch).where(StockBatch.id == stock_batch_id)
    )
    batch = result.scalar_one_or_none()
    if batch:
        batch.quantity_available += quantity
        batch.quantity_sold = max(0, batch.quantity_sold - quantity)
        logger.info(
            f"Restored {quantity} units to batch {batch.batch_number} "
            f"(new available: {batch.quantity_available})."
        )


async def record_purchase_entry(
    session: AsyncSession,
    supplier_name: str,
    invoice_number: str,
    invoice_date: date,
    entered_by: uuid.UUID,
    items_data: list,
    supplier_gstin: str | None = None,
) -> tuple[StockBatch, float]:
    """
    Ingest inbound supplier purchase bill (e.g. from MAA Medical Agency).
    Creates PurchaseEntry, PurchaseItems, and auto-generates StockBatch records.
    """
    from app.db.models import PurchaseEntry, PurchaseItem

    total_bill_amount = 0.0
    created_batches = []

    purchase_entry = PurchaseEntry(
        supplier_name=supplier_name,
        supplier_gstin=supplier_gstin,
        invoice_number=invoice_number,
        invoice_date=invoice_date,
        entered_by=entered_by,
        total_amount=0.0,
    )
    session.add(purchase_entry)
    await session.flush()

    for it in items_data:
        base = it["quantity"] * it["rate"]
        disc = base * (it.get("discount_pct", 0.0) / 100.0)
        taxable = base - disc
        sgst = taxable * (it.get("sgst_pct", 2.5) / 100.0)
        cgst = taxable * (it.get("cgst_pct", 2.5) / 100.0)
        line_total = taxable + sgst + cgst
        total_bill_amount += line_total

        total_received_units = it["quantity"] + it.get("free_quantity", 0)

        p_item = PurchaseItem(
            purchase_entry_id=purchase_entry.id,
            product_id=it["product_id"],
            batch_number=it["batch_number"],
            expiry_date=it["expiry_date"],
            hsn_code=it.get("hsn_code"),
            quantity=it["quantity"],
            free_quantity=it.get("free_quantity", 0),
            rate=it["rate"],
            mrp=it["mrp"],
            discount_pct=it.get("discount_pct", 0.0),
            sgst_pct=it.get("sgst_pct", 2.5),
            cgst_pct=it.get("cgst_pct", 2.5),
            line_total=round(line_total, 2),
        )
        session.add(p_item)

        # Upsert or create StockBatch
        existing_batch = await session.execute(
            select(StockBatch).where(
                and_(
                    StockBatch.product_id == it["product_id"],
                    StockBatch.batch_number == it["batch_number"],
                )
            )
        )
        batch = existing_batch.scalar_one_or_none()
        if batch:
            batch.quantity_available += total_received_units
            batch.quantity_received += total_received_units
            batch.purchase_rate = it["rate"]
            batch.mrp = it["mrp"]
            batch.supplier_invoice_no = invoice_number
        else:
            batch = StockBatch(
                product_id=it["product_id"],
                batch_number=it["batch_number"],
                expiry_date=it["expiry_date"],
                purchase_rate=it["rate"],
                mrp=it["mrp"],
                quantity_received=total_received_units,
                quantity_available=total_received_units,
                quantity_sold=0,
                supplier_invoice_no=invoice_number,
            )
            session.add(batch)

        created_batches.append(batch)

    purchase_entry.total_amount = round(total_bill_amount, 2)
    logger.info(
        f"Recorded purchase entry {invoice_number} from {supplier_name} "
        f"with {len(items_data)} items (Total: ₹{purchase_entry.total_amount})."
    )
    return purchase_entry
