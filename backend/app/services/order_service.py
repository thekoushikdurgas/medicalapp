"""
Order Service — Handles order lifecycle, credit limit checks, batch reservations, and state machine transitions.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ShopkeeperProfile,
    LedgerEntryType,
)
from app.utils.gst import calculate_line_total
from app.services.inventory_service import (
    allocate_batch_fefo,
    restore_batch_stock,
    allocate_batches_fefo_multi,
)
from app.services.invoice_service import create_invoice_for_order
from app.services.ledger_service import record_ledger_entry
from app.core.logger import logger


class OrderDomainError(Exception):
    pass


class CreditLimitExceededError(OrderDomainError):
    pass


def generate_order_number() -> str:
    now = datetime.now(timezone.utc)
    return f"ORD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:10]}"


async def place_order(
    session: AsyncSession,
    shopkeeper_id: uuid.UUID,
    items_data: list,
    remarks: str | None = None,
) -> Order:
    """
    Validate shopkeeper credit limit, compute line totals with statutory GST, and create PLACED order.
    """
    # 1. Fetch shopkeeper profile to verify credit limit and KYC status
    sk_result = await session.execute(
        select(ShopkeeperProfile).where(ShopkeeperProfile.user_id == shopkeeper_id)
    )
    sk_profile = sk_result.scalar_one_or_none()

    if sk_profile:
        v_status = getattr(sk_profile, "verification_status", "VERIFIED") or "VERIFIED"
        if v_status in ("SUSPENDED", "REJECTED"):
            notes = getattr(sk_profile, "verification_notes", None)
            raise OrderDomainError(
                f"Ordering blocked: Pharmacy account verification status is '{v_status}'. "
                f"Reason: {notes or 'Please contact distributor operations admin.'}"
            )

    # Pre-calculate estimated items to get order total
    line_computations = []
    total_base = 0.0
    total_discount = 0.0
    total_tax = 0.0
    total_net = 0.0

    for item_input in items_data:
        prod_result = await session.execute(
            select(Product).where(Product.id == item_input.product_id)
        )
        product = prod_result.scalar_one_or_none()
        if not product:
            raise OrderDomainError(f"Product {item_input.product_id} not found.")

        rate = float(product.default_mrp or 0.0)
        calc = calculate_line_total(
            quantity=item_input.quantity,
            rate=rate,
            discount1_pct=0.0,
            discount2_pct=0.0,
            sgst_pct=float(product.default_sgst_rate or 2.5),
            cgst_pct=float(product.default_cgst_rate or 2.5),
        )

        line_computations.append((product, item_input.quantity, rate, calc))
        total_base += calc["base_amount"]
        total_discount += calc["discount"]
        total_tax += calc["sgst"] + calc["cgst"]
        total_net += calc["total"]

    # Check credit limit if profile exists
    if sk_profile:
        lim = float(sk_profile.credit_limit or 0.0)
        curr_out = float(sk_profile.outstanding_balance or 0.0)
        projected_balance = curr_out + total_net
        if lim > 0 and projected_balance > lim:
            raise CreditLimitExceededError(
                f"Credit limit exceeded. Current outstanding: ₹{curr_out:,.2f}, "
                f"Order net: ₹{total_net:,.2f}, Limit: ₹{lim:,.2f}."
            )

    order = Order(
        order_number=generate_order_number(),
        shopkeeper_id=shopkeeper_id,
        status=OrderStatus.PLACED,
        placed_at=datetime.now(timezone.utc),
        remarks=remarks,
        total_amount=round(total_base, 2),
        discount_amount=round(total_discount, 2),
        gst_amount=round(total_tax, 2),
        net_amount=round(total_net, 2),
    )
    session.add(order)
    await session.flush()

    for product, qty, rate, calc in line_computations:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            rate=rate,
            mrp=rate,
            discount1_pct=0.0,
            discount2_pct=0.0,
            sgst_pct=float(product.default_sgst_rate or 2.5),
            cgst_pct=float(product.default_cgst_rate or 2.5),
            sgst_amount=calc["sgst"],
            cgst_amount=calc["cgst"],
            line_total=calc["total"],
        )
        session.add(order_item)

    logger.info(f"Order {order.order_number} placed by shopkeeper {shopkeeper_id} (Net: ₹{order.net_amount})")
    return order


async def confirm_order(
    session: AsyncSession, order_id: uuid.UUID, confirmed_by: uuid.UUID | None = None
) -> Order:
    """
    Confirm a placed order:
    1. Validates status == PLACED.
    2. Runs FEFO batch auto-allocation for each item, reserving stock.
    3. Auto-generates statutory GST invoice.
    4. Sets order status to CONFIRMED.
    """
    result = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise OrderDomainError("Order not found.")
    if order.status != OrderStatus.PLACED:
        raise OrderDomainError(f"Cannot confirm order in {order.status.value} status.")

    # Run FEFO batch allocation for each order line
    items_to_process = list(order.items)
    for item in items_to_process:
        allocations = await allocate_batches_fefo_multi(
            session=session,
            product_id=item.product_id,
            requested_quantity=item.quantity,
        )
        first_batch, first_qty = allocations[0]
        item.stock_batch_id = first_batch.id
        item.quantity = first_qty
        item.mrp = float(first_batch.mrp)
        item.rate = float(first_batch.purchase_rate) if first_batch.purchase_rate else item.rate
        calc1 = calculate_line_total(
            quantity=first_qty,
            rate=item.rate,
            discount1_pct=float(item.discount1_pct or 0.0),
            discount2_pct=float(item.discount2_pct or 0.0),
            sgst_pct=float(item.sgst_pct or 2.5),
            cgst_pct=float(item.cgst_pct or 2.5),
        )
        item.sgst_amount = calc1["sgst"]
        item.cgst_amount = calc1["cgst"]
        item.line_total = calc1["total"]

        for extra_batch, extra_qty in allocations[1:]:
            calc_extra = calculate_line_total(
                quantity=extra_qty,
                rate=float(extra_batch.purchase_rate) if extra_batch.purchase_rate else item.rate,
                discount1_pct=float(item.discount1_pct or 0.0),
                discount2_pct=float(item.discount2_pct or 0.0),
                sgst_pct=float(item.sgst_pct or 2.5),
                cgst_pct=float(item.cgst_pct or 2.5),
            )
            extra_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                stock_batch_id=extra_batch.id,
                quantity=extra_qty,
                rate=float(extra_batch.purchase_rate) if extra_batch.purchase_rate else item.rate,
                mrp=float(extra_batch.mrp),
                discount1_pct=item.discount1_pct,
                discount2_pct=item.discount2_pct,
                sgst_pct=item.sgst_pct,
                cgst_pct=item.cgst_pct,
                sgst_amount=calc_extra["sgst"],
                cgst_amount=calc_extra["cgst"],
                line_total=calc_extra["total"],
            )
            session.add(extra_item)
            order.items.append(extra_item)

    # Recalculate order totals if lines split
    order.total_amount = round(sum(i.line_total for i in order.items), 2)
    order.net_amount = round(sum(i.line_total for i in order.items), 2)

    # Create legal GST invoice
    await create_invoice_for_order(session, order)

    order.status = OrderStatus.CONFIRMED
    order.confirmed_at = datetime.now(timezone.utc)
    if confirmed_by:
        order.confirmed_by = confirmed_by

    logger.info(f"Order {order.order_number} confirmed with FEFO batch allocations and GST invoice generated.")
    return order


async def update_order_status(
    session: AsyncSession, order_id: uuid.UUID, new_status: OrderStatus
) -> Order:
    """
    Transition order state machine and handle delivery reconciliation.
    """
    result = await session.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise OrderDomainError("Order not found.")

    order.status = new_status
    if new_status == OrderStatus.DELIVERED:
        order.delivered_at = datetime.now(timezone.utc)

        # Update shopkeeper outstanding balance
        sk_result = await session.execute(
            select(ShopkeeperProfile).where(ShopkeeperProfile.user_id == order.shopkeeper_id)
        )
        sk = sk_result.scalar_one_or_none()
        if sk:
            sk.outstanding_balance = float(sk.outstanding_balance) + float(order.net_amount)
            await record_ledger_entry(
                session=session,
                shopkeeper_id=order.shopkeeper_id,
                entry_type=LedgerEntryType.DEBIT,
                amount=float(order.net_amount),
                balance_after=float(sk.outstanding_balance),
                reference_number=order.order_number,
                description=f"Delivery & Invoice for order {order.order_number}",
            )
            logger.info(f"Updated shopkeeper {sk.shop_name} outstanding balance to ₹{sk.outstanding_balance:,.2f}")

    logger.info(f"Order {order.order_number} updated to status {new_status.value}")
    return order


async def cancel_order(
    session: AsyncSession, order_id: uuid.UUID, reason: str | None = None
) -> Order:
    """
    Cancel an order:
    If order was CONFIRMED, PICKING, or PACKED, restitution: restores reserved batch quantities atomically.
    """
    result = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise OrderDomainError("Order not found.")

    if order.status in (OrderStatus.DELIVERED, OrderStatus.CANCELLED):
        raise OrderDomainError(f"Cannot cancel order in {order.status.value} state.")

    # Restitution: rollback allocated batch stock if already allocated
    if order.status in (OrderStatus.CONFIRMED, OrderStatus.PICKING, OrderStatus.PACKED):
        for item in order.items:
            if item.stock_batch_id:
                await restore_batch_stock(session, item.stock_batch_id, item.quantity)
                item.stock_batch_id = None

    order.status = OrderStatus.CANCELLED
    if reason:
        order.remarks = f"{order.remarks or ''} [Cancelled: {reason}]".strip()

    logger.info(f"Order {order.order_number} cancelled (stock allocations rolled back).")
    return order
