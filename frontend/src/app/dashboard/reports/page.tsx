"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<
    "sales" | "gst" | "inventory" | "credit"
  >("sales");

  const topMedicines = [
    {
      name: "AZITHRAL 500MG TAB",
      category: "Antibiotics",
      unitsSold: 420,
      revenue: 40555.2,
      share: "28%",
    },
    {
      name: "PAN D CAP",
      category: "Gastrointestinal",
      unitsSold: 360,
      revenue: 52200.0,
      share: "24%",
    },
    {
      name: "HIFENAC MR TAB",
      category: "Pain Relief",
      unitsSold: 280,
      revenue: 20300.0,
      share: "18%",
    },
    {
      name: "TELMA 40MG TAB",
      category: "Cardiovascular",
      unitsSold: 210,
      revenue: 23100.0,
      share: "14%",
    },
    {
      name: "DOLO 650MG TAB",
      category: "Analgesic",
      unitsSold: 650,
      revenue: 16575.0,
      share: "16%",
    },
  ];

  const gstBreakdown = [
    {
      hsn: "30041090",
      desc: "Antibiotics (Azithral, Augmentin)",
      taxable: 48500.0,
      sgstPct: "2.5%",
      sgst: 1212.5,
      cgstPct: "2.5%",
      cgst: 1212.5,
      totalTax: 2425.0,
    },
    {
      hsn: "30049069",
      desc: "Anti-inflammatory & Pain (Hifenac, Telma, Calpol)",
      taxable: 36200.0,
      sgstPct: "2.5%",
      sgst: 905.0,
      cgstPct: "2.5%",
      cgst: 905.0,
      totalTax: 1810.0,
    },
    {
      hsn: "30049099",
      desc: "Gastrointestinal & Respiratory (Pan D, Montek LC)",
      taxable: 42100.0,
      sgstPct: "2.5%",
      sgst: 1052.5,
      cgstPct: "2.5%",
      cgst: 1052.5,
      totalTax: 2105.0,
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
            Analytics & Regulatory Reporting
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            GSTR-1 tax filings, sales revenue trends, and inventory movement
            analytics
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            className="btn btn-secondary"
            onClick={() =>
              alert("Downloading GSTR-1 JSON for GST Portal upload...")
            }
          >
            📋 Export GSTR-1 JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              alert("Generating monthly financial statement PDF...")
            }
          >
            📊 Download Ledger Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "sales", label: "💰 Revenue & Sales", icon: "💰" },
          { key: "gst", label: "📋 GSTR-1 Tax Return", icon: "📋" },
          { key: "inventory", label: "📦 Inventory Velocity", icon: "📦" },
          { key: "credit", label: "🏦 Shopkeeper Credit Aging", icon: "🏦" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key as any)}
            className={`btn ${activeReport === tab.key ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SALES REPORT VIEW */}
      {activeReport === "sales" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                MONTHLY GROSS SALES
              </p>
              <p
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--color-primary-700)",
                }}
              >
                ₹1,52,730.20
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                ↑ 18.4% vs last month
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                DISCOUNTS CONCEDED
              </p>
              <p
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--color-error)",
                }}
              >
                ₹18,340.50
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Average 12.0% scheme
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                TOTAL MEDICINES SOLD
              </p>
              <p
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--color-primary-600)",
                }}
              >
                1,920 packs
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Across 28 fulfilled orders
              </p>
            </div>
          </div>

          <div className="card">
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
              }}
            >
              ⭐ Best Selling Pharmaceutical Lines by Volume
            </h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Therapeutic Category</th>
                    <th>Packs Dispatched</th>
                    <th>Wholesale Turnover (₹)</th>
                    <th>Portfolio Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topMedicines.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{m.name}</td>
                      <td>
                        <span className="badge badge-info">{m.category}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{m.unitsSold} packs</td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--color-primary-700)",
                        }}
                      >
                        ₹
                        {m.revenue.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className="badge badge-primary">{m.share}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GST REPORT VIEW */}
      {activeReport === "gst" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(236,253,245,0.7), rgba(240,253,250,0.4))",
              borderColor: "rgba(16,185,129,0.3)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--color-primary-800)",
                marginBottom: "0.5rem",
              }}
            >
              🏛️ GST Compliance Header — Form GSTR-1
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-3)",
                fontSize: "0.85rem",
              }}
            >
              <p>
                Supplier GSTIN: <strong>19BKMPG6092H1ZO</strong>
              </p>
              <p>
                Legal Name: <strong>MAA ESWARI PHARMACEUTICALS</strong>
              </p>
              <p>
                Filing Period: <strong>October 2026</strong>
              </p>
              <p>
                Jurisdiction: <strong>West Bengal State Tax (19)</strong>
              </p>
            </div>
          </div>

          <div className="card">
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
              }}
            >
              HSN Code Summary of Outward Supplies
            </h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>HSN Code</th>
                    <th>Classification Description</th>
                    <th>Taxable Value (₹)</th>
                    <th>SGST (2.5%)</th>
                    <th>CGST (2.5%)</th>
                    <th>Total Tax Liability (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {gstBreakdown.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <code>{row.hsn}</code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{row.desc}</td>
                      <td style={{ fontWeight: 700 }}>
                        ₹
                        {row.taxable.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>₹{row.sgst.toFixed(2)}</td>
                      <td>₹{row.cgst.toFixed(2)}</td>
                      <td
                        style={{
                          fontWeight: 800,
                          color: "var(--color-primary-800)",
                        }}
                      >
                        ₹{row.totalTax.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      fontWeight: 800,
                      background: "var(--color-neutral-100)",
                    }}
                  >
                    <td colSpan={2}>CONSOLIDATED TOTALS</td>
                    <td>₹1,26,800.00</td>
                    <td>₹3,170.00</td>
                    <td>₹3,170.00</td>
                    <td style={{ color: "var(--color-primary-800)" }}>
                      ₹6,340.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT VIEW */}
      {activeReport === "inventory" && (
        <div className="card">
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
            }}
          >
            Warehouse Stock Velocity & Rack Allocation
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "var(--space-4)",
              fontSize: "0.9rem",
            }}
          >
            Stock turnover speed based on the last 30 days of sales dispatch
            from Benachity Hub.
          </p>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine SKU</th>
                  <th>Current Stock</th>
                  <th>Weekly Outflow</th>
                  <th>Days of Supply Left</th>
                  <th>Replenishment Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>AZITHRAL 500MG TAB</td>
                  <td>450 packs</td>
                  <td>90 packs/wk</td>
                  <td>35 Days</td>
                  <td>
                    <span className="badge badge-success">Optimal</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>CALPOL 650MG TAB</td>
                  <td>1,200 packs</td>
                  <td>250 packs/wk</td>
                  <td>33 Days</td>
                  <td>
                    <span className="badge badge-success">Optimal</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>TELMA 40MG TAB</td>
                  <td>280 packs</td>
                  <td>70 packs/wk</td>
                  <td>28 Days</td>
                  <td>
                    <span className="badge badge-warning">Order Soon</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREDIT AGING VIEW */}
      {activeReport === "credit" && (
        <div className="card">
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
            }}
          >
            Shopkeeper Credit Aging Analysis
          </h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Pharmacy Name</th>
                  <th>Total Due</th>
                  <th>0-15 Days (Current)</th>
                  <th>16-30 Days</th>
                  <th>30+ Days (Overdue)</th>
                  <th>Credit Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>Cheap Medical Stores</td>
                  <td
                    style={{ fontWeight: 800, color: "var(--color-warning)" }}
                  >
                    ₹23,375.00
                  </td>
                  <td>₹23,375.00</td>
                  <td>₹0.00</td>
                  <td>₹0.00</td>
                  <td>₹1,00,000.00</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Gupta Pharmacy & Clinic</td>
                  <td
                    style={{ fontWeight: 800, color: "var(--color-warning)" }}
                  >
                    ₹8,617.25
                  </td>
                  <td>₹8,617.25</td>
                  <td>₹0.00</td>
                  <td>₹0.00</td>
                  <td>₹1,50,000.00</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Maa Tara Medical Hall</td>
                  <td
                    style={{ fontWeight: 800, color: "var(--color-success)" }}
                  >
                    ₹0.00
                  </td>
                  <td>₹0.00</td>
                  <td>₹0.00</td>
                  <td>₹0.00</td>
                  <td>₹80,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
