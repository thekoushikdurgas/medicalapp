"""
Order resolvers — place, confirm, update status, cancel.
"""

import uuid
from datetime import datetime, timezone

import strawberry
from strawberry.types import Info
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.models import (
    Order,
    OrderItem,
    OrderStatus,
    Product,
    StockBatch,
    ShopkeeperProfile,
)
from app.db.session import async_session_factory
from app.graphql.types import (
    OrderType,
    PaginatedOrders,
    PlaceOrderInput,
    DashboardStats,
)


def _order_to_type(order: Order) -> OrderType:
    return OrderType(
        id=order.id,
        order_number=order.order_number,
        status=order.status.value,
        total_amount=float(order.total_amount),
        discount_amount=float(order.discount_amount),
        gst_amount=float(order.gst_amount),
        net_amount=float(order.net_amount),
        placed_at=order.placed_at,
        confirmed_at=order.confirmed_at,
        delivered_at=order.delivered_at,
        remarks=order.remarks,
    )


def _generate_order_number() -> str:
    """Generate a sequential order number (simplified)."""
    now = datetime.now(timezone.utc)
    return f"ORD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:10]}"


@strawberry.type
class OrderQuery:
    @strawberry.field
    async def orders(
        self,
        status: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PaginatedOrders:
        """List all orders (admin view)."""
        async with async_session_factory() as session:
            query = select(Order)
            if status:
                query = query.where(Order.status == status)
            query = query.order_by(Order.placed_at.desc())

            count_q = select(func.count()).select_from(query.subquery())
            total = (await session.execute(count_q)).scalar() or 0

            offset = (page - 1) * per_page
            query = query.offset(offset).limit(per_page)
            result = await session.execute(query)
            orders = result.scalars().all()

            return PaginatedOrders(
                items=[_order_to_type(o) for o in orders],
                total_count=total,
                has_next_page=(offset + per_page) < total,
            )

    @strawberry.field
    async def order(self, id: uuid.UUID) -> OrderType:
        """Get a single order by ID."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Order)
                .options(selectinload(Order.items))
                .where(Order.id == id)
            )
            order = result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")
            return _order_to_type(order)

    @strawberry.field
    async def dashboard_stats(self) -> DashboardStats:
        """Overview statistics for warehouse dashboard."""
        async with async_session_factory() as session:
            from datetime import date, timedelta
            total_q = select(func.count(Order.id))
            total_orders = (await session.execute(total_q)).scalar() or 0

            pending_q = select(func.count(Order.id)).where(
                Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PICKING])
            )
            pending_orders = (await session.execute(pending_q)).scalar() or 0

            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            today_sales_q = select(func.coalesce(func.sum(Order.net_amount), 0.0)).where(
                Order.placed_at >= today_start
            )
            today_sales = float((await session.execute(today_sales_q)).scalar() or 0.0)

            low_stock_q = select(func.count(StockBatch.id)).where(
                StockBatch.quantity_available < 100
            )
            low_stock = (await session.execute(low_stock_q)).scalar() or 0

            exp_threshold = date.today() + timedelta(days=90)
            exp_q = select(func.count(StockBatch.id)).where(
                StockBatch.expiry_date <= exp_threshold
            )
            expiring = (await session.execute(exp_q)).scalar() or 0

            out_q = select(func.coalesce(func.sum(ShopkeeperProfile.outstanding_balance), 0.0))
            outstanding = float((await session.execute(out_q)).scalar() or 0.0)

            return DashboardStats(
                total_orders=total_orders,
                pending_orders=pending_orders,
                today_sales=round(today_sales, 2),
                low_stock_count=low_stock,
                expiring_batches_count=expiring,
                outstanding_payments=round(outstanding, 2),
            )


from app.services import order_service


@strawberry.type
class OrderMutation:
    @strawberry.mutation
    async def place_order(
        self, input: PlaceOrderInput, shopkeeper_id: uuid.UUID
    ) -> OrderType:
        """Place a new order (shopkeeper action with credit limit validation)."""
        async with async_session_factory() as session:
            order = await order_service.place_order(
                session=session,
                shopkeeper_id=shopkeeper_id,
                items_data=input.items,
                remarks=input.remarks,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def confirm_order(self, order_id: uuid.UUID) -> OrderType:
        """Confirm a placed order (admin action with FEFO batch auto-allocation and GST invoice creation)."""
        async with async_session_factory() as session:
            order = await order_service.confirm_order(
                session=session,
                order_id=order_id,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def update_order_status(
        self, order_id: uuid.UUID, status: str
    ) -> OrderType:
        """Update order status (admin/warehouse action)."""
        async with async_session_factory() as session:
            new_status = OrderStatus(status)
            order = await order_service.update_order_status(
                session=session,
                order_id=order_id,
                new_status=new_status,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def cancel_order(
        self, order_id: uuid.UUID, reason: str | None = None
    ) -> OrderType:
        """Cancel an order (rolls back allocated batch stock)."""
        async with async_session_factory() as session:
            order = await order_service.cancel_order(
                session=session,
                order_id=order_id,
                reason=reason,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

