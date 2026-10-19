"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { PRODUCTS_QUERY } from "@/lib/graphql-queries";
import { SideDrawer } from "@/components/ui/side-drawer";

interface ProductItem {
  id: string;
  name: string;
  composition: string;
  manufacturer: string;
  packSize: string;
  hsnCode: string;
  category: string;
  defaultMrp: number;
  sellingRate: number;
  discount1: number;
  stock: number;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<ProductItem | null>(null);
  const [orderQty, setOrderQty] = useState(30);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState("Cheap Medical Stores");
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const shopkeeperCreditMap: Record<string, { limit: number; balance: number }> = {
    "Cheap Medical Stores": { limit: 50000, balance: 13750 },
    "Gupta Pharmacy & Clinic": { limit: 30000, balance: 11600 },
    "Maa Tara Medical Hall": { limit: 60000, balance: 18000 },
  };

  const { data: qData } = useQuery(PRODUCTS_QUERY, {
    variables: { page: 1, perPage: 20 },
    errorPolicy: "ignore",
  });

  const defaultProducts: ProductItem[] = [
    {
      id: "p1",
      name: "AZITHRAL 500MG TAB",
      composition: "Azithromycin 500mg",
      manufacturer: "Alembic Pharmaceuticals Ltd",
      packSize: "10S",
      hsnCode: "30041090",
      category: "Antibiotics",
      defaultMrp: 126.73,
      sellingRate: 96.56,
      discount1: 12.0,
      stock: 450,
    },
    {
      id: "p2",
      name: "HIFENAC MR TAB",
      composition: "Aceclofenac 100mg + Paracetamol 325mg + Chlorzoxazone 250mg",
      manufacturer: "Intas Pharmaceuticals Ltd",
      packSize: "10S",
      hsnCode: "30049069",
      category: "Pain Relief",
      defaultMrp: 88.01,
      sellingRate: 72.5,
      discount1: 14.0,
      stock: 320,
    },
    {
      id: "p3",
      name: "PAN D CAP",
      composition: "Pantoprazole 40mg + Domperidone 30mg SR",
      manufacturer: "Alkem Laboratories Ltd",
      packSize: "15S",
      hsnCode: "30049099",
      category: "Gastrointestinal",
      defaultMrp: 199.0,
      sellingRate: 145.0,
      discount1: 10.0,
      stock: 600,
    },
    {
      id: "p4",
      name: "TELMA 40MG TAB",
      composition: "Telmisartan 40mg",
      manufacturer: "Glenmark Pharmaceuticals",
      packSize: "15S",
      hsnCode: "30049069",
      category: "Cardiovascular",
      defaultMrp: 145.5,
      sellingRate: 110.0,
      discount1: 10.0,
      stock: 280,
    },
    {
      id: "p5",
      name: "MONTEK LC TAB",
      composition: "Montelukast 10mg + Levocetirizine 5mg",
      manufacturer: "Sun Pharmaceutical Industries",
      packSize: "10S",
      hsnCode: "30049099",
      category: "Anti-allergic",
      defaultMrp: 185.0,
      sellingRate: 138.0,
      discount1: 15.0,
      stock: 500,
    },
    {
      id: "p6",
      name: "AUGMENTIN 625 DUO",
      composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      packSize: "10S",
      hsnCode: "30041090",
      category: "Antibiotics",
      defaultMrp: 223.5,
      sellingRate: 172.0,
      discount1: 8.0,
      stock: 350,
    },
    {
      id: "p7",
      name: "CALPOL 650MG TAB",
      composition: "Paracetamol 650mg",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      packSize: "15S",
      hsnCode: "30049069",
      category: "Analgesic",
      defaultMrp: 33.76,
      sellingRate: 26.0,
      discount1: 5.0,
      stock: 800,
    },
    {
      id: "p8",
      name: "DOLO 650MG TAB",
      composition: "Paracetamol 650mg Fast Acting",
      manufacturer: "Micro Labs Ltd",
      packSize: "15S",
      hsnCode: "30049069",
      category: "Analgesic",
      defaultMrp: 33.76,
      sellingRate: 25.5,
      discount1: 5.0,
      stock: 950,
    },
  ];

