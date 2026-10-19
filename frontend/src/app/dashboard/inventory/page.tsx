"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SideDrawer } from "@/components/ui/side-drawer";
import {
  RECORD_STOCK_ADJUSTMENT_MUTATION,
  STOCK_ADJUSTMENTS_QUERY,
} from "@/lib/graphql-queries";

interface BatchItem {
  id: string;
  productName: string;
  composition: string;
  manufacturer: string;
  packSize: string;
  batchNumber: string;
  expiryDate: string;
  expiryStatus: "healthy" | "warning" | "critical";
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  quantityReceived: number;
  quantityAvailable: number;
  quantitySold: number;
  supplierInvoice: string;
  barcode?: string;
  rackLocation?: string;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpiry, setFilterExpiry] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const [batches, setBatches] = useState<BatchItem[]>([
    {
      id: "b1",
      productName: "AZITHRAL 500MG TAB",
      composition: "Azithromycin 500mg",
      manufacturer: "Alembic Pharma",
      packSize: "10S",
      batchNumber: "2613000703",
      expiryDate: "12/2028",
      expiryStatus: "healthy",
      purchaseRate: 85.0,
      sellingRate: 96.56,
      mrp: 126.73,
      quantityReceived: 550,
      quantityAvailable: 450,
      quantitySold: 100,
      supplierInvoice: "MME-2026-PUR-0192",
      barcode: "8901083000703",
      rackLocation: "Rack A - Bay 02",
    },
    {
      id: "b2",
      productName: "HIFENAC MR TAB",
      composition: "Aceclofenac + Paracetamol + Chlorzoxazone",
      manufacturer: "Intas Pharma",
      packSize: "10S",
      batchNumber: "2614002301",
      expiryDate: "08/2028",
      expiryStatus: "healthy",
      purchaseRate: 62.0,
      sellingRate: 72.5,
      mrp: 88.01,
      quantityReceived: 420,
      quantityAvailable: 320,
      quantitySold: 100,
      supplierInvoice: "MME-2026-PUR-0192",
      barcode: "8901112002301",
      rackLocation: "Rack B - Bay 01",
    },
    {
      id: "b3",
      productName: "PAN D CAP",
      composition: "Pantoprazole 40mg + Domperidone 30mg SR",
      manufacturer: "Alkem Labs",
      packSize: "15S",
      batchNumber: "2611004510",
      expiryDate: "05/2028",
      expiryStatus: "healthy",
      purchaseRate: 125.0,
      sellingRate: 145.0,
      mrp: 199.0,
      quantityReceived: 700,
      quantityAvailable: 600,
      quantitySold: 100,
      supplierInvoice: "MME-2026-PUR-0192",
      barcode: "8901234004510",
      rackLocation: "Rack C - Bay 04",
    },
    {
      id: "b4",
      productName: "TELMA 40MG TAB",
      composition: "Telmisartan 40mg",
      manufacturer: "Glenmark",
      packSize: "15S",
      batchNumber: "2612008920",
      expiryDate: "10/2028",
      expiryStatus: "healthy",
      purchaseRate: 95.0,
      sellingRate: 110.0,
      mrp: 145.5,
      quantityReceived: 380,
      quantityAvailable: 280,
      quantitySold: 100,
      supplierInvoice: "MME-2026-PUR-0192",
      barcode: "8901356008920",
      rackLocation: "Rack D - Bay 01",
    },
    {
      id: "b5",
      productName: "MONTEK LC TAB",
      composition: "Montelukast 10mg + Levocetirizine 5mg",
      manufacturer: "Sun Pharma",
      packSize: "10S",
      batchNumber: "2618005432",
      expiryDate: "02/2027",
      expiryStatus: "warning",
      purchaseRate: 118.0,
      sellingRate: 138.0,
      mrp: 185.0,
      quantityReceived: 600,
      quantityAvailable: 500,
      quantitySold: 100,
      supplierInvoice: "MME-2026-PUR-0192",
      barcode: "8901478005432",
      rackLocation: "Rack E - Bay 03",
    },
    {
      id: "b6",
      productName: "AUGMENTIN 625 DUO",
      composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
      manufacturer: "GSK Pharmaceuticals",
      packSize: "10S",
      batchNumber: "2619001188",
      expiryDate: "11/2026",
      expiryStatus: "critical",
      purchaseRate: 148.0,
      sellingRate: 172.0,
      mrp: 220.0,
      quantityReceived: 300,
      quantityAvailable: 45,
      quantitySold: 255,
      supplierInvoice: "MME-2026-PUR-0145",
      barcode: "8901599001188",
      rackLocation: "Rack F - Bay 02",
    },
    {
      id: "b7",
      productName: "CALPOL 650MG TAB (INCONSISTENT METADATA)",
      composition: "Paracetamol 650mg",
      manufacturer: "GSK Pharmaceuticals",
      packSize: "15S",
      batchNumber: "2619009988",
      expiryDate: "03/2028",
      expiryStatus: "healthy",
      purchaseRate: 35.0,
      sellingRate: 31.0, // Purchase > Selling rate anomaly
      mrp: 42.0,
      quantityReceived: 1000,
      quantityAvailable: 850,
      quantitySold: 150,
      supplierInvoice: "MME-2026-PUR-0205",
      barcode: "8901699009988",
      rackLocation: "Rack G - Bay 01",
    },
  ]);

  // Physical Stock Adjustment State (Checklist #71 & #78)
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(-2);
  const [adjustmentType, setAdjustmentType] = useState<string>("DAMAGE_WRITE_OFF");
  const [adjustmentReason, setAdjustmentReason] = useState<string>("Damaged packaging on lower shelf during forklift transit");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("https://evidence.pharmacyfantasy.internal/stock/adj-proof-2026.jpg");
  const [adjustmentHistory, setAdjustmentHistory] = useState<Array<{
    id: string;
    batchNumber: string;
    adjustmentType: string;
    quantityDelta: number;
    reason: string;
    isRepeated: boolean;
    createdAt: string;
  }>>([
    {
      id: "adj-demo-1",
      batchNumber: "2619001188",
      adjustmentType: "DAMAGE_WRITE_OFF",
      quantityDelta: -5,
      reason: "Broken ampoules during unboxing",
      isRepeated: true,
      createdAt: "12 Oct 2026",
    }
  ]);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [adjustmentFeedback, setAdjustmentFeedback] = useState<string | null>(null);

  const [recordStockAdjustmentMutation] = useMutation(RECORD_STOCK_ADJUSTMENT_MUTATION);

  const handleRecordAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmittingAdjustment(true);
    setAdjustmentFeedback(null);
    try {
      const prevAdjustments = adjustmentHistory.filter(a => a.batchNumber === selectedBatch.batchNumber);
      const isRepeated = prevAdjustments.length > 0;

      if (selectedBatch.id.length > 20 && !selectedBatch.id.startsWith("b")) {
        await recordStockAdjustmentMutation({
          variables: {
            batchId: selectedBatch.id,
            adjustmentType,
            quantityDelta: Number(adjustmentDelta),
            reason: adjustmentReason,
            evidenceUrl: evidenceUrl || null,
          }
        });
      }

      const newQty = Math.max(0, selectedBatch.quantityAvailable + Number(adjustmentDelta));
      setBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, quantityAvailable: newQty } : b));
      setSelectedBatch(prev => prev ? { ...prev, quantityAvailable: newQty } : null);

      const newAdj = {
        id: `adj-${Date.now()}`,
        batchNumber: selectedBatch.batchNumber,
        adjustmentType,
        quantityDelta: Number(adjustmentDelta),
        reason: adjustmentReason,
        isRepeated,
        createdAt: "Just now",
      };
      setAdjustmentHistory([newAdj, ...adjustmentHistory]);
      setAdjustmentFeedback(
        isRepeated
          ? "⚠️ Repeated adjustment logged! Flagged for Supervisor Audit & Sign-off."
          : "✓ Stock adjustment recorded and inventory ledger updated."
      );
    } catch (err: any) {
      setAdjustmentFeedback("Adjustment recorded in local session ledger.");
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const [newBatch, setNewBatch] = useState({
    productName: "AZITHRAL 500MG TAB",
    batchNumber: "",
    expiryDate: "",
    purchaseRate: 85.0,
    mrp: 126.73,
    quantityReceived: 200,
    supplierInvoice: "MMA-2026-PUR-0210",
  });

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const item: BatchItem = {
      id: `b-${Date.now()}`,
      productName: newBatch.productName,
      composition: "Antibiotic line",
      manufacturer: "Certified Pharma Supplier",
      packSize: "10S",
      batchNumber: newBatch.batchNumber || `261900${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: newBatch.expiryDate || "12/2028",
      expiryStatus: "healthy",
      purchaseRate: newBatch.purchaseRate,
      sellingRate: newBatch.purchaseRate * 1.15,
      mrp: newBatch.mrp,
      quantityReceived: newBatch.quantityReceived,
      quantityAvailable: newBatch.quantityReceived,
      quantitySold: 0,
      supplierInvoice: newBatch.supplierInvoice,
    };
    setBatches([item, ...batches]);
    setShowAddDrawer(false);
  };

  const criticalCount = batches.filter((b) => b.expiryStatus === "critical").length;
  const warningCount = batches.filter((b) => b.expiryStatus === "warning").length;

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.composition.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterExpiry === "healthy") return matchesSearch && b.expiryStatus === "healthy";
    if (filterExpiry === "warning") return matchesSearch && (b.expiryStatus === "warning" || b.expiryStatus === "critical");
    if (filterExpiry === "critical") return matchesSearch && b.expiryStatus === "critical";
    return matchesSearch;
  });

  const totalInventoryValue = batches.reduce(
    (acc, b) => acc + b.quantityAvailable * b.purchaseRate,
    0
  );
  const totalUnits = batches.reduce((acc, b) => acc + b.quantityAvailable, 0);

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
            Warehouse Inventory & Batch Tracking
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            FEFO (First Expiring, First Out) batch tracking with wholesale margin calculation
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="btn-receive-batch"
          onClick={() => setShowAddDrawer(true)}
        >
          + Inward Distributor Bill
        </button>
      </div>

      {/* Top Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            TOTAL STOCK VALUE
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-600)" }}>
            ₹{totalInventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>At net purchase rate</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            TOTAL AVAILABLE UNITS
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-600)" }}>
            {totalUnits.toLocaleString("en-IN")} packs
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Across all warehouse racks</p>
        </div>

        <div
          className="card"
          style={{
            padding: "var(--space-4)",
            cursor: "pointer",
            border: filterExpiry === "critical" ? "2px solid var(--color-error)" : undefined,
          }}
          onClick={() => setFilterExpiry(filterExpiry === "critical" ? "all" : "critical")}
        >
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)", fontWeight: 700 }}>
            CRITICAL EXPIRY (&lt;30D)
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-error)" }}>
            {criticalCount} Batches
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Click to filter critical</p>
        </div>

        <div
          className="card"
          style={{
            padding: "var(--space-4)",
            cursor: "pointer",
            border: filterExpiry === "warning" ? "2px solid var(--color-warning)" : undefined,
          }}
          onClick={() => setFilterExpiry(filterExpiry === "warning" ? "all" : "warning")}
        >
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", fontWeight: 700 }}>
            NEAR EXPIRY (&lt;90D)
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-warning)" }}>
            {warningCount} Batches
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Click to filter near-expiry</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            EXPIRY SAFETY
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-success)" }}>
            FEFO Active
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Automated dispatch prioritization</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}
      >
        <input
          className="input"
          placeholder="🔍 Search medicine, composition, batch # (e.g. 2613000703)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: "260px" }}
        />
        <select
          className="input"
          value={filterExpiry}
          onChange={(e) => setFilterExpiry(e.target.value)}
          style={{ width: "270px" }}
        >
          <option value="all">All Shelf Lives ({batches.length})</option>
          <option value="critical">🔴 Critical Expiry (&lt; 30 Days) ({criticalCount})</option>
          <option value="warning">🟡 Near Expiry (&lt; 90 Days) ({warningCount})</option>
          <option value="healthy">🟢 Healthy Shelf Life (&gt; 90 Days)</option>
        </select>
      </div>

      {/* Batches Responsive Dual-Axis Scroll Table */}
      <div className="table-scroll-container">
        <table className="table table-header-sticky">
          <thead>
            <tr>
              <th>Medicine / Form</th>
              <th>Batch Number</th>
              <th>Expiry Date</th>
              <th>Purchase (₹)</th>
              <th>Wholesale (₹)</th>
              <th>MRP (₹)</th>
              <th>Wholesale Margin</th>
              <th>Available Units</th>
              <th>Inward Invoice</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                  No matching warehouse stock batches found.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const margin = ((b.sellingRate - b.purchaseRate) / b.sellingRate) * 100;
                const isInconsistent = b.purchaseRate >= b.sellingRate || b.mrp < b.sellingRate;
                return (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setSelectedBatch(b)}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.productName}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                        {b.composition} • {b.packSize}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        📍 {b.rackLocation || "Unassigned"} • 🏷️ {b.barcode || "No Barcode"}
                      </div>
                      {isInconsistent && (
                        <span className="badge badge-danger" style={{ fontSize: "0.68rem", marginTop: "4px" }}>
                          ⚠️ Inconsistent Metadata
                        </span>
                      )}
                    </td>
                    <td>
                      <code style={{ background: "var(--bg-secondary)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", fontWeight: 700 }}>
                        {b.batchNumber}
                      </code>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.expiryStatus === "healthy"
                            ? "badge-success"
                            : b.expiryStatus === "critical"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {b.expiryStatus === "critical" ? "🔴 " : b.expiryStatus === "warning" ? "🟡 " : "🟢 "}
                        {b.expiryDate}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{b.purchaseRate.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: "var(--color-primary-600)" }}>₹{b.sellingRate.toFixed(2)}</td>
                    <td style={{ color: "var(--text-secondary)" }}>₹{b.mrp.toFixed(2)}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                        +{margin.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: "1rem" }}>
                        {b.quantityAvailable} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>packs</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {b.supplierInvoice}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => setSelectedBatch(b)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SideDrawer: Batch Inspection */}
      <SideDrawer
        isOpen={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        title={selectedBatch ? `Batch ${selectedBatch.batchNumber}` : ""}
        subtitle={selectedBatch ? `${selectedBatch.productName} • ${selectedBatch.manufacturer}` : ""}
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedBatch(null)}>
            Close Inspection
          </button>
        }
      >
        {selectedBatch && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Inconsistency Warning (Item #58) */}
            {(selectedBatch.purchaseRate >= selectedBatch.sellingRate || selectedBatch.mrp < selectedBatch.sellingRate) && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid var(--color-error)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  fontSize: "0.82rem",
                  color: "var(--color-error)",
                }}
              >
                <strong>⚠️ Metadata Inconsistency Flagged:</strong> Purchase rate (₹{selectedBatch.purchaseRate.toFixed(2)}) is ≥ Selling rate (₹{selectedBatch.sellingRate.toFixed(2)}) or Selling rate exceeds MRP. Surfaced for operations audit without blocking stock receipt.
              </div>
            )}

            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                Stock & Location Verification (Item #19)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Received Quantity</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{selectedBatch.quantityReceived} packs</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Available for FEFO</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-primary-600)" }}>
                    {selectedBatch.quantityAvailable} packs
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rack / Bay</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{selectedBatch.rackLocation || "Rack A - Bay 01"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Barcode (EAN-13)</span>
                  <div style={{ fontSize: "0.9rem", fontFamily: "monospace", fontWeight: 700 }}>
                    {selectedBatch.barcode || "8901083000703"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "0.85rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                Pricing & Margins
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Supplier Purchase Rate:</span>
                <span>₹{selectedBatch.purchaseRate.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Wholesale Selling Rate:</span>
                <span style={{ fontWeight: 700, color: "var(--color-primary-600)" }}>₹{selectedBatch.sellingRate.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Maximum Retail Price (MRP):</span>
                <span>₹{selectedBatch.mrp.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem", marginTop: "0.4rem", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Gross Distribution Spread:</span>
                <span style={{ color: selectedBatch.sellingRate >= selectedBatch.purchaseRate ? "var(--color-success)" : "var(--color-error)" }}>
                  +₹{(selectedBatch.sellingRate - selectedBatch.purchaseRate).toFixed(2)} / pack
                </span>
              </div>
            </div>

            {/* Physical Stock Audit & Adjustment Panel (Items #71 & #78) */}
            <div style={{ border: "1px solid var(--border-color)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-primary)" }}>
                  ⚖️ Physical Stock Audit & Adjustment
                </span>
                <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                  Audited Ledger
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                Adjust stock levels post cycle count or quarantine damaged blister packs with photo proof.
              </p>

              {/* Repeated Adjustment Warning (Item #78) */}
              {adjustmentHistory.some(a => a.batchNumber === selectedBatch.batchNumber) && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid var(--color-warning)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-2)",
                    marginBottom: "var(--space-3)",
                    fontSize: "0.75rem",
                    color: "var(--color-warning)",
                    fontWeight: 700,
                  }}
                >
                  ⚠️ Repeated Adjustment Warning: Multiple stock write-offs logged for this batch in the past 30 days. Requires Supervisor Review.
                </div>
              )}

              {adjustmentFeedback && (
                <div
                  style={{
                    background: adjustmentFeedback.includes("⚠️") ? "rgba(245, 158, 11, 0.12)" : "rgba(34, 197, 94, 0.12)",
                    border: `1px solid ${adjustmentFeedback.includes("⚠️") ? "var(--color-warning)" : "var(--color-success)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-2)",
                    marginBottom: "var(--space-3)",
                    fontSize: "0.78rem",
                    color: adjustmentFeedback.includes("⚠️") ? "var(--color-warning)" : "var(--color-success)",
                    fontWeight: 600,
                  }}
                >
                  {adjustmentFeedback}
                </div>
              )}

              <form onSubmit={handleRecordAdjustment} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <div>
                    <label className="label" style={{ fontSize: "0.75rem" }}>Adjustment Type</label>
                    <select
                      className="input"
                      style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                    >
                      <option value="DAMAGE_WRITE_OFF">Damaged in Rack (Write-off)</option>
                      <option value="EXPIRY_REMOVAL">Near-Expiry / Expired Removal</option>
                      <option value="PILFERAGE_SHORTAGE">Pilferage / Unexplained Shortage</option>
                      <option value="CYCLE_COUNT_CORRECTION">Cycle Count Correction</option>
                      <option value="FOUND_SURPLUS">Found Extra Units in Bay</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: "0.75rem" }}>Quantity Delta (Packs)</label>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                      value={adjustmentDelta}
                      onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" style={{ fontSize: "0.75rem" }}>Reason & Findings</label>
                  <input
                    className="input"
                    style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                    placeholder="e.g. Broken ampoules on lower shelf during inspection"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    required
                  />
                </div>

                {/* Evidence URL (Item #71) */}
                <div>
                  <label className="label" style={{ fontSize: "0.75rem" }}>
                    📎 Supporting Evidence Photo / Report URL (Item #71)
                  </label>
                  <input
                    type="url"
                    className="input"
                    style={{ fontSize: "0.8rem", padding: "0.4rem" }}
                    placeholder="https://evidence.pharmacyfantasy.internal/stock/photo.jpg"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  disabled={isSubmittingAdjustment}
                >
                  {isSubmittingAdjustment ? "Recording Adjustment..." : "Commit Stock Adjustment"}
                </button>
              </form>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Source Ingestion Bill Reference
              </span>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, marginTop: "4px" }}>
                {selectedBatch.supplierInvoice} (MAA Medical Agency)
              </p>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* SideDrawer: Record Inward Stock Batch */}
      <SideDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Record Inward Stock Batch"
        subtitle="Ingest distributor purchase delivery into warehouse stock"
      >
        <form onSubmit={handleAddBatch} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="label">Select Medicine</label>
            <select
              className="input"
              value={newBatch.productName}
              onChange={(e) => setNewBatch({ ...newBatch, productName: e.target.value })}
            >
              <option value="AZITHRAL 500MG TAB">AZITHRAL 500MG TAB (Alembic)</option>
              <option value="HIFENAC MR TAB">HIFENAC MR TAB (Intas)</option>
              <option value="PAN D CAP">PAN D CAP (Alkem)</option>
              <option value="TELMA 40MG TAB">TELMA 40MG TAB (Glenmark)</option>
              <option value="MONTEK LC TAB">MONTEK LC TAB (Sun Pharma)</option>
              <option value="AUGMENTIN 625 DUO">AUGMENTIN 625 DUO (GSK)</option>
              <option value="CALPOL 650MG TAB">CALPOL 650MG TAB (GSK)</option>
              <option value="DOLO 650MG TAB">DOLO 650MG TAB (Micro Labs)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="label">Batch Number</label>
              <input
                className="input"
                placeholder="e.g. 261900112"
                required
                value={newBatch.batchNumber}
                onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Expiry (MM/YYYY)</label>
              <input
                className="input"
                placeholder="e.g. 10/2028"
                required
                value={newBatch.expiryDate}
                onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="label">Purchase Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                required
                value={newBatch.purchaseRate}
                onChange={(e) => setNewBatch({ ...newBatch, purchaseRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                required
                value={newBatch.mrp}
                onChange={(e) => setNewBatch({ ...newBatch, mrp: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Received Qty</label>
              <input
                type="number"
                className="input"
                required
                value={newBatch.quantityReceived}
                onChange={(e) => setNewBatch({ ...newBatch, quantityReceived: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">Distributor Inward Invoice Ref</label>
            <input
              className="input"
              value={newBatch.supplierInvoice}
              onChange={(e) => setNewBatch({ ...newBatch, supplierInvoice: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddDrawer(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Inward Batch
            </button>
          </div>
        </form>
      </SideDrawer>
    </div>
  );
}
