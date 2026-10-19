"use client";

import { useState } from "react";
import { SideDrawer } from "@/components/ui/side-drawer";
import { SignaturePad } from "@/components/ui/signature-pad";

interface DeliveryItem {
  id: string;
  orderNumber: string;
  shopName: string;
  address: string;
  phone: string;
  courierName: string;
  vehicle: string;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  assignedAt: string;
  notes: string;
  amount: number;
  podImage?: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([
    {
      id: "del-1",
      orderNumber: "ORD-2026-004448",
      shopName: "Cheap Medical Stores",
      address: "Shop No 14, Main Market, Benachity, Durgapur-13",
      phone: "+91 98321 45678",
      courierName: "Rahul Sharma",
      vehicle: "Two-Wheeler (WB-40-AB-3421)",
      status: "IN_TRANSIT",
      assignedAt: "Today, 09:30 AM",
      notes: "Heavy carton. Deliver at counter #2 before lunch rush.",
      amount: 12742.82,
    },
    {
      id: "del-2",
      orderNumber: "ORD-2026-000538",
      shopName: "Gupta Pharmacy & Clinic",
      address: "A-22 Commercial Complex, City Centre, Durgapur-16",
      phone: "+91 98321 45679",
      courierName: "Bikash Roy",
      vehicle: "Delivery Van (WB-40-CD-8812)",
      status: "ASSIGNED",
      assignedAt: "Today, 10:15 AM",
      notes: "Fragile syrup bottles included. Awaiting warehouse packing slip.",
      amount: 7852.95,
    },
    {
      id: "del-3",
      orderNumber: "ORD-2026-000109",
      shopName: "Cheap Medical Stores",
      address: "Shop No 14, Main Market, Benachity, Durgapur-13",
      phone: "+91 98321 45678",
      courierName: "Rahul Sharma",
      vehicle: "Two-Wheeler (WB-40-AB-3421)",
      status: "DELIVERED",
      assignedAt: "Yesterday, 02:00 PM",
      notes: "Received and stamped by Amitabh Das. UPI Payment confirmed.",
      amount: 6408.94,
      podImage: "Verified Stamp WB-BUR-10492",
    },
  ]);