  const [products, setProducts] = useState<ProductItem[]>(
    qData?.products?.items?.length
      ? qData.products.items.map((it: any, i: number) => ({
          ...defaultProducts[i % defaultProducts.length],
          id: it.id,
          name: it.name,
          packSize: it.packSize || defaultProducts[i % defaultProducts.length].packSize,
          defaultMrp: it.defaultMrp || defaultProducts[i % defaultProducts.length].defaultMrp,
        }))
      : defaultProducts
  );

  const [newProd, setNewProd] = useState({
    name: "",
    composition: "",
    manufacturer: "",
    packSize: "10S",
    hsnCode: "30049099",
    category: "Antibiotics",
    defaultMrp: 120,
    sellingRate: 95,
    discount1: 10,
    stock: 200,
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ProductItem = {
      id: `p-${Date.now()}`,
      name: newProd.name,
      composition: newProd.composition,
      manufacturer: newProd.manufacturer || "Certified Pharma Labs",
      packSize: newProd.packSize,
      hsnCode: newProd.hsnCode,
      category: newProd.category,
      defaultMrp: Number(newProd.defaultMrp),
      sellingRate: Number(newProd.sellingRate),
      discount1: Number(newProd.discount1),
      stock: Number(newProd.stock),
    };
    setProducts([item, ...products]);
    setShowAddDrawer(false);
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    if (categoryFilter) {
      return matchSearch && p.category === categoryFilter;
    }
    return matchSearch;
  });

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
            Pharmaceutical Catalog & Pricing
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Wholesale medicine master with HSN classification, standard rates, and distributor schemes
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="add-product-btn"
          onClick={() => setShowAddDrawer(true)}
        >
          + Add New Medicine SKU
        </button>
      </div>

