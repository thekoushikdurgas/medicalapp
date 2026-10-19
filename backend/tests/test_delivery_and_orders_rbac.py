"""
Unit tests for Orders & Delivery RBAC, OTP Handshake, and Multi-Batch Allocation.
"""

import uuid
import pytest
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import (
    DeliveryAssignment,
    DeliveryStatus,
    NonDeliveryReason,
    Order,
    OrderStatus,
    ShopkeeperProfile,
    StockBatch,
    UserRole,
)
from app.services.inventory_service import (
    allocate_batches_fefo_multi,
    InsufficientStockError,
)
from app.graphql.resolvers.orders import OrderMutation, OrderQuery
from app.graphql.resolvers.delivery import DeliveryMutation, DeliveryQuery
from app.graphql.resolvers.notifications import NotificationMutation
from app.graphql.types import (
    CompleteDeliveryInput,
    ReportDeliveryFailureInput,
    RateOrderInput,
    UpdateNotificationPreferencesInput,
)


def make_mock_info(
    user_id: str | None = None, role: str | None = None, has_auth_header: bool = True
):
    info = MagicMock()
    if not has_auth_header and user_id is None:
        info.context = {}
        return info

    info.context = {
        "user_id": user_id,
        "role": role,
    }
    return info


class TestMultiBatchFEFOAllocation:
    @pytest.mark.asyncio
    async def test_multi_batch_split_allocates_across_batches(self):
        """When requested quantity (50) exceeds any single batch (30 and 40), it splits in FEFO order."""
        prod_id = uuid.uuid4()
        today = date.today()

        # Batch 1 expires in 20 days, has 30 units
        b1 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B1_EARLY",
            expiry_date=today + timedelta(days=20),
            quantity_available=30,
            quantity_sold=0,
            purchase_rate=100.0,
            mrp=150.0,
        )
        # Batch 2 expires in 60 days, has 40 units
        b2 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B2_LATER",
            expiry_date=today + timedelta(days=60),
            quantity_available=40,
            quantity_sold=0,
            purchase_rate=105.0,
            mrp=150.0,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [b1, b2]
        mock_session.execute.return_value = mock_result

        allocations = await allocate_batches_fefo_multi(
            mock_session, prod_id, requested_quantity=50
        )

        assert len(allocations) == 2
        # First batch gives all 30
        assert allocations[0][0].batch_number == "B1_EARLY"
        assert allocations[0][1] == 30
        assert b1.quantity_available == 0
        assert b1.quantity_sold == 30

        # Second batch gives remaining 20
        assert allocations[1][0].batch_number == "B2_LATER"
        assert allocations[1][1] == 20
        assert b2.quantity_available == 20
        assert b2.quantity_sold == 20

    @pytest.mark.asyncio
    async def test_multi_batch_insufficient_total_raises(self):
        """When total across all batches is less than requested, raises InsufficientStockError."""
        prod_id = uuid.uuid4()
        today = date.today()

        b1 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B1",
            expiry_date=today + timedelta(days=20),
            quantity_available=10,
            quantity_sold=0,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [b1]
        mock_session.execute.return_value = mock_result

        with pytest.raises(InsufficientStockError, match="Insufficient stock"):
            await allocate_batches_fefo_multi(
                mock_session, prod_id, requested_quantity=50
            )