  const [activeDeliveryForHandover, setActiveDeliveryForHandover] = useState<DeliveryItem | null>(null);
  const [capturedSignature, setCapturedSignature] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  const handleAdvanceStatus = (id: string) => {
    const target = deliveries.find((d) => d.id === id);
    if (!target) return;

    if (target.status === "IN_TRANSIT") {
      setActiveDeliveryForHandover(target);
      setCapturedSignature("");
      setRecipientName("");
      return;
    }

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (d.status === "ASSIGNED") return { ...d, status: "PICKED_UP", notes: "Picked up from Benachity warehouse bay." };
        if (d.status === "PICKED_UP") return { ...d, status: "IN_TRANSIT", notes: "En route to shopkeeper destination." };
        return d;
      })
    );
  };

  const handleConfirmHandover = () => {
    if (!activeDeliveryForHandover) return;
    if (!capturedSignature) {
      alert("Please collect the recipient's signature before confirming delivery.");
      return;
    }

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== activeDeliveryForHandover.id) return d;
        return {
          ...d,
          status: "DELIVERED",
          notes: `Handed over to ${recipientName || "Authorized Pharmacist"}. ePOD Signature verified.`,
          podImage: `Signed by ${recipientName || "Pharmacist"}`,
        };
      })
    );

    setActionSuccess(`Order ${activeDeliveryForHandover.orderNumber} delivered & proof of delivery saved!`);
    setActiveDeliveryForHandover(null);
  };

  const getStatusBadge = (status: DeliveryItem["status"]) => {
    switch (status) {
      case "ASSIGNED":
        return <span className="badge badge-neutral">📋 Assigned at Bay</span>;
      case "PICKED_UP":
        return <span className="badge badge-warning">📦 Picked Up</span>;
      case "IN_TRANSIT":
        return <span className="badge badge-info">🛵 In Transit (En Route)</span>;
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
            Delivery Fleet Operations
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Live dispatch tracker, courier assignment, and electronic proof of delivery (ePOD)
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "rgba(16, 185, 129, 0.12)",
            color: "var(--color-primary-800)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-5)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          ✅ {actionSuccess}
        </div>
      )}

      {/* Delivery Counters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>ASSIGNED / PACKING</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary-600)" }}>
            {deliveries.filter((d) => d.status === "ASSIGNED").length}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Awaiting loading</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>ON THE ROAD (TRANSIT)</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-info)" }}>
            {deliveries.filter((d) => d.status === "IN_TRANSIT" || d.status === "PICKED_UP").length}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active couriers traveling</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>DELIVERED TODAY</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-success)" }}>
            {deliveries.filter((d) => d.status === "DELIVERED").length}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Successfully fulfilled</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>TRANSIT VALUE</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary-800)" }}>
            ₹{deliveries.filter((d) => d.status !== "DELIVERED").reduce((acc, d) => acc + d.amount, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Goods in transit custody</p>
        </div>
      </div>

      {/* Fleet Overview Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(240,253,250,0.8), rgba(244,244,245,0.4))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🏍️</span>
              <div>
                <p style={{ fontWeight: 700 }}>Rahul Sharma</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Hero Splendor (WB-40-AB-3421) • +91 98000 00004</p>
              </div>
            </div>
            <span className="badge badge-success">On Route</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Assigned: <strong>ORD-2026-004448</strong> to Benachity. ETA: 20 mins.
          </p>
        </div>

        <div className="card" style={{ background: "linear-gradient(135deg, rgba(240,253,250,0.8), rgba(244,244,245,0.4))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🚐</span>
              <div>
                <p style={{ fontWeight: 700 }}>Bikash Roy</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Delivery Van (WB-40-CD-8812) • +91 98000 00005</p>
              </div>
            </div>
            <span className="badge badge-warning">At Warehouse</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Assigned: <strong>ORD-2026-000538</strong> to City Centre. Loading scheduled.
          </p>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card">
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          Active Delivery Run Sheet
        </h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order Ref / Amount</th>
                <th>Destination Retailer</th>
                <th>Assigned Courier</th>
                <th>Workflow Status</th>
                <th>Dispatched</th>
                <th>Fulfillment Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((del) => (
                <tr key={del.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--color-primary-700)" }}>
                      {del.orderNumber}
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      ₹{del.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{del.shopName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {del.address}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {del.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{del.courierName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {del.vehicle}
                    </div>
                  </td>
                  <td>
                    <div>{getStatusBadge(del.status)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {del.notes}
                    </div>
                  </td>
                  <td>{del.assignedAt}</td>
                  <td>
                    {del.status === "ASSIGNED" && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => handleAdvanceStatus(del.id)}
                      >
                        📦 Mark Picked Up
                      </button>
                    )}
                    {del.status === "PICKED_UP" && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => handleAdvanceStatus(del.id)}
                      >
                        🛵 Mark In Transit
                      </button>
                    )}
                    {del.status === "IN_TRANSIT" && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "var(--color-success)", borderColor: "var(--color-success)" }}
                        onClick={() => handleAdvanceStatus(del.id)}
                      >
                        ✓ Confirm Delivery
                      </button>
                    )}
                    {del.status === "DELIVERED" && (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 700 }}>
                        ✓ {del.podImage || "ePOD Verified"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover & ePOD Signature Drawer */}
      <SideDrawer
        isOpen={!!activeDeliveryForHandover}
        onClose={() => setActiveDeliveryForHandover(null)}
        title="✍️ Electronic Proof of Delivery (ePOD)"
        subtitle={`Confirm handover for ${activeDeliveryForHandover?.orderNumber} to ${activeDeliveryForHandover?.shopName}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div
            style={{
              padding: "var(--space-3)",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--color-primary-700)" }}>
              {activeDeliveryForHandover?.shopName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {activeDeliveryForHandover?.address}
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, marginTop: "6px" }}>
              Invoice Payable: ₹{activeDeliveryForHandover?.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <label className="label">Receiver / Pharmacist Name *</label>
            <input
              className="input"
              placeholder="e.g. Subrata Mukherjee (Owner)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Pharmacist Digital Signature (Canvas) *</label>
            <SignaturePad
              onSave={(dataUrl) => setCapturedSignature(dataUrl)}
              onClear={() => setCapturedSignature("")}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveDeliveryForHandover(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: "var(--color-success)", borderColor: "var(--color-success)" }}
              onClick={handleConfirmHandover}
            >
              ✓ Complete Handover &amp; Save ePOD
            </button>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
