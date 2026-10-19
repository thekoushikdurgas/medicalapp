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
    OrderStatus,
    StockBatch,
    ShopkeeperProfile,
    UserRole,
)
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    OrderType,
    PaginatedOrders,
    PlaceOrderInput,
    RateOrderInput,
    DashboardStats,
)
from app.services import order_service


def _order_to_type(order: Order) -> OrderType:
    otp = None
    if getattr(order, "delivery", None) and order.delivery.delivery_otp:
        otp = order.delivery.delivery_otp

    eta = None
    if order.status == OrderStatus.DISPATCHED:
        eta = "Expected today within 2–4 hours"
    elif order.status in (OrderStatus.CONFIRMED, OrderStatus.PACKED):
        eta = "Expected today before 6:00 PM"

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
        delivery_otp=otp,
        rating=getattr(order, "rating", None),
        feedback_text=getattr(order, "feedback_text", None),
        estimated_arrival_window=eta,
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
        info: Info,
        status: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PaginatedOrders:
        """List orders (scoped by role: Shopkeeper sees only their own; Admin/Warehouse sees all)."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            query = select(Order).options(selectinload(Order.delivery))
            if role == UserRole.SHOPKEEPER.value:
                query = query.where(Order.shopkeeper_id == uuid.UUID(user_id_str))
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
    async def order(self, info: Info, id: uuid.UUID) -> OrderType:
        """Get a single order by ID with tenant isolation."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            result = await session.execute(
                select(Order)
                .options(selectinload(Order.items), selectinload(Order.delivery))
                .where(Order.id == id)
            )
            order = result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")
            if role == UserRole.SHOPKEEPER.value and order.shopkeeper_id != uuid.UUID(
                user_id_str
            ):
                raise Exception("Order not found")
            return _order_to_type(order)

    @strawberry.field
    async def dashboard_stats(self, info: Info) -> DashboardStats:
        """Overview statistics for warehouse dashboard."""
        _get_caller(info)
        async with async_session_factory() as session:
            from datetime import date, timedelta

            total_q = select(func.count(Order.id))
            total_orders = (await session.execute(total_q)).scalar() or 0

            pending_q = select(func.count(Order.id)).where(
                Order.status.in_(
                    [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PICKING]
                )
            )
            pending_orders = (await session.execute(pending_q)).scalar() or 0

            today_start = datetime.now(timezone.utc).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            today_sales_q = select(
                func.coalesce(func.sum(Order.net_amount), 0.0)
            ).where(Order.placed_at >= today_start)
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

            out_q = select(
                func.coalesce(func.sum(ShopkeeperProfile.outstanding_balance), 0.0)
            )
            outstanding = float((await session.execute(out_q)).scalar() or 0.0)

            return DashboardStats(
                total_orders=total_orders,
                pending_orders=pending_orders,
                today_sales=round(today_sales, 2),
                low_stock_count=low_stock,
                expiring_batches_count=expiring,
                outstanding_payments=round(outstanding, 2),
            )


@strawberry.type
class OrderMutation:
    @strawberry.mutation
    async def place_order(
        self, info: Info, input: PlaceOrderInput, shopkeeper_id: uuid.UUID | None = None
    ) -> OrderType:
        """Place a new order (shopkeeper places for self; Admin can specify shopkeeper_id)."""
        user_id_str, role = _get_caller(info)
        if role == UserRole.SHOPKEEPER.value:
            actual_sk_id = uuid.UUID(user_id_str)
        elif role in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            if not shopkeeper_id:
                raise Exception(
                    "Shopkeeper ID is required when placing order as Admin."
                )
            actual_sk_id = shopkeeper_id
        else:
            raise Exception("Permission denied: You cannot place wholesale orders.")

        async with async_session_factory() as session:
            order = await order_service.place_order(
                session=session,
                shopkeeper_id=actual_sk_id,
                items_data=input.items,
                remarks=input.remarks,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def confirm_order(self, info: Info, order_id: uuid.UUID) -> OrderType:
        """Confirm a placed order (Super Admin, Ops Admin, or Warehouse Staff only)."""
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception(
                "Permission denied: Only Admin or Warehouse Staff can confirm orders."
            )

        confirmed_by = uuid.UUID(user_id_str)
        async with async_session_factory() as session:
            order = await order_service.confirm_order(
                session=session,
                order_id=order_id,
                confirmed_by=confirmed_by,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def update_order_status(
        self, info: Info, order_id: uuid.UUID, status: str
    ) -> OrderType:
        """Update order status (Admin or Warehouse staff only)."""
        _, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception(
                "Permission denied: Only Admin or Warehouse Staff can update order status."
            )

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
        self, info: Info, order_id: uuid.UUID, reason: str | None = None
    ) -> OrderType:
        """Cancel an order (Shopkeeper can cancel only if PLACED; Admin can cancel prior to dispatch)."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            result = await session.execute(select(Order).where(Order.id == order_id))
            target_order = result.scalar_one_or_none()
            if not target_order:
                raise Exception("Order not found")

            if role == UserRole.SHOPKEEPER.value:
                if target_order.shopkeeper_id != uuid.UUID(user_id_str):
                    raise Exception("Order not found")
                if target_order.status != OrderStatus.PLACED:
                    raise Exception(
                        f"Shopkeeper cannot cancel order in '{target_order.status.value}' status. Please contact support."
                    )
            elif role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
                raise Exception(
                    "Permission denied: You are not authorized to cancel orders."
                )

            order = await order_service.cancel_order(
                session=session,
                order_id=order_id,
                reason=reason,
            )
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def rate_order(self, info: Info, input: RateOrderInput) -> OrderType:
        """Rate a delivered order (1-5 stars) and submit qualitative feedback."""
        user_id_str, role = _get_caller(info)
        if role != UserRole.SHOPKEEPER.value:
            raise Exception(
                "Permission denied: Only the ordering shopkeeper can rate this delivery."
            )

        if input.rating < 1 or input.rating > 5:
            raise Exception("Rating must be between 1 and 5 stars.")

        async with async_session_factory() as session:
            result = await session.execute(
                select(Order).where(Order.id == input.order_id)
            )
            order = result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")

            if order.shopkeeper_id != uuid.UUID(user_id_str):
                raise Exception("Permission denied: You can only rate your own orders.")

            if order.status != OrderStatus.DELIVERED:
                raise Exception("Only delivered orders can be rated.")

            order.rating = input.rating
            if input.feedback:
                order.feedback_text = input.feedback

            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)

    @strawberry.mutation
    async def dispute_delivery(
        self, info: Info, order_id: uuid.UUID, reason: str
    ) -> OrderType:
        """Report delivery dispute / mis-delivered order for administrative investigation."""
        user_id_str, role = _get_caller(info)
        if role != UserRole.SHOPKEEPER.value:
            raise Exception(
                "Permission denied: Only the ordering chemist can dispute delivery."
            )

        async with async_session_factory() as session:
            result = await session.execute(select(Order).where(Order.id == order_id))
            order = result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")

            if order.shopkeeper_id != uuid.UUID(user_id_str):
                raise Exception(
                    "Permission denied: You can only dispute your own orders."
                )

            order.remarks = f"[DISPUTED DELIVERY: {reason}] - {order.remarks or ''}"
            await session.commit()
            await session.refresh(order)
            return _order_to_type(order)
