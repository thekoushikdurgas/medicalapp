"""
GST calculation utilities — mirrors the real invoice logic.

Based on real invoices:
- Line amount = Qty × Rate
- Discount = Line amount × (DIS1% / 100)
- Taxable value = Line amount - Discount
- SGST = Taxable value × (SGST% / 100)
- CGST = Taxable value × (CGST% / 100)
- Net amount = Taxable value + SGST + CGST
"""


def calculate_line_total(
    quantity: int,
    rate: float,
    discount1_pct: float = 0.0,
    discount2_pct: float = 0.0,
    sgst_pct: float = 2.5,
    cgst_pct: float = 2.5,
) -> dict:
    """
    Calculate a single order line's amounts.

    Returns dict with: base_amount, discount, taxable, sgst, cgst, total
    """
    base_amount = quantity * rate

    # Apply cascading discounts
    after_disc1 = base_amount * (1 - discount1_pct / 100)
    taxable = after_disc1 * (1 - discount2_pct / 100)
    discount = base_amount - taxable

    sgst = taxable * sgst_pct / 100
    cgst = taxable * cgst_pct / 100
    total = taxable + sgst + cgst

    return {
        "base_amount": round(base_amount, 2),
        "discount": round(discount, 2),
        "taxable": round(taxable, 2),
        "sgst": round(sgst, 2),
        "cgst": round(cgst, 2),
        "total": round(total, 2),
    }


def calculate_invoice_totals(line_items: list[dict]) -> dict:
    """
    Sum up all line items to produce invoice-level totals.

    Each line_item should have: base_amount, discount, taxable, sgst, cgst, total
    """
    totals = {
        "subtotal": 0.0,
        "total_discount": 0.0,
        "total_sgst": 0.0,
        "total_cgst": 0.0,
        "grand_total": 0.0,
    }

    for item in line_items:
        totals["subtotal"] += item["base_amount"]
        totals["total_discount"] += item["discount"]
        totals["total_sgst"] += item["sgst"]
        totals["total_cgst"] += item["cgst"]
        totals["grand_total"] += item["total"]

    return {k: round(v, 2) for k, v in totals.items()}
