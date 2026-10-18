"""
Unit & Integration tests for Inventory and Order Services.
"""

import pytest
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock

from app.services.inventory_service import (
    allocate_batch_fefo,
    restore_batch_stock,
    InsufficientStockError,
)
from app.db.models import StockBatch, Product


class TestInventoryService:
    @pytest.mark.asyncio
    async def test_fefo_allocation_picks_earliest_valid_batch(self):
        """Verify FEFO picks the earliest expiring batch that satisfies requested quantity."""
        prod_id = uuid.uuid4()
        today = date.today()

        # Batch 1 expires in 30 days, quantity 50
        b1 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B1_EXP30",
            expiry_date=today + timedelta(days=30),
            quantity_available=50,
            quantity_sold=0,
            purchase_rate=70.0,
            mrp=100.0,
        )
        # Batch 2 expires in 180 days, quantity 100
        b2 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B2_EXP180",
            expiry_date=today + timedelta(days=180),
            quantity_available=100,
            quantity_sold=0,
            purchase_rate=70.0,
            mrp=100.0,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        # Mock returning batches in FEFO order (b1, b2)
        mock_result.scalars.return_value.all.return_value = [b1, b2]
        mock_session.execute.return_value = mock_result

        allocated = await allocate_batch_fefo(mock_session, prod_id, requested_quantity=20)
        assert allocated.batch_number == "B1_EXP30"
        assert allocated.quantity_available == 30
        assert allocated.quantity_sold == 20

    @pytest.mark.asyncio
    async def test_fefo_allocation_skips_insufficient_batch(self):
        """When first batch has only 10 units but 25 are requested, picks the second batch."""
        prod_id = uuid.uuid4()
        today = date.today()

        b1 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B1_SMALL",
            expiry_date=today + timedelta(days=30),
            quantity_available=10,
            quantity_sold=0,
            purchase_rate=50.0,
            mrp=80.0,
        )
        b2 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B2_LARGE",
            expiry_date=today + timedelta(days=90),
            quantity_available=50,
            quantity_sold=0,
            purchase_rate=50.0,
            mrp=80.0,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [b1, b2]
        mock_session.execute.return_value = mock_result

        allocated = await allocate_batch_fefo(mock_session, prod_id, requested_quantity=25)
        assert allocated.batch_number == "B2_LARGE"
        assert allocated.quantity_available == 25
        assert allocated.quantity_sold == 25

    @pytest.mark.asyncio
    async def test_fefo_insufficient_stock_raises_error(self):
        """When requested quantity exceeds all available batches, InsufficientStockError is raised."""
        prod_id = uuid.uuid4()
        today = date.today()

        b1 = StockBatch(
            id=uuid.uuid4(),
            product_id=prod_id,
            batch_number="B1",
            expiry_date=today + timedelta(days=30),
            quantity_available=5,
            quantity_sold=0,
            purchase_rate=50.0,
            mrp=80.0,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [b1]
        mock_session.execute.return_value = mock_result

        with pytest.raises(InsufficientStockError):
            await allocate_batch_fefo(mock_session, prod_id, requested_quantity=50)

    @pytest.mark.asyncio
    async def test_restore_batch_stock(self):
        """Verify stock restoration upon order cancellation."""
        batch = StockBatch(
            id=uuid.uuid4(),
            batch_number="B_RESTORE",
            quantity_available=40,
            quantity_sold=20,
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = batch
        mock_session.execute.return_value = mock_result

        await restore_batch_stock(mock_session, batch.id, quantity=15)
        assert batch.quantity_available == 55
        assert batch.quantity_sold == 5

    @pytest.mark.asyncio
    async def test_record_purchase_entry(self):
        """Verify recording supplier bill creates purchase entry and stock batch."""
        from app.services.inventory_service import record_purchase_entry

        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_result = MagicMock()
        # Mock no existing batch found
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        items = [
            {
                "product_id": uuid.uuid4(),
                "batch_number": "PUR_B100",
                "expiry_date": date(2028, 12, 31),
                "hsn_code": "30041090",
                "quantity": 100,
                "free_quantity": 10,
                "rate": 80.0,
                "mrp": 120.0,
                "discount_pct": 10.0,
                "sgst_pct": 2.5,
                "cgst_pct": 2.5,
            }
        ]

        entry = await record_purchase_entry(
            session=mock_session,
            supplier_name="MAA Medical Agency",
            invoice_number="MMA-2026-0044",
            invoice_date=date.today(),
            entered_by=uuid.uuid4(),
            items_data=items,
            supplier_gstin="19BKMPG6092H1ZO",
        )

        assert entry.supplier_name == "MAA Medical Agency"
        assert entry.invoice_number == "MMA-2026-0044"
        # 100 * 80 = 8000; disc 10% = 800 -> taxable = 7200; gst 5% = 360 -> total = 7560
        assert entry.total_amount == 7560.0


class TestInvoiceGeneration:
    def test_render_html_invoice_statutory_fields(self):
        """Verify rendered invoice contains mandatory statutory GST and license details."""
        from app.utils.invoice_gen import render_html_invoice

        shopkeeper = {
            "name": "Cheap Medical Stores",
            "address": "Benachity, Durgapur-13",
            "gstin": "19AABCC1234D1Z5",
            "license": "WB-BUR-20B-1192",
        }
        items = [
            {
                "product_name": "AZITHRAL 500MG TAB",
                "pack_size": "10S",
                "batch_number": "2613000703",
                "expiry_date": "12/28",
                "hsn_code": "30041090",
                "quantity": 36,
                "free_quantity": 0,
                "mrp": 126.73,
                "rate": 96.56,
                "discount1_pct": 12.0,
                "sgst_amount": 76.48,
                "cgst_amount": 76.48,
                "line_total": 3211.97,
            }
        ]
        totals = {
            "subtotal": 3476.16,
            "total_discount": 417.14,
            "total_sgst": 76.48,
            "total_cgst": 76.48,
            "grand_total": 3211.97,
        }

        html = render_html_invoice(
            invoice_number="INV-2026-004448",
            invoice_date="2026-10-18",
            order_number="ORD-2026-004448",
            shopkeeper=shopkeeper,
            items=items,
            totals=totals,
        )

        assert "TAX INVOICE" in html
        assert "INV-2026-004448" in html
        assert "MAA Eswari Pharmaceuticals" in html
        assert "Cheap Medical Stores" in html
        assert "19BKMPG6092H1ZO" in html
        assert "Drugs &amp; Cosmetics Act 1940" in html or "Drugs & Cosmetics Act 1940" in html
        assert "AZITHRAL 500MG TAB" in html
        assert "₹3211.97" in html


