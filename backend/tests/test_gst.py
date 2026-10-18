"""
Tests for GST calculation utilities.
"""

from app.utils.gst import calculate_line_total, calculate_invoice_totals


class TestCalculateLineTotal:
    def test_basic_calculation(self):
        """No discounts, standard 2.5% SGST+CGST."""
        result = calculate_line_total(quantity=10, rate=100.0)
        assert result["base_amount"] == 1000.0
        assert result["discount"] == 0.0
        assert result["taxable"] == 1000.0
        assert result["sgst"] == 25.0
        assert result["cgst"] == 25.0
        assert result["total"] == 1050.0

    def test_with_discount1(self):
        """Single discount of 14% — like HIFENAC MR TAB in invoice A004448."""
        result = calculate_line_total(
            quantity=20, rate=88.01, discount1_pct=14.0
        )
        assert result["base_amount"] == 1760.20
        # After 14% discount: 1760.20 * 0.86 = 1513.77
        assert result["taxable"] == 1513.77

    def test_with_both_discounts(self):
        """Cascading DIS1 and DIS2 — verifying correct chaining."""
        result = calculate_line_total(
            quantity=10, rate=100.0, discount1_pct=10.0, discount2_pct=5.0
        )
        # After 10%: 900, after 5%: 855
        assert result["taxable"] == 855.0

    def test_real_invoice_line(self):
        """AZITHRAL 500MG TAB from invoice A004448:
        Qty=36(3S), Rate=96.56, DIS1=12%, SGST=2.5%, CGST=2.5%
        Expected amount ≈ ₹3476.16
        """
        result = calculate_line_total(
            quantity=36, rate=96.56, discount1_pct=12.0
        )
        assert result["base_amount"] == 3476.16
        assert result["taxable"] == 3059.02
        assert result["total"] == 3211.97


class TestCalculateInvoiceTotals:
    def test_sums_correctly(self):
        lines = [
            calculate_line_total(10, 100.0),
            calculate_line_total(5, 200.0, discount1_pct=10.0),
        ]
        totals = calculate_invoice_totals(lines)
        assert totals["subtotal"] == 2000.0  # 1000 + 1000
        assert totals["grand_total"] > 0
