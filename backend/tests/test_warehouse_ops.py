"""
Unit tests for Warehouse Operations: Rack-Ordered Picking Slips,
Barcode Scanning Verification, and Stock Adjustments.
"""

import uuid
from datetime import date, datetime, timedelta
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import (
    Order,
    OrderItem,
    Product,
    StockBatch,
    StockAdjustment,
    ShopkeeperProfile,
    User,
    UserRole,
)
from app.graphql.resolvers.warehouse_ops import (
    WarehouseOpsQuery,
    WarehouseOpsMutation,
)


def make_mock_info(user_id: str | None = None, role: str | None = None):
    info = MagicMock()
    info.context = {
        "user_id": user_id or str(uuid.uuid4()),
        "role": role or UserRole.WAREHOUSE.value,
    }
    return info


class TestWarehouseOperations:
    @pytest.mark.asyncio
    async def test_warehouse_picking_slip_sorted_by_rack(self):
        """Picking slips are organized and sorted by rack/bay location to optimize picker walking path."""
        order_id = uuid.uuid4()
        p1 = Product(id=uuid.uuid4(), name="PAN D CAP", pack_size="15S")
        p2 = Product(id=uuid.uuid4(), name="AZITHRAL 500", pack_size="10S")

        b1 = StockBatch(
            id=uuid.uuid4(),
            batch_number="B-PAN-01",
            expiry_date=date(2028, 5, 1),
            rack_location="Rack C - Bay 04",
            barcode="890100112233",
        )
        b2 = StockBatch(
            id=uuid.uuid4(),
            batch_number="B-AZI-02",
            expiry_date=date(2028, 12, 1),
            rack_location="Rack A - Bay 02",
            barcode="890100445566",
        )

        it1 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_id,
            product=p1,
            stock_batch=b1,
            quantity=50,
            is_picked=False,
        )
        it2 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_id,
            product=p2,
            stock_batch=b2,
            quantity=30,
            is_picked=False,
        )

        sk_profile = ShopkeeperProfile(
            shop_name="LifeLine Pharmacy",
            area="Benachity",
            city="Durgapur",
        )
        sk_user = User(
            id=uuid.uuid4(),
            full_name="Chemist Roy",
            shopkeeper_profile=sk_profile,
        )

        order = Order(
            id=order_id,
            order_number="ORD-2026-PICK-01",
            shopkeeper=sk_user,
            items=[it1, it2],
            net_amount=15400.0,
            remarks="Urgent hospital ICU supply",
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order
        mock_session.execute.return_value = mock_res

        query = WarehouseOpsQuery()
        info = make_mock_info(role=UserRole.WAREHOUSE.value)

        with patch(
            "app.graphql.resolvers.warehouse_ops.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            slip = await query.warehouse_picking_slip(info=info, order_id=order_id)

            assert slip.order_number == "ORD-2026-PICK-01"
            assert slip.shopkeeper_name == "LifeLine Pharmacy"
            assert "HIGH_PRIORITY_SLA" in slip.priority
            assert len(slip.picking_lines) == 2
            # Must be sorted by rack_location: Rack A comes before Rack C!
            assert slip.picking_lines[0].rack_location == "Rack A - Bay 02"
            assert slip.picking_lines[1].rack_location == "Rack C - Bay 04"

    @pytest.mark.asyncio
    async def test_verify_picking_line_barcode_match_and_mismatch(self):
        """Barcode scanning validates physical strip and guards against picking wrong medicine."""
        item_id = uuid.uuid4()
        product = Product(
            id=uuid.uuid4(),
            name="CALPOL 650MG TAB",
            barcode="890123456789",
        )
        batch = StockBatch(
            id=uuid.uuid4(),
            batch_number="26140023",
            barcode="890123456789",
        )
        order_item = OrderItem(
            id=item_id,
            product=product,
            stock_batch=batch,
            quantity=20,
            is_picked=False,
            barcode_verified=False,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = order_item
        mock_session.execute.return_value = mock_res

        mutation = WarehouseOpsMutation()
        info = make_mock_info(role=UserRole.WAREHOUSE.value)

        with patch(
            "app.graphql.resolvers.warehouse_ops.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            # 1. Matching barcode scan
            res_match = await mutation.verify_picking_line_barcode(
                info=info,
                order_item_id=item_id,
                scanned_barcode="890123456789",
            )
            assert res_match.is_valid is True
            assert order_item.is_picked is True
            assert order_item.barcode_verified is True
            mock_session.commit.assert_called_once()

            # 2. Mismatch barcode scan
            res_mismatch = await mutation.verify_picking_line_barcode(
                info=info,
                order_item_id=item_id,
                scanned_barcode="999999999999",
            )
            assert res_mismatch.is_valid is False
            assert "mismatch" in res_mismatch.message.lower()

    @pytest.mark.asyncio
    async def test_record_stock_adjustment_with_repeated_detection(self):
        """Recording stock adjustments detects repeated adjustments on the same batch."""
        batch_id = uuid.uuid4()
        caller_id = uuid.uuid4()

        batch = StockBatch(
            id=batch_id,
            batch_number="BAT-DISC-01",
            quantity_available=100,
            product=Product(id=uuid.uuid4(), name="Hifenac MR"),
        )
        wh_user = User(
            id=caller_id,
            full_name="Warehouse Officer Sam",
            role=UserRole.WAREHOUSE,
        )
        past_adj = StockAdjustment(
            id=uuid.uuid4(),
            stock_batch_id=batch_id,
            adjustment_type="DAMAGED",
            quantity_delta=-5,
            reason="Water leakage in outer carton",
            created_at=datetime.now() - timedelta(days=5),
        )

        mock_session = AsyncMock()
        mock_batch_res = MagicMock()
        mock_batch_res.scalar_one_or_none.return_value = batch
        mock_rep_res = MagicMock()
        mock_rep_res.scalars.return_value.all.return_value = [past_adj]
        mock_user_res = MagicMock()
        mock_user_res.scalar_one_or_none.return_value = wh_user

        mock_session.execute.side_effect = [mock_batch_res, mock_rep_res, mock_user_res]

        mutation = WarehouseOpsMutation()
        info = make_mock_info(user_id=str(caller_id), role=UserRole.WAREHOUSE.value)

        with patch(
            "app.graphql.resolvers.warehouse_ops.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            adj_res = await mutation.record_stock_adjustment(
                info=info,
                batch_id=batch_id,
                adjustment_type="AUDIT_DISCREPANCY",
                quantity_delta=-2,
                reason="Physical bin count short by 2 packs during weekly cycle count",
                evidence_url="https://s3.ap-south-1.amazonaws.com/evidence/count_sheet_12.jpg",
            )

            assert adj_res.is_repeated is True
            assert batch.quantity_available == 98
            assert adj_res.evidence_url is not None
            mock_session.commit.assert_called_once()
