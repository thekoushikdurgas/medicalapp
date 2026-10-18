"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ORDERS_QUERY } from "@/lib/graphql-queries";
import { SideDrawer } from "@/components/ui/side-drawer";

interface OrderRecord {
  id: string;
  orderNumber: string;
  shopkeeper: string;
  location: string;
  itemsSummary: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  netAmount: number;
  status: "PLACED" | "CONFIRMED" | "PICKING" | "PACKED" | "DISPATCHED" | "DELIVERED";
  placedAt: string;
  remarks: string;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showPlaceOrderDrawer, setShowPlaceOrderDrawer] = useState(false);

  const { data: qData } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 20 },
    errorPolicy: "ignore",
  });

  const defaultOrders: OrderRecord[] = [
    {
      id: "ord-1",
      orderNumber: "ORD-2026-004448",
      shopkeeper: "Cheap Medical Stores",
      location: "Main Market, Benachity, Durgapur-13",
      itemsSummary: "AZITHRAL 500 (36), HIFENAC MR (20), PAN D (60)",
      itemCount: 3,
      subtotal: 13626.16,
      discount: 1490.14,
      tax: 606.8,
      netAmount: 12742.82,
      status: "DISPATCHED",
      placedAt: "Today, 08:30 AM",
      remarks: "Urgent monthly stock refill - Please deliver before 2 PM",
    },
    {
      id: "ord-2",
      orderNumber: "ORD-2026-000538",
      shopkeeper: "Gupta Pharmacy & Clinic",
      location: "A-22 City Centre, Durgapur-16",
      itemsSummary: "TELMA 40 (40), MONTEK LC (30)",
      itemCount: 2,
      subtotal: 8540.0,
      discount: 1061.0,
      tax: 373.94,
      netAmount: 7852.95,
      status: "PICKING",
      placedAt: "Today, 07:15 AM",
      remarks: "Replenish cardiovascular and anti-allergic rack",
    },
    {
      id: "ord-3",
      orderNumber: "ORD-2026-000109",
      shopkeeper: "Cheap Medical Stores",
      location: "Main Market, Benachity, Durgapur-13",
      itemsSummary: "CALPOL 650 (100), DOLO 650 (150)",
      itemCount: 2,
      subtotal: 6425.0,
      discount: 321.25,
      tax: 305.18,
      netAmount: 6408.94,
      status: "DELIVERED",
      placedAt: "11 Oct 2026",
      remarks: "Completed delivery with stamp & signature",
    },
    {
      id: "ord-4",
      orderNumber: "ORD-2026-000781",
      shopkeeper: "Maa Tara Medical Hall",
      location: "Bidhannagar Market, Durgapur-12",
      itemsSummary: "AUGMENTIN 625 (25), CLAVAM 625 (30)",
      itemCount: 2,
      subtotal: 9340.0,
      discount: 790.0,
      tax: 427.5,
      netAmount: 8977.5,
      status: "PLACED",
      placedAt: "Today, 11:20 AM",
      remarks: "New online bulk order from retailer portal",
    },
  ];

  const [orders, setOrders] = useState<OrderRecord[]>(
    qData?.orders?.items?.length
      ? qData.orders.items.map((it: any, i: number) => ({
          ...defaultOrders[i % defaultOrders.length],
          id: it.id,
          orderNumber: it.orderNumber,
          netAmount: it.netAmount || defaultOrders[i % defaultOrders.length].netAmount,
          status: it.status || defaultOrders[i % defaultOrders.length].status,
        }))
      : defaultOrders
  );

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
    shopkeeper: "Cheap Medical Stores",
    product: "AZITHRAL 500MG TAB",
    quantity: 30,
    rate: 96.56,
    discount1: 12,
    remarks: "Direct warehouse delivery",
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const baseAmt = newOrder.quantity * newOrder.rate;
    const discAmt = baseAmt * (newOrder.discount1 / 100);
    const taxable = baseAmt - discAmt;
    const taxAmt = taxable * 0.05;
    const net = taxable + taxAmt;

    const ord: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-00${Math.floor(1000 + Math.random() * 9000)}`,
      shopkeeper: newOrder.shopkeeper,
      location: "Registered Store Address, Durgapur",
      itemsSummary: `${newOrder.product} (${newOrder.quantity})`,
      itemCount: 1,
      subtotal: baseAmt,
      discount: discAmt,
      tax: taxAmt,
      netAmount: net,
      status: "PLACED",
      placedAt: "Just now",
      remarks: newOrder.remarks,
    };

    setOrders([ord, ...orders]);
    setShowPlaceOrderDrawer(false);
  };

  const handleUpdateStatus = (id: string, newStatus: OrderRecord["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const statusTabs = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "PLACED", label: "Pending Approval", count: orders.filter((o) => o.status === "PLACED").length },
    { key: "CONFIRMED", label: "Confirmed", count: orders.filter((o) => o.status === "CONFIRMED").length },
    { key: "PICKING", label: "Warehouse Picking", count: orders.filter((o) => o.status === "PICKING").length },
    { key: "DISPATCHED", label: "Dispatched", count: orders.filter((o) => o.status === "DISPATCHED").length },
    { key: "DELIVERED", label: "Delivered", count: orders.filter((o) => o.status === "DELIVERED").length },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shopkeeper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "PLACED":
        return <span className="badge badge-neutral">⏳ Awaiting Approval</span>;
      case "CONFIRMED":
        return <span className="badge badge-primary">✓ Confirmed</span>;
      case "PICKING":
        return <span className="badge badge-warning">⚙️ Warehouse Picking</span>;
      case "PACKED":
        return <span className="badge badge-warning">📦 Packed & Verified</span>;
      case "DISPATCHED":
        return <span className="badge badge-info">🚚 In Courier Transit</span>;
      case "DELIVERED":
        return <span className="badge badge-success">✓ Handed Over</span>;
    }
  };

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
            Bulk Order Fulfillment Hub
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Shopkeeper bulk requests, warehouse picking workflows, and delivery dispatching
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="btn-new-order"
          onClick={() => setShowPlaceOrderDrawer(true)}
        >
          + Create Wholesale Order
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto" }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-secondary"}`}
              style={{ whiteSpace: "nowrap", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div style={{ minWidth: "260px" }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search order #, pharmacy, medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Responsive Table with Dual Scroll & Sticky Header */}
      <div className="table-scroll-container">
        <table className="table table-header-sticky">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Retail Pharmacy</th>
              <th>Prescribed Lines</th>
              <th>Net Bill (₹)</th>
              <th>Order Stage</th>
              <th>Timestamp</th>
              <th>Workflow Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrder(ord)}>
                  <td>
                    <span style={{ fontWeight: 800, color: "var(--color-primary-600)" }}>
                      {ord.orderNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ord.shopkeeper}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {ord.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{ord.itemsSummary}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {ord.itemCount} pharmaceutical line(s)
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>
                      ₹{ord.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      (Base: ₹{ord.subtotal.toFixed(0)} - Disc: ₹{ord.discount.toFixed(0)})
                    </div>
                  </td>
                  <td>{getStatusBadge(ord.status)}</td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {ord.placedAt}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => setSelectedOrder(ord)}
                      >
                        👁️ Details
                      </button>
                      {ord.status === "PLACED" && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => handleUpdateStatus(ord.id, "CONFIRMED")}
                        >
                          Approve
                        </button>
                      )}
                      {ord.status === "CONFIRMED" && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", background: "var(--color-warning)" }}
                          onClick={() => handleUpdateStatus(ord.id, "PICKING")}
                        >
                          Pick Racks
                        </button>
                      )}
                      {ord.status === "PICKING" && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", background: "var(--color-info)" }}
                          onClick={() => handleUpdateStatus(ord.id, "DISPATCHED")}
                        >
                          Dispatch
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SideDrawer: Right Panel Order Details (LinkedIn-Style) */}
      <SideDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ""}
        subtitle={selectedOrder ? `${selectedOrder.shopkeeper} • ${selectedOrder.location}` : ""}
        footer={
          selectedOrder && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {selectedOrder.status === "PLACED" && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "CONFIRMED")}
                >
                  Approve Order
                </button>
              )}
              {selectedOrder.status === "CONFIRMED" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--color-warning)" }}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "PICKING")}
                >
                  Start Warehouse Picking
                </button>
              )}
              {selectedOrder.status === "PICKING" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--color-info)" }}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "DISPATCHED")}
                >
                  Handover to Courier
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close Panel
              </button>
            </div>
          )
        }
      >
        {selectedOrder && (
          <>
            {/* Fulfillment Stepper */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
                Order Fulfillment Lifecycle
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                {[
                  { step: "PLACED", label: "Placed" },
                  { step: "CONFIRMED", label: "Approved" },
                  { step: "PICKING", label: "Picking" },
                  { step: "DISPATCHED", label: "Dispatched" },
                  { step: "DELIVERED", label: "Delivered" },
                ].map((s, idx) => {
                  const stages = ["PLACED", "CONFIRMED", "PICKING", "PACKED", "DISPATCHED", "DELIVERED"];
                  const currentIdx = stages.indexOf(selectedOrder.status);
                  const stepIdx = stages.indexOf(s.step);
                  const isDone = currentIdx >= stepIdx;

                  return (
                    <div key={idx} style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: isDone ? "var(--color-primary-600)" : "var(--color-gray-200)",
                          color: isDone ? "#ffffff" : "var(--color-gray-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          margin: "0 auto 4px",
                        }}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: isDone ? 700 : 500, color: isDone ? "var(--color-primary-600)" : "var(--text-muted)" }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prescribed Items Summary */}
            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                Prescribed Medicines ({selectedOrder.itemCount} Lines)
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{selectedOrder.itemsSummary}</div>
            </div>

            {/* Statutory GST Invoice Breakdown */}
            <div style={{ background: "var(--bg-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "0.85rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                Tax Invoice Breakdown
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Gross Goods Value:</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--color-error)" }}>
                <span>Wholesale Scheme Discount:</span>
                <span>-₹{selectedOrder.discount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>State GST (SGST 2.5%):</span>
                <span>+₹{(selectedOrder.tax / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Central GST (CGST 2.5%):</span>
                <span>+₹{(selectedOrder.tax / 2).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.05rem" }}>
                <span>Total Net Invoice:</span>
                <span style={{ color: "var(--color-primary-600)" }}>₹{selectedOrder.netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Delivery Instructions
              </span>
              <p style={{ fontSize: "0.85rem", marginTop: "4px", color: "var(--text-primary)" }}>
                {selectedOrder.remarks}
              </p>
            </div>
          </>
        )}
      </SideDrawer>

      {/* SideDrawer: Right Panel Create Wholesale Order */}
      <SideDrawer
        isOpen={showPlaceOrderDrawer}
        onClose={() => setShowPlaceOrderDrawer(false)}
        title="Create Wholesale Order"
        subtitle="Place medicine order on behalf of retail pharmacy"
      >
        <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="label">Ordering Pharmacy Store</label>
            <select
              className="input"
              value={newOrder.shopkeeper}
              onChange={(e) => setNewOrder({ ...newOrder, shopkeeper: e.target.value })}
            >
              <option value="Cheap Medical Stores">Cheap Medical Stores (Benachity)</option>
              <option value="Gupta Pharmacy & Clinic">Gupta Pharmacy & Clinic (City Centre)</option>
              <option value="Maa Tara Medical Hall">Maa Tara Medical Hall (Bidhannagar)</option>
            </select>
          </div>

          <div>
            <label className="label">Select Medicine</label>
            <select
              className="input"
              value={newOrder.product}
              onChange={(e) => {
                const rates: Record<string, number> = {
                  "AZITHRAL 500MG TAB": 96.56,
                  "HIFENAC MR TAB": 72.5,
                  "PAN D CAP": 145.0,
                  "TELMA 40MG TAB": 110.0,
                  "MONTEK LC TAB": 138.0,
                  "AUGMENTIN 625 DUO": 172.0,
                  "CALPOL 650MG TAB": 26.0,
                  "DOLO 650MG TAB": 25.5,
                };
                const selected = e.target.value;
                setNewOrder({
                  ...newOrder,
                  product: selected,
                  rate: rates[selected] || 100,
                });
              }}
            >
              <option value="AZITHRAL 500MG TAB">AZITHRAL 500MG TAB (Rate ₹96.56, 12% Disc)</option>
              <option value="HIFENAC MR TAB">HIFENAC MR TAB (Rate ₹72.50, 14% Disc)</option>
              <option value="PAN D CAP">PAN D CAP (Rate ₹145.00, 10% Disc)</option>
              <option value="TELMA 40MG TAB">TELMA 40MG TAB (Rate ₹110.00, 10% Disc)</option>
              <option value="MONTEK LC TAB">MONTEK LC TAB (Rate ₹138.00, 15% Disc)</option>
              <option value="AUGMENTIN 625 DUO">AUGMENTIN 625 DUO (Rate ₹172.00, 8% Disc)</option>
              <option value="CALPOL 650MG TAB">CALPOL 650MG TAB (Rate ₹26.00, 5% Disc)</option>
              <option value="DOLO 650MG TAB">DOLO 650MG TAB (Rate ₹25.50, 5% Disc)</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="label">Quantity (Packs)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Discount Scheme %</label>
              <input
                type="number"
                className="input"
                value={newOrder.discount1}
                onChange={(e) => setNewOrder({ ...newOrder, discount1: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ background: "var(--bg-secondary)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Gross (Qty × Rate):</span>
              <span>₹{(newOrder.quantity * newOrder.rate).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-error)" }}>
              <span>Discount ({newOrder.discount1}%):</span>
              <span>-₹{((newOrder.quantity * newOrder.rate) * (newOrder.discount1 / 100)).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--border-color)", marginTop: "4px", paddingTop: "4px" }}>
              <span>Estimated Net (incl. 5% GST):</span>
              <span style={{ color: "var(--color-primary-600)" }}>
                ₹{(((newOrder.quantity * newOrder.rate) * (1 - newOrder.discount1 / 100)) * 1.05).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Delivery Instructions</label>
            <input
              className="input"
              value={newOrder.remarks}
              onChange={(e) => setNewOrder({ ...newOrder, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPlaceOrderDrawer(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Transmit Order
            </button>
          </div>
        </form>
      </SideDrawer>
    </div>
  );
}