      {/* Order Notification Banner */}
      {orderNotification && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          <span>{orderNotification}</span>
          <button
            className="btn btn-secondary"
            style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
            onClick={() => setOrderNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

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
          placeholder="🔍 Search medicines by brand name, active composition, manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="product-search"
          style={{ flex: 1, minWidth: "260px" }}
        />
        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          id="category-filter"
          style={{ width: "220px" }}
        >
          <option value="">All Categories ({products.length} SKUs)</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Pain Relief">Pain Relief</option>
          <option value="Gastrointestinal">Gastrointestinal</option>
          <option value="Cardiovascular">Cardiovascular</option>
          <option value="Anti-allergic">Anti-allergic</option>
          <option value="Analgesic">Analgesic & Antipyretic</option>
        </select>
      </div>

      {/* Products Responsive Dual-Axis Scroll Table */}
      <div className="table-scroll-container">
        <table className="table table-header-sticky">
          <thead>
            <tr>
              <th>Medicine / Manufacturer</th>
              <th>Pack</th>
              <th>HSN Code</th>
              <th>Therapeutic Class</th>
              <th>Wholesale Rate</th>
              <th>MRP (₹)</th>
              <th>Standard Scheme</th>
              <th>Warehouse Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                  No matching pharmaceutical products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelectedProduct(p)}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--color-primary-600)" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {p.composition}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {p.manufacturer}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      {p.packSize}
                    </span>
                  </td>
                  <td>
                    <code style={{ background: "var(--bg-secondary)", padding: "0.2rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
                      {p.hsnCode}
                    </code>
                  </td>
                  <td>
                    <span className="badge badge-info">{p.category}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--color-primary-600)" }}>
                    ₹{p.sellingRate.toFixed(2)}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>₹{p.defaultMrp.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
                      {p.discount1}% Off
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.stock} packs</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-success)" }}>● Available</div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => setSelectedProduct(p)}
                      >
                        Inspect
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => {
                          setQuickOrderProduct(p);
                          setOrderQty(20);
                        }}
                      >
                        ⚡ Order
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SideDrawer: Product Details */}
      <SideDrawer
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? selectedProduct.name : ""}
        subtitle={selectedProduct ? `${selectedProduct.manufacturer} • ${selectedProduct.category}` : ""}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const prod = selectedProduct;
                setSelectedProduct(null);
                setQuickOrderProduct(prod);
                setOrderQty(20);
              }}
            >
              ⚡ Place Wholesale Order
            </button>
          </div>
        }
      >
        {selectedProduct && (
          <>
            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                Active Composition & Packaging
              </div>
              <p style={{ fontWeight: 600, margin: "0 0 6px" }}>{selectedProduct.composition}</p>
              <div style={{ display: "flex", gap: "var(--space-3)", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span>Pack: <strong>{selectedProduct.packSize}</strong></span>
                <span>HSN: <strong>{selectedProduct.hsnCode}</strong></span>
              </div>
            </div>

            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "0.85rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                Statutory Pricing & Schemes
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Maximum Retail Price (MRP):</span>
                <span>₹{selectedProduct.defaultMrp.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Standard Wholesale Rate:</span>
                <span style={{ fontWeight: 700, color: "var(--color-primary-600)" }}>₹{selectedProduct.sellingRate.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Standard Scheme Discount:</span>
                <span style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>{selectedProduct.discount1}% Primary Disc</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Estimated Retail Margin:</span>
                <span style={{ color: "var(--color-success)" }}>
                  ~{(((selectedProduct.defaultMrp - (selectedProduct.sellingRate * (1 - selectedProduct.discount1/100))) / selectedProduct.defaultMrp) * 100).toFixed(1)}% on MRP
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Warehouse Availability
              </span>
              <p style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "4px" }}>
                {selectedProduct.stock} Available Packs
              </p>
            </div>
          </>
        )}
      </SideDrawer>

      {/* SideDrawer: Quick Wholesale Order */}
      <SideDrawer
        isOpen={Boolean(quickOrderProduct)}
        onClose={() => setQuickOrderProduct(null)}
        title="Instant Wholesale Order"
        subtitle={quickOrderProduct ? `${quickOrderProduct.name} • HSN ${quickOrderProduct.hsnCode}` : ""}
      >
        {quickOrderProduct && (() => {
          const rate = quickOrderProduct.sellingRate;
          const gross = rate * orderQty;
          const discountAmount = gross * (quickOrderProduct.discount1 / 100);
          const taxable = gross - discountAmount;
          const gstAmount = taxable * 0.12;
          const netPayable = taxable + gstAmount;

          const creditProfile = shopkeeperCreditMap[selectedShopkeeper] || { limit: 50000, balance: 15000 };
          const availableCredit = creditProfile.limit - creditProfile.balance;
          const isExceeded = netPayable > availableCredit;

          const handleSubmitOrder = (e: React.FormEvent) => {
            e.preventDefault();
            const ordNum = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
            setOrderNotification(`Order ${ordNum} for ${orderQty} packs of ${quickOrderProduct.name} placed successfully! Routed to Warehouse Picking Queue.`);
            setQuickOrderProduct(null);
          };

          return (
            <form onSubmit={handleSubmitOrder} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div>
                <label className="label">Retail Chemist / Buyer Pharmacy</label>
                <select
                  className="input"
                  value={selectedShopkeeper}
                  onChange={(e) => setSelectedShopkeeper(e.target.value)}
                >
                  <option value="Cheap Medical Stores">Cheap Medical Stores (Durgapur)</option>
                  <option value="Gupta Pharmacy & Clinic">Gupta Pharmacy & Clinic (City Centre)</option>
                  <option value="Maa Tara Medical Hall">Maa Tara Medical Hall (Bidhannagar)</option>
                </select>
              </div>

              {/* Live Credit Health */}
              <div style={{ background: "var(--bg-secondary)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Sanctioned Credit Limit:</span>
                  <span style={{ fontWeight: 600 }}>₹{creditProfile.limit.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Outstanding Ledger Balance:</span>
                  <span style={{ fontWeight: 600, color: "var(--color-warning)" }}>₹{creditProfile.balance.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "0.3rem", fontWeight: 700 }}>
                  <span>Available Ordering Credit:</span>
                  <span style={{ color: isExceeded ? "var(--color-danger)" : "var(--color-success)" }}>
                    ₹{availableCredit.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Order Quantity (Packs)</label>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <input
                    type="number"
                    min="1"
                    max={quickOrderProduct.stock}
                    className="input"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    of {quickOrderProduct.stock} in stock
                  </span>
                </div>
              </div>

              {/* Financial Math Preview */}
              <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "0.85rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                  Order Math & GST Breakdown
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span>Gross Rate (₹{rate.toFixed(2)} × {orderQty}):</span>
                  <span>₹{gross.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--color-primary-600)" }}>
                  <span>Standard Scheme Discount ({quickOrderProduct.discount1}%):</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span>Taxable Value:</span>
                  <span style={{ fontWeight: 600 }}>₹{taxable.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--text-secondary)" }}>
                  <span>Applicable GST (CGST 6% + SGST 6%):</span>
                  <span>+₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: "2px solid var(--border-color)", paddingTop: "0.4rem", marginTop: "0.4rem", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem" }}>
                  <span>Net Wholesale Payable:</span>
                  <span style={{ color: "var(--color-primary-600)" }}>₹{netPayable.toFixed(2)}</span>
                </div>
              </div>

              {isExceeded && (
                <div style={{ padding: "var(--space-3)", background: "rgba(239, 68, 68, 0.12)", border: "1px solid var(--color-danger)", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontWeight: 600 }}>
                  ⚠️ Order value exceeds available credit line (₹{availableCredit.toLocaleString()}). Requires Operations Admin approval or advance deposit.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setQuickOrderProduct(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isExceeded}
                  style={{ opacity: isExceeded ? 0.6 : 1, cursor: isExceeded ? "not-allowed" : "pointer" }}
                >
                  Confirm & Route to Picking
                </button>
              </div>
            </form>
          );
        })()}
      </SideDrawer>

      {/* SideDrawer: Add Product SKU */}
      <SideDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Add Medicine SKU"
        subtitle="Catalog pharmaceutical drug in master warehouse inventory"
      >
        <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="label">Medicine Brand Name</label>
            <input
              className="input"
              placeholder="e.g. ZOCON 150 TAB"
              required
              value={newProd.name}
              onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Active Chemical Composition</label>
            <input
              className="input"
              placeholder="e.g. Fluconazole 150mg"
              required
              value={newProd.composition}
              onChange={(e) => setNewProd({ ...newProd, composition: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="label">Manufacturer</label>
              <input
                className="input"
                placeholder="e.g. FDC Limited"
                value={newProd.manufacturer}
                onChange={(e) => setNewProd({ ...newProd, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Therapeutic Category</label>
              <select
                className="input"
                value={newProd.category}
                onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Anti-allergic">Anti-allergic</option>
                <option value="Analgesic">Analgesic</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="label">Pack Size</label>
              <input
                className="input"
                placeholder="e.g. 10S"
                value={newProd.packSize}
                onChange={(e) => setNewProd({ ...newProd, packSize: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Wholesale Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={newProd.sellingRate}
                onChange={(e) => setNewProd({ ...newProd, sellingRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={newProd.defaultMrp}
                onChange={(e) => setNewProd({ ...newProd, defaultMrp: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddDrawer(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Medicine SKU
            </button>
          </div>
        </form>
      </SideDrawer>
    </div>
  );
}
