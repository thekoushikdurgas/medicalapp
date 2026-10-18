"use client";

import { useState } from "react";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  customerDl: string;
  subtotal: number;
  totalDiscount: number;
  taxableValue: number;
  sgst: number;
  cgst: number;
  grandTotal: number;
  status: "PAID" | "DELIVERING" | "PENDING";
  lines: Array<{
    name: string;
    pack: string;
    hsn: string;
    batch: string;
    exp: string;
    qty: number;
    free: number;
    rate: number;
    mrp: number;
    dis1: number;
    taxable: number;
    sgst: number;
    cgst: number;
    total: number;
  }>;
}

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  const invoices: InvoiceItem[] = [
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-004448",
      orderNumber: "ORD-2026-004448",
      date: "13/10/2026",
      customerName: "Cheap Medical Stores",
      customerAddress: "Main Market, Benachity, Durgapur-13",
      customerGstin: "19AAACC1234D1Z5",
      customerDl: "WB-BUR-20B-10492",
      subtotal: 13626.16,
      totalDiscount: 1490.14,
      taxableValue: 12136.02,
      sgst: 303.4,
      cgst: 303.4,
      grandTotal: 12742.82,
      status: "DELIVERING",
      lines: [
        {
          name: "AZITHRAL 500MG TAB",
          pack: "10S",
          hsn: "30041090",
          batch: "2613000703",
          exp: "12/28",
          qty: 36,
          free: 3,
          rate: 96.56,
          mrp: 126.73,
          dis1: 12.0,
          taxable: 3059.02,
          sgst: 76.48,
          cgst: 76.48,
          total: 3211.97,
        },
        {
          name: "HIFENAC MR TAB",
          pack: "10S",
          hsn: "30049069",
          batch: "2614002301",
          exp: "08/28",
          qty: 20,
          free: 1,
          rate: 72.5,
          mrp: 88.01,
          dis1: 14.0,
          taxable: 1247.0,
          sgst: 31.18,
          cgst: 31.18,
          total: 1309.35,
        },
        {
          name: "PAN D CAP",
          pack: "15S",
          hsn: "30049099",
          batch: "2611004510",
          exp: "05/28",
          qty: 60,
          free: 4,
          rate: 145.0,
          mrp: 199.0,
          dis1: 10.0,
          taxable: 7830.0,
          sgst: 195.75,
          cgst: 195.75,
          total: 8221.5,
        },
      ],
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-000538",
      orderNumber: "ORD-2026-000538",
      date: "13/10/2026",
      customerName: "Gupta Pharmacy & Clinic",
      customerAddress: "A-22 City Centre, Durgapur-16",
      customerGstin: "19BBBDD5678E1Z9",
      customerDl: "WB-BUR-20B-11883",
      subtotal: 8540.0,
      totalDiscount: 1061.0,
      taxableValue: 7479.0,
      sgst: 186.97,
      cgst: 186.97,
      grandTotal: 7852.95,
      status: "PENDING",
      lines: [
        {
          name: "TELMA 40MG TAB",
          pack: "15S",
          hsn: "30049069",
          batch: "2612008920",
          exp: "10/28",
          qty: 40,
          free: 2,
          rate: 110.0,
          mrp: 145.5,
          dis1: 10.0,
          taxable: 3960.0,
          sgst: 99.0,
          cgst: 99.0,
          total: 4158.0,
        },
        {
          name: "MONTEK LC TAB",
          pack: "10S",
          hsn: "30049099",
          batch: "2615003112",
          exp: "11/28",
          qty: 30,
          free: 2,
          rate: 138.0,
          mrp: 185.0,
          dis1: 15.0,
          taxable: 3519.0,
          sgst: 87.97,
          cgst: 87.97,
          total: 3694.95,
        },
      ],
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-2026-000109",
      orderNumber: "ORD-2026-000109",
      date: "11/10/2026",
      customerName: "Cheap Medical Stores",
      customerAddress: "Main Market, Benachity, Durgapur-13",
      customerGstin: "19AAACC1234D1Z5",
      customerDl: "WB-BUR-20B-10492",
      subtotal: 6425.0,
      totalDiscount: 321.25,
      taxableValue: 6103.75,
      sgst: 152.59,
      cgst: 152.59,
      grandTotal: 6408.94,
      status: "PAID",
      lines: [
        {
          name: "CALPOL 650MG TAB",
          pack: "15S",
          hsn: "30049069",
          batch: "2614008129",
          exp: "09/28",
          qty: 100,
          free: 5,
          rate: 26.0,
          mrp: 34.5,
          dis1: 5.0,
          taxable: 2470.0,
          sgst: 61.75,
          cgst: 61.75,
          total: 2593.5,
        },
        {
          name: "DOLO 650MG TAB",
          pack: "15S",
          hsn: "30049069",
          batch: "2613005521",
          exp: "07/28",
          qty: 150,
          free: 10,
          rate: 25.5,
          mrp: 33.75,
          dis1: 5.0,
          taxable: 3633.75,
          sgst: 90.84,
          cgst: 90.84,
          total: 3815.44,
        },
      ],
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
            GST Tax Invoices
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            B2B GST invoices conforming to Schedule HSN 3004 with SGST/CGST breakdown
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            TOTAL INVOICED
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-700)" }}>
            ₹27,004.71
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current billing cycle</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            SGST OUTPUT (2.5%)
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-600)" }}>
            ₹642.96
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Payable to West Bengal Govt</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            CGST OUTPUT (2.5%)
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-600)" }}>
            ₹642.96
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Payable to Central Govt</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            CASH RECEIVED
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-success)" }}>
            ₹6,408.94
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Settled via UPI</p>
        </div>
      </div>

      {/* Invoice List Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Billed To (Shopkeeper)</th>
                <th>GSTIN</th>
                <th>Taxable (₹)</th>
                <th>Total GST (₹)</th>
                <th>Grand Total (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--color-primary-700)" }}>
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {inv.orderNumber}
                    </span>
                  </td>
                  <td>{inv.date}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {inv.customerAddress}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.75rem" }}>{inv.customerGstin}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{inv.taxableValue.toFixed(2)}</td>
                  <td style={{ color: "var(--color-primary-600)" }}>
                    ₹{(inv.sgst + inv.cgst).toFixed(2)}
                  </td>
                  <td style={{ fontWeight: 800, fontSize: "1rem" }}>
                    ₹{inv.grandTotal.toFixed(2)}
                  </td>
                  <td>
                    {inv.status === "PAID" && (
                      <span className="badge badge-success">✓ Settled</span>
                    )}
                    {inv.status === "DELIVERING" && (
                      <span className="badge badge-info">🚚 In Transit</span>
                    )}
                    {inv.status === "PENDING" && (
                      <span className="badge badge-warning">⏳ Generated</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      📄 View Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full GST Tax Invoice Preview Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              padding: "var(--space-8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div style={{ borderBottom: "2px solid var(--color-primary-600)", paddingBottom: "var(--space-2)", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary-800)" }}>
                      MAA ESWARI PHARMACEUTICALS
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      WHOLESALE MEDICINE DISTRIBUTORS • BENACHITY, DURGAPUR - 713213
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      GSTIN: <strong>19BKMPG6092H1ZO</strong> | D.L. No: <strong>BUR-20B-11422 / 21B-11422</strong> | Phone: 9614081313
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge badge-primary" style={{ fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}>
                      TAX INVOICE
                    </span>
                    <p style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: "0.3rem" }}>
                      {selectedInvoice.invoiceNumber}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Date: {selectedInvoice.date}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", marginLeft: "1rem" }}
              >
                ✕
              </button>
            </div>

            {/* Billed To / Shipped To Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4)",
                padding: "var(--space-3)",
                background: "var(--color-neutral-50)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--space-4)",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <p style={{ fontWeight: 700, color: "var(--color-primary-800)", textTransform: "uppercase" }}>Billed To:</p>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{selectedInvoice.customerName}</p>
                <p>{selectedInvoice.customerAddress}</p>
                <p>GSTIN: <strong>{selectedInvoice.customerGstin}</strong></p>
                <p>Drug Lic: <strong>{selectedInvoice.customerDl}</strong></p>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "var(--color-primary-800)", textTransform: "uppercase" }}>Dispatch Details:</p>
                <p>Order Reference: <strong>{selectedInvoice.orderNumber}</strong></p>
                <p>Payment Term: <strong>Credit (15 Days)</strong></p>
                <p>Mode: <strong>Local Delivery Van</strong></p>
                <p>Place of Supply: <strong>West Bengal (19)</strong></p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="table-wrapper" style={{ marginBottom: "var(--space-4)" }}>
              <table className="table" style={{ fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ background: "var(--color-neutral-100)" }}>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Pack</th>
                    <th>HSN</th>
                    <th>Batch</th>
                    <th>Exp</th>
                    <th>Qty</th>
                    <th>Free</th>
                    <th>Rate</th>
                    <th>MRP</th>
                    <th>DIS%</th>
                    <th>Taxable</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lines.map((ln, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{ln.name}</td>
                      <td>{ln.pack}</td>
                      <td>{ln.hsn}</td>
                      <td><code>{ln.batch}</code></td>
                      <td>{ln.exp}</td>
                      <td style={{ fontWeight: 700 }}>{ln.qty}</td>
                      <td>{ln.free > 0 ? `+${ln.free}` : "0"}</td>
                      <td>₹{ln.rate.toFixed(2)}</td>
                      <td>₹{ln.mrp.toFixed(2)}</td>
                      <td>{ln.dis1}%</td>
                      <td>₹{ln.taxable.toFixed(2)}</td>
                      <td>₹{ln.sgst.toFixed(2)}</td>
                      <td>₹{ln.cgst.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: "var(--color-primary-800)" }}>
                        ₹{ln.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Box */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "320px", fontSize: "0.85rem", background: "var(--color-neutral-50)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span>Gross Value:</span>
                  <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", color: "var(--color-error)" }}>
                  <span>Wholesale Discount:</span>
                  <span>-₹{selectedInvoice.totalDiscount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontWeight: 600 }}>
                  <span>Taxable Amount:</span>
                  <span>₹{selectedInvoice.taxableValue.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span>SGST (2.5%):</span>
                  <span>₹{selectedInvoice.sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>CGST (2.5%):</span>
                  <span>₹{selectedInvoice.cgst.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: "2px solid #ccc", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", color: "var(--color-primary-800)" }}>
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-6)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Certified that the particulars given above are true and correct. E. & O.E.
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Print Invoice
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => alert(`Invoice ${selectedInvoice.invoiceNumber} PDF generated!`)}
                >
                  ⬇️ Download GST PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