class TestDeliveryOTPAndCOD:
    @pytest.mark.asyncio
    async def test_assign_delivery_generates_otp_and_sets_dispatched(self):
        """Admin assigning delivery creates assignment with a 4-digit OTP and marks order DISPATCHED."""
        admin_id = str(uuid.uuid4())
        boy_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-101",
            status=OrderStatus.CONFIRMED,
        )

        mock_session = AsyncMock()
        # Call 1: Order lookup
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = order
        # Call 2: Existing assignment check
        mock_res2 = MagicMock()
        mock_res2.scalar_one_or_none.return_value = None
        mock_session.execute.side_effect = [mock_res1, mock_res2]

        info = make_mock_info(user_id=admin_id, role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.delivery.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await DeliveryMutation().assign_delivery(
                info, order_id=order_id, delivery_boy_id=boy_id
            )

            assert res.status == "ASSIGNED"
            assert res.delivery_otp is not None
            assert len(res.delivery_otp) == 4
            assert order.status == OrderStatus.DISPATCHED

    @pytest.mark.asyncio
    async def test_complete_delivery_with_valid_otp_and_cash_collection(self):
        """Completing delivery with valid OTP updates status to DELIVERED and records collected payment."""
        boy_id = uuid.uuid4()
        sk_id = uuid.uuid4()
        order_id = uuid.uuid4()
        assignment_id = uuid.uuid4()

        sk_profile = ShopkeeperProfile(
            user_id=sk_id,
            shop_name="Good Health Pharmacy",
            outstanding_balance=1000.0,
        )
        order = Order(
            id=order_id,
            order_number="ORD-202",
            shopkeeper_id=sk_id,
            status=OrderStatus.DISPATCHED,
            net_amount=500.0,
        )
        assignment = DeliveryAssignment(
            id=assignment_id,
            order_id=order_id,
            delivery_boy_id=boy_id,
            status=DeliveryStatus.ASSIGNED,
            delivery_otp="5821",
            order=order,
        )

        mock_session = AsyncMock()
        # Call 1: Assignment lookup
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = assignment
        # Call 2: Shopkeeper profile lookup
        mock_res2 = MagicMock()
        mock_res2.scalar_one_or_none.return_value = sk_profile
        mock_session.execute.side_effect = [mock_res1, mock_res2]

        info = make_mock_info(user_id=str(boy_id), role=UserRole.DELIVERY.value)
        input_data = CompleteDeliveryInput(
            assignment_id=assignment_id,
            otp="5821",
            cash_collected=500.0,
            upi_collected=0.0,
            notes="Delivered to counter staff",
        )

        with patch(
            "app.graphql.resolvers.delivery.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await DeliveryMutation().complete_delivery_with_otp(info, input_data)

            assert res.status == "DELIVERED"
            assert order.status == OrderStatus.DELIVERED
            # Balance: was 1000 + 500 (invoice) - 500 (cash collected) = 1000.0
            assert sk_profile.outstanding_balance == 1000.0
            # Payment was added to session
            assert mock_session.add.call_count >= 1

    @pytest.mark.asyncio
    async def test_complete_delivery_with_invalid_otp_rejected(self):
        """Invalid OTP raises exception and blocks delivery completion."""
        boy_id = uuid.uuid4()
        assignment_id = uuid.uuid4()

        assignment = DeliveryAssignment(
            id=assignment_id,
            delivery_boy_id=boy_id,
            status=DeliveryStatus.ASSIGNED,
            delivery_otp="9999",
        )

        mock_session = AsyncMock()
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = assignment
        mock_session.execute.return_value = mock_res1

        info = make_mock_info(user_id=str(boy_id), role=UserRole.DELIVERY.value)
        input_data = CompleteDeliveryInput(
            assignment_id=assignment_id,
            otp="1234",  # WRONG OTP
        )

        with patch(
            "app.graphql.resolvers.delivery.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            with pytest.raises(Exception, match="Invalid Delivery OTP"):
                await DeliveryMutation().complete_delivery_with_otp(info, input_data)

    @pytest.mark.asyncio
    async def test_report_delivery_failure_with_standard_reason(self):
        """Delivery boy reports failure with standard enum (SHOP_CLOSED) and attaches photo proof."""
        boy_id = uuid.uuid4()
        assignment_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-FAIL-1",
            status=OrderStatus.DISPATCHED,
        )
        assignment = DeliveryAssignment(
            id=assignment_id,
            order_id=order_id,
            delivery_boy_id=boy_id,
            status=DeliveryStatus.IN_TRANSIT,
            order=order,
        )

        mock_session = AsyncMock()
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = assignment
        mock_session.execute.return_value = mock_res1

        info = make_mock_info(user_id=str(boy_id), role=UserRole.DELIVERY.value)
        input_data = ReportDeliveryFailureInput(
            assignment_id=assignment_id,
            reason="SHOP_CLOSED",
            notes="Shop shutter closed at 1:30 PM",
            photo_url="https://s3.amazonaws.com/pod/closed_shutter.jpg",
        )

        with patch(
            "app.graphql.resolvers.delivery.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await DeliveryMutation().report_delivery_failure(info, input_data)

            assert res.status == "FAILED"
            assert assignment.status == DeliveryStatus.FAILED
            assert assignment.failure_reason == NonDeliveryReason.SHOP_CLOSED
            assert (
                assignment.failure_photo_url
                == "https://s3.amazonaws.com/pod/closed_shutter.jpg"
            )
            # Order reverted to CONFIRMED for warehouse/ops attention
            assert order.status == OrderStatus.CONFIRMED

    @pytest.mark.asyncio
    async def test_delivery_shift_summary_calculation(self):
        """Delivery shift summary returns accurate delivered, failed, and cash remittance numbers."""
        boy_id = uuid.uuid4()
        a1 = DeliveryAssignment(
            id=uuid.uuid4(),
            delivery_boy_id=boy_id,
            status=DeliveryStatus.DELIVERED,
            cash_collected=1500.0,
            upi_collected=500.0,
        )
        a2 = DeliveryAssignment(
            id=uuid.uuid4(),
            delivery_boy_id=boy_id,
            status=DeliveryStatus.FAILED,
            cash_collected=0.0,
            upi_collected=0.0,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalars.return_value.all.return_value = [a1, a2]
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(boy_id), role=UserRole.DELIVERY.value)

        with patch(
            "app.graphql.resolvers.delivery.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            summary = await DeliveryQuery().delivery_shift_summary(info)

            assert summary.total_assigned == 2
            assert summary.total_delivered == 1
            assert summary.total_failed == 1
            assert summary.cash_collected == 1500.0
            assert summary.upi_collected == 500.0
            assert summary.total_collected == 2000.0
            assert summary.pending_handover == 1500.0


class TestOrderRBACAndDataIsolation:
    @pytest.mark.asyncio
    async def test_shopkeeper_cannot_view_other_shopkeeper_order(self):
        """Shopkeeper cannot view another shopkeeper's order."""
        sk1_id = uuid.uuid4()
        sk2_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order_of_sk2 = Order(
            id=order_id,
            order_number="ORD-SK2",
            shopkeeper_id=sk2_id,
            status=OrderStatus.PLACED,
            total_amount=500.0,
            discount_amount=0.0,
            gst_amount=25.0,
            net_amount=525.0,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order_of_sk2
        mock_session.execute.return_value = mock_res

        # Caller is sk1
        info = make_mock_info(user_id=str(sk1_id), role=UserRole.SHOPKEEPER.value)

        with patch(
            "app.graphql.resolvers.orders.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            with pytest.raises(Exception, match="Order not found"):
                await OrderQuery().order(info, id=order_id)

    @pytest.mark.asyncio
    async def test_shopkeeper_cannot_cancel_confirmed_order(self):
        """Shopkeeper cannot cancel an order once CONFIRMED/PACKED."""
        sk_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-CONFIRMED",
            shopkeeper_id=sk_id,
            status=OrderStatus.CONFIRMED,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)

        with patch(
            "app.graphql.resolvers.orders.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            with pytest.raises(
                Exception, match="Shopkeeper cannot cancel order in 'CONFIRMED' status"
            ):
                await OrderMutation().cancel_order(info, order_id=order_id)

    @pytest.mark.asyncio
    async def test_shopkeeper_rate_delivered_order(self):
        """Shopkeeper can rate a DELIVERED order and provide feedback."""
        sk_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-DELIVERED",
            shopkeeper_id=sk_id,
            status=OrderStatus.DELIVERED,
            total_amount=1200.0,
            discount_amount=0.0,
            gst_amount=60.0,
            net_amount=1260.0,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)
        rate_input = RateOrderInput(
            order_id=order_id,
            rating=5,
            feedback="Prompt delivery and pristine medicine packaging!",
        )

        with patch(
            "app.graphql.resolvers.orders.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            result = await OrderMutation().rate_order(info, rate_input)

            assert result.rating == 5
            assert (
                result.feedback_text
                == "Prompt delivery and pristine medicine packaging!"
            )
            assert order.rating == 5
            assert (
                order.feedback_text
                == "Prompt delivery and pristine medicine packaging!"
            )

    @pytest.mark.asyncio
    async def test_shopkeeper_dispute_delivery(self):
        """Shopkeeper can raise a dispute on a delivered order."""
        sk_id = uuid.uuid4()
        order_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-DISPUTE",
            shopkeeper_id=sk_id,
            status=OrderStatus.DELIVERED,
            total_amount=800.0,
            discount_amount=0.0,
            gst_amount=40.0,
            net_amount=840.0,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)

        with patch(
            "app.graphql.resolvers.orders.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            order_res = await OrderMutation().dispute_delivery(
                info, order_id=order_id, reason="Broken syrup bottles inside carton"
            )

            assert (
                "[DISPUTED DELIVERY: Broken syrup bottles inside carton]"
                in order_res.remarks
            )

    @pytest.mark.asyncio
    async def test_shopkeeper_update_notification_preferences(self):
        """Shopkeeper can toggle notification channels (In-App, SMS, WhatsApp)."""
        sk_id = uuid.uuid4()
        profile = ShopkeeperProfile(
            user_id=sk_id,
            shop_name="Apollo Pharmacy",
            notification_preferences='{"in_app":true,"sms":false,"whatsapp":false}',
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = profile
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)
        input_data = UpdateNotificationPreferencesInput(
            in_app=True,
            sms=True,
            whatsapp=True,
        )

        with patch(
            "app.graphql.resolvers.notifications.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            success = await NotificationMutation().update_notification_preferences(
                info, input_data
            )

            assert success is True
            assert (
                '"whatsapp": true' in profile.notification_preferences
                or '"whatsapp":true' in profile.notification_preferences
            )
