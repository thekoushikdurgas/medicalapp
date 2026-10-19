"""
Delivery Challan Service — Handles delivery challans, carton dispatch, and logistics returns.
"""

import uuid
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    DeliveryChallan,
    ChallanItem,
    ChallanReturn,
    ChallanReturnItem,
    Order,
    OrderStatus,
    StockBatch,
)
from app.core.logger import logger


async def generate_challan_number(session: AsyncSession) -> str:
    """Generate sequential delivery challan number: DC-YYYYMMDD-XXXX."""
    today_str = date.today().strftime("%Y%m%d")
    count_q = select(func.count(DeliveryChallan.id))
    current_count = (await session.execute(count_q)).scalar() or 0
    return f"DC-{today_str}-{(current_count + 1):04d}"


async def generate_challan_return_number(session: AsyncSession) -> str:
    """Generate sequential challan return number: CR-YYYYMMDD-XXXX."""
    today_str = date.today().strftime("%Y%m%d")
    count_q = select(func.count(ChallanReturn.id))
    current_count = (await session.execute(count_q)).scalar() or 0
    return f"CR-{today_str}-{(current_count + 1):04d}"


async def create_challan_for_order(
    session: AsyncSession,
    order_id: uuid.UUID,
    transporter_name: str | None,
    vehicle_number: str | None,
    total_cartons: int,
    created_by: uuid.UUID,
) -> DeliveryChallan:
    """
    Generate and save a DeliveryChallan for a packed order, creating line items
    corresponding to each packed batch item.
    """
    existing = await session.execute(
        select(DeliveryChallan).where(DeliveryChallan.order_id == order_id)
    )
    if existing.scalar_one_or_none():
        raise ValueError(f"Delivery Challan already exists for order {order_id}")

    order_result = await session.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise ValueError(f"Order {order_id} not found")

    challan_num = await generate_challan_number(session)
    challan = DeliveryChallan(
        order_id=order.id,
        challan_number=challan_num,
        challan_date=date.today(),
        transporter_name=transporter_name,
        vehicle_number=vehicle_number,
        total_cartons=max(1, total_cartons),
        created_by=created_by,
    )
    session.add(challan)
    await session.flush()

    for item in order.items:
        challan_item = ChallanItem(
            challan_id=challan.id,
            product_id=item.product_id,
            stock_batch_id=item.stock_batch_id or uuid.uuid4(),
            quantity=item.quantity,
            free_quantity=item.free_quantity,
        )
        session.add(challan_item)

    if order.status in (OrderStatus.CONFIRMED, OrderStatus.PICKING):
        order.status = OrderStatus.PACKED

    logger.info(
        f"Created delivery challan {challan_num} for order {order.order_number} "
        f"({total_cartons} cartons, transporter: {transporter_name})"
    )
    return challan


async def process_challan_return(
    session: AsyncSession,
    challan_id: uuid.UUID,
    return_items: list[dict],
    reason: str | None,
    processed_by: uuid.UUID,
) -> ChallanReturn:
    """
    Process returns from transit/delivery challan and restore stock to batches.
    return_items: list of dicts with keys: product_id, stock_batch_id, quantity
    """
    challan_result = await session.execute(
        select(DeliveryChallan).where(DeliveryChallan.id == challan_id)
    )
    challan = challan_result.scalar_one_or_none()
    if not challan:
        raise ValueError(f"Challan {challan_id} not found")

    return_num = await generate_challan_return_number(session)
    challan_return = ChallanReturn(
        challan_id=challan.id,
        return_number=return_num,
        return_date=date.today(),
        reason=reason,
        processed_by=processed_by,
    )
    session.add(challan_return)
    await session.flush()

    for r_item in return_items:
        qty = int(r_item["quantity"])
        p_id = uuid.UUID(str(r_item["product_id"]))
        b_id = uuid.UUID(str(r_item["stock_batch_id"]))

        line = ChallanReturnItem(
            challan_return_id=challan_return.id,
            product_id=p_id,
            stock_batch_id=b_id,
            quantity=qty,
        )
        session.add(line)

        # Restore physical stock batch
        batch_res = await session.execute(
            select(StockBatch).where(StockBatch.id == b_id)
        )
        batch = batch_res.scalar_one_or_none()
        if batch:
            batch.quantity_available += qty
            batch.quantity_sold = max(0, batch.quantity_sold - qty)

    logger.info(f"Processed challan return {return_num} for challan {challan.challan_number}")
    return challan_return
