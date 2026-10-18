"use client";

import { useState } from "react";
import { SideDrawer } from "@/components/ui/side-drawer";

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
    },
  ]);

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

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.composition.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterExpiry === "healthy") return matchesSearch && b.expiryStatus === "healthy";
    if (filterExpiry === "warning") return matchesSearch && b.expiryStatus === "warning";
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            ACTIVE BATCHES
          </p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "#0284c7" }}>
            {batches.length} Batches
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>All QA certified</p>
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
          style={{ width: "220px" }}
        >
          <option value="all">All Shelf Lives</option>
          <option value="healthy">Healthy Shelf Life (&gt; 1 Year)</option>
          <option value="warning">Expiring Soon (Advisory Flag)</option>
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
                return (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setSelectedBatch(b)}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.productName}</div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                        {b.composition} • {b.packSize}
                      </div>
                    </td>
                    <td>
                      <code style={{ background: "var(--bg-secondary)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", fontWeight: 700 }}>
                        {b.batchNumber}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${b.expiryStatus === "healthy" ? "badge-success" : "badge-warning"}`}>
                        📅 {b.expiryDate}
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
          <>
            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                Stock Verification
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
                <span style={{ color: "var(--color-success)" }}>
                  +₹{(selectedBatch.sellingRate - selectedBatch.purchaseRate).toFixed(2)} / pack
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Source Ingestion Bill Reference
              </span>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, marginTop: "4px" }}>
                {selectedBatch.supplierInvoice} (MAA Medical Agency)
              </p>
            </div>
          </>
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
