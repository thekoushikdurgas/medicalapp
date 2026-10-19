"""
Unit tests for Logistics Services: Delivery Challan, Invoice Return, and Advance Payment.
"""

import uuid
import pytest
from datetime import date
from unittest.mock import AsyncMock, MagicMock

from app.db.models import (
    Order,
    OrderItem,
    OrderStatus,
    Invoice,
    ShopkeeperProfile,
    StockBatch,
    PaymentMethod,
    User,
    UserRole,
)
from app.services.challan_service import (
    create_challan_for_order,
    process_challan_return,
)
from app.services.return_service import create_invoice_return
from app.services.payment_service import record_advance_payment


class TestChallanService:
    @pytest.mark.asyncio
    async def test_create_challan_for_order(self):
        order_id = uuid.uuid4()
        user_id = uuid.uuid4()
        batch_id = uuid.uuid4()
        prod_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-20261019-0001",
            shopkeeper_id=user_id,
            status=OrderStatus.CONFIRMED,
            total_amount=1000.0,
            net_amount=1050.0,
            items=[
                OrderItem(
                    id=uuid.uuid4(),
                    order_id=order_id,
                    product_id=prod_id,
                    stock_batch_id=batch_id,
                    quantity=10,
                    free_quantity=1,
                    rate=100.0,
                    mrp=120.0,
                )
            ],
        )

        mock_session = AsyncMock()

        # Call 1: Check existing challan (None)
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = None

        # Call 2: Query order
        mock_res2 = MagicMock()
        mock_res2.scalar_one_or_none.return_value = order

        # Call 3: Query count for numbering (0)
        mock_res3 = MagicMock()
        mock_res3.scalar.return_value = 0

        mock_session.execute.side_effect = [mock_res1, mock_res2, mock_res3]

        challan = await create_challan_for_order(
            session=mock_session,
            order_id=order_id,
            transporter_name="BlueDart Express",
            vehicle_number="WB02-1234",
            total_cartons=3,
            created_by=user_id,
        )

        assert challan.challan_number.startswith("DC-")
        assert challan.total_cartons == 3
        assert challan.transporter_name == "BlueDart Express"
        assert order.status == OrderStatus.PACKED
        assert mock_session.add.call_count >= 2  # challan + items

    @pytest.mark.asyncio
    async def test_challan_return_restores_stock(self):
        challan_id = uuid.uuid4()
        batch_id = uuid.uuid4()
        prod_id = uuid.uuid4()
        user_id = uuid.uuid4()

        batch = StockBatch(
            id=batch_id,
            product_id=prod_id,
            batch_number="B101",
            expiry_date=date(2027, 1, 1),
            quantity_available=40,
            quantity_sold=60,
            purchase_rate=70.0,
            mrp=100.0,
        )

        mock_session = AsyncMock()
        # Query challan
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = MagicMock(challan_number="DC-20261019-0001", id=challan_id)
        # Query count
        mock_res2 = MagicMock()
        mock_res2.scalar.return_value = 0
        # Query batch
        mock_res3 = MagicMock()
        mock_res3.scalar_one_or_none.return_value = batch

        mock_session.execute.side_effect = [mock_res1, mock_res2, mock_res3]

        return_items = [
            {"product_id": str(prod_id), "stock_batch_id": str(batch_id), "quantity": 10}
        ]

        result = await process_challan_return(
            session=mock_session,
            challan_id=challan_id,
            return_items=return_items,
            reason="Carton damaged in transit",
            processed_by=user_id,
        )

        assert result.return_number.startswith("CR-")
        assert batch.quantity_available == 50  # 40 + 10 restored
        assert batch.quantity_sold == 50       # 60 - 10


