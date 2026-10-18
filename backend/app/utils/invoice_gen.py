"""
Statutory GST Tax Invoice Generator.
Generates printable, standard-compliant tax invoices matching MAA Eswari Pharmaceuticals layout.
"""

from datetime import date
from typing import Any


def render_html_invoice(
    invoice_number: str,
    invoice_date: date | str,
    order_number: str,
    shopkeeper: dict[str, Any],
    items: list[dict[str, Any]],
    totals: dict[str, float],
    company_details: dict[str, str] | None = None,
) -> str:
    """
    Renders an HTML/CSS printable GST tax invoice matching statutory requirements.
    """
    seller = company_details or {
        "name": "MAA Eswari Pharmaceuticals",
        "address": "Benachity, Durgapur, Paschim Bardhaman, West Bengal - 713213",
        "gstin": "19BKMPG6092H1ZO",
        "dl_no": "WB/DRUG/20B-004419, 21B-004420",
        "phone": "+91 98321 00000",
        "bank_name": "State Bank of India",
        "account_no": "39182001928",
        "ifsc": "SBIN0000074",
    }

    item_rows = ""
    for idx, it in enumerate(items, 1):
        mrp = it.get("mrp", 0.0)
        rate = it.get("rate", 0.0)
        qty = it.get("quantity", 0)
        free = it.get("free_quantity", 0)
        base = qty * rate
        disc = base * (it.get("discount1_pct", 0.0) / 100.0)
        taxable = base - disc
        sgst = it.get("sgst_amount", taxable * 0.025)
        cgst = it.get("cgst_amount", taxable * 0.025)
        line_total = it.get("line_total", taxable + sgst + cgst)

        item_rows += f"""
        <tr>
            <td style="text-align: center;">{idx}</td>
            <td>
                <strong>{it.get('product_name', 'Medicine')}</strong><br/>
                <span style="font-size: 11px; color: #555;">Pack: {it.get('pack_size', '10S')}</span>
            </td>
            <td style="text-align: center;"><code>{it.get('batch_number', 'N/A')}</code></td>
            <td style="text-align: center;">{it.get('expiry_date', 'N/A')}</td>
            <td style="text-align: center;">{it.get('hsn_code', '30049099')}</td>
            <td style="text-align: right;">{qty}</td>
            <td style="text-align: right;">{free}</td>
            <td style="text-align: right;">₹{mrp:.2f}</td>
            <td style="text-align: right;">₹{rate:.2f}</td>
            <td style="text-align: right;">{it.get('discount1_pct', 0.0):.1f}%</td>
            <td style="text-align: right;">₹{taxable:.2f}</td>
            <td style="text-align: right;">₹{sgst:.2f}</td>
            <td style="text-align: right;">₹{cgst:.2f}</td>
            <td style="text-align: right; font-weight: bold;">₹{line_total:.2f}</td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice - {invoice_number}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 12px;
            color: #111;
            margin: 0;
            padding: 24px;
            background: #fff;
        }}
        .invoice-card {{
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 24px;
        }}
        .header {{
            display: flex;
            justifyContent: space-between;
            border-bottom: 2px solid #047857;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }}
        .party-box {{
            display: flex;
            justifyContent: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
        }}
        table.bill-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 16px;
        }}
        table.bill-table th {{
            background: #047857;
            color: #fff;
            padding: 6px 8px;
            text-align: left;
            font-size: 11px;
        }}
        table.bill-table td {{
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
        }}
        .totals-section {{
            display: flex;
            justifyContent: space-between;
            margin-top: 12px;
        }}
        .bank-details {{
            font-size: 11px;
            color: #444;
            max-width: 400px;
        }}
        .summary-table {{
            width: 320px;
            border-collapse: collapse;
            font-size: 12px;
        }}
        .summary-table td {{
            padding: 4px 6px;
        }}
        .declaration {{
            font-size: 10px;
            color: #666;
            margin-top: 24px;
            border-top: 1px dashed #ccc;
            padding-top: 8px;
        }}
        @media print {{
            body {{ padding: 0; }}
            .invoice-card {{ border: none; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="invoice-card">
        <div class="header">
            <div>
                <h1 style="color: #047857; margin: 0; font-size: 22px;">{seller['name']}</h1>
                <p style="margin: 3px 0; color: #444;">{seller['address']}</p>
                <p style="margin: 2px 0;"><strong>GSTIN:</strong> {seller['gstin']} | <strong>D.L. No:</strong> {seller['dl_no']}</p>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; color: #111; font-size: 18px;">TAX INVOICE</h2>
                <p style="margin: 3px 0;"><strong>Invoice No:</strong> {invoice_number}</p>
                <p style="margin: 2px 0;"><strong>Date:</strong> {invoice_date}</p>
                <p style="margin: 2px 0;"><strong>Order Ref:</strong> {order_number}</p>
            </div>
        </div>

        <div class="party-box">
            <div>
                <strong style="color: #047857; text-transform: uppercase;">Billed To (Retail Pharmacy):</strong><br/>
                <strong>{shopkeeper.get('name', 'Retail Pharmacy Store')}</strong><br/>
                <span>{shopkeeper.get('address', 'Durgapur, West Bengal')}</span><br/>
                <span><strong>GSTIN:</strong> {shopkeeper.get('gstin', 'URP (Unregistered)')}</span> |
                <span><strong>Drug License:</strong> {shopkeeper.get('license', 'DL-PENDING')}</span>
            </div>
            <div style="text-align: right;">
                <strong style="color: #047857; text-transform: uppercase;">Place of Supply:</strong><br/>
                West Bengal (Code: 19)<br/>
                <span>Reverse Charge: <strong>NO</strong></span>
            </div>
        </div>

        <table class="bill-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Product & Pack</th>
                    <th>Batch</th>
                    <th>Exp</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Free</th>
                    <th>MRP</th>
                    <th>Rate</th>
                    <th>Dis%</th>
                    <th>Taxable</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {item_rows}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="bank-details">
                <strong>Bank Remittance Details:</strong><br/>
                Bank: {seller['bank_name']}<br/>
                Account: {seller['account_no']} | IFSC: {seller['ifsc']}<br/>
                <em>Please quote invoice number during NEFT/RTGS/UPI transfers.</em>
            </div>
            <div>
                <table class="summary-table">
                    <tr>
                        <td>Gross Goods Value:</td>
                        <td style="text-align: right;">₹{totals.get('subtotal', 0.0):.2f}</td>
                    </tr>
                    <tr>
                        <td style="color: #dc2626;">Trade Discount:</td>
                        <td style="text-align: right; color: #dc2626;">-₹{totals.get('total_discount', 0.0):.2f}</td>
                    </tr>
                    <tr>
                        <td>State GST (SGST 2.5%):</td>
                        <td style="text-align: right;">+₹{totals.get('total_sgst', 0.0):.2f}</td>
                    </tr>
                    <tr>
                        <td>Central GST (CGST 2.5%):</td>
                        <td style="text-align: right;">+₹{totals.get('total_cgst', 0.0):.2f}</td>
                    </tr>
                    <tr style="border-top: 2px solid #047857; font-weight: bold; font-size: 14px;">
                        <td>Net Invoice Amount:</td>
                        <td style="text-align: right; color: #047857;">₹{totals.get('grand_total', 0.0):.2f}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="declaration">
            <p><strong>Declaration:</strong> Certified that the medicines mentioned in this invoice are sold in accordance with the provisions of the Drugs & Cosmetics Act 1940 and rules framed thereunder. Goods once sold will not be accepted back after 7 days.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 36px;">
                <span>Customer's Signature & Stamp</span>
                <span style="font-weight: bold;">For {seller['name']} (Authorized Signatory)</span>
            </div>
        </div>
    </div>
</body>
</html>
"""