class TestReturnService:
    @pytest.mark.asyncio
    async def test_create_invoice_return_reverses_gst_and_credits_ledger(self):
        invoice_id = uuid.uuid4()
        order_id = uuid.uuid4()
        shopkeeper_id = uuid.uuid4()
        batch_id = uuid.uuid4()
        prod_id = uuid.uuid4()
        user_id = uuid.uuid4()

        order = Order(
            id=order_id,
            order_number="ORD-001",
            shopkeeper_id=shopkeeper_id,
        )
        invoice = Invoice(
            id=invoice_id,
            order_id=order_id,
            invoice_number="INV-20261019-0001",
            invoice_date=date.today(),
            subtotal=1000.0,
            total_discount=0.0,
            total_sgst=25.0,
            total_cgst=25.0,
            grand_total=1050.0,
            order=order,
        )

        batch = StockBatch(
            id=batch_id,
            product_id=prod_id,
            batch_number="B101",
            expiry_date=date(2027, 1, 1),
            quantity_available=10,
            quantity_sold=90,
            purchase_rate=70.0,
            mrp=100.0,
        )

        profile = ShopkeeperProfile(
            user_id=shopkeeper_id,
            shop_name="Gupta Medicals",
            shop_address="Kolkata",
            outstanding_balance=1050.0,
        )

        mock_session = AsyncMock()
        # 1: Query invoice
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = invoice
        # 2: Query count for CRN
        mock_res2 = MagicMock()
        mock_res2.scalar.return_value = 0
        # 3: Query batch for restock
        mock_res3 = MagicMock()
        mock_res3.scalar_one_or_none.return_value = batch
        # 4: Query shopkeeper profile
        mock_res4 = MagicMock()
        mock_res4.scalar_one_or_none.return_value = profile

        mock_session.execute.side_effect = [mock_res1, mock_res2, mock_res3, mock_res4]

        # Return 5 items at rate 100, 0% discount
        # Subtotal: 500, SGST 2.5%: 12.50, CGST 2.5%: 12.50, Grand Refund: 525.00
        return_items = [
            {
                "product_id": str(prod_id),
                "stock_batch_id": str(batch_id),
                "quantity": 5,
                "rate": 100.0,
                "discount_pct": 0.0,
            }
        ]

        credit_note = await create_invoice_return(
            session=mock_session,
            invoice_id=invoice_id,
            return_items=return_items,
            restock_status="RESTOCKED",
            reason="Expiry near",
            created_by=user_id,
        )

        assert credit_note.credit_note_no.startswith("CRN-")
        assert credit_note.refund_subtotal == 500.0
        assert credit_note.refund_sgst == 12.5
        assert credit_note.refund_cgst == 12.5
        assert credit_note.grand_refund == 525.0
        assert batch.quantity_available == 15  # 10 + 5 restocked
        assert profile.outstanding_balance == 525.0  # 1050 - 525


class TestPaymentService:
    @pytest.mark.asyncio
    async def test_record_advance_payment_reduces_outstanding_balance(self):
        shopkeeper_id = uuid.uuid4()
        user_id = uuid.uuid4()

        user = User(id=shopkeeper_id, full_name="Retailer", role=UserRole.SHOPKEEPER)
        profile = ShopkeeperProfile(
            user_id=shopkeeper_id,
            shop_name="City Pharmacy",
            shop_address="Burdwan",
            outstanding_balance=2000.0,
        )

        mock_session = AsyncMock()
        # Query user
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = user
        # Query profile
        mock_res2 = MagicMock()
        mock_res2.scalar_one_or_none.return_value = profile
        # Query count for ADV
        mock_res3 = MagicMock()
        mock_res3.scalar.return_value = 0

        mock_session.execute.side_effect = [mock_res1, mock_res2, mock_res3]

        payment = await record_advance_payment(
            session=mock_session,
            shopkeeper_id=shopkeeper_id,
            amount=800.0,
            payment_method=PaymentMethod.UPI,
            reference_no="UPI12345678",
            notes="Deposit for upcoming order",
            recorded_by=user_id,
        )

        assert payment.receipt_number.startswith("ADV-")
        assert payment.amount == 800.0
        assert profile.outstanding_balance == 1200.0  # 2000 - 800

    @pytest.mark.asyncio
    async def test_advance_payment_rejects_zero_or_negative_amount(self):
        mock_session = AsyncMock()
        with pytest.raises(ValueError, match="greater than zero"):
            await record_advance_payment(
                session=mock_session,
                shopkeeper_id=uuid.uuid4(),
                amount=0.0,
                payment_method=PaymentMethod.CASH,
                reference_no=None,
                notes=None,
                recorded_by=uuid.uuid4(),
            )
