"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { DASHBOARD_STATS_QUERY, ORDERS_QUERY } from "@/lib/graphql-queries";

export default function DashboardPage() {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, {
    errorPolicy: "ignore",
    pollInterval: 15000,
  });

  const { data: ordersData, loading: ordersLoading } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 5 },
    errorPolicy: "ignore",
  });

  // Real data from seeded DB or fallback
  const liveStats = statsData?.dashboardStats;
  const liveOrders = ordersData?.orders?.items;

  const stats = [
    {
      label: "Total Orders",
      value: statsLoading ? "..." : (liveStats?.totalOrders ?? "3"),
      icon: "📦",
      color: "var(--color-primary-600)",
      sub: "All time wholesale orders",
    },
    {
      label: "Pending Orders",
      value: statsLoading ? "..." : (liveStats?.pendingOrders ?? "1"),
      icon: "⏳",
      color: "var(--color-warning)",
      sub: "Needs warehouse fulfillment",
    },
    {
      label: "Today's Sales",
      value: statsLoading ? "..." : `₹${(liveStats?.todaySales ?? 7852.95).toLocaleString("en-IN")}`,
      icon: "💰",
      color: "var(--color-success)",
      sub: "GST-compliant net invoice",
    },
    {
      label: "Active SKUs",
      value: "10",
      icon: "💊",
      color: "#0284c7",
      sub: "In-stock pharmaceutical lines",
    },
    {
      label: "Expiring in 90D",
      value: statsLoading ? "..." : (liveStats?.expiringBatchesCount ?? "0"),
      icon: "📅",
      color: "#8b5cf6",
      sub: "Batches monitored for FEFO",
    },
    {
      label: "Outstanding Due",
      value: statsLoading ? "..." : `₹${(liveStats?.outstandingPayments ?? 31992.25).toLocaleString("en-IN")}`,
      icon: "🏦",
      color: "var(--color-error)",
      sub: "Shopkeeper credit balance",
    },
  ];

  const recentOrders = liveOrders?.length
    ? liveOrders
    : [
        {
          id: "1",
          orderNumber: "ORD-2026-004448",
          shopkeeper: "Cheap Medical Stores (Benachity)",
          amount: 12742.82,
          status: "DISPATCHED",
          date: "Today, 10:30 AM",
          items: "AZITHRAL 500, HIFENAC MR, PAN D",
        },
        {
          id: "2",
          orderNumber: "ORD-2026-000538",
          shopkeeper: "Gupta Pharmacy (City Centre)",
          amount: 7852.95,
          status: "PICKING",
          date: "Today, 08:15 AM",
          items: "TELMA 40, MONTEK LC",
        },
        {
          id: "3",
          orderNumber: "ORD-2026-000109",
          shopkeeper: "Cheap Medical Stores (Benachity)",
          amount: 6408.94,
          status: "DELIVERED",
          date: "Yesterday",
          items: "CALPOL 650, DOLO 650",
        },
      ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <span className="badge badge-success">✓ Delivered</span>;
      case "DISPATCHED":
        return <span className="badge badge-info">🚚 Out for Delivery</span>;
      case "PICKING":
        return <span className="badge badge-warning">⚙️ Warehouse Picking</span>;
      case "CONFIRMED":
        return <span className="badge badge-primary">Approved</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
              Warehouse Operations Hub
            </h1>
            <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
              ● Live System
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            MAA Eswari Pharmaceuticals • Durgapur Warehouse • GSTIN: 19BKMPG6092H1ZO
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Link href="/dashboard/products" className="btn btn-secondary">
            Browse Catalog
          </Link>
          <Link href="/dashboard/orders" className="btn btn-primary" id="btn-quick-order">
            + Process Order
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: "var(--space-5)",
              borderTop: `3px solid ${stat.color}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "var(--space-1)",
                  }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  background: `${stat.color}15`,
                }}
              >
                {stat.icon}
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "var(--space-6)",
          marginBottom: "var(--space-8)",
        }}
      >
        {/* Recent Orders Section */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div>
              <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
                Live Fulfillment Feed
              </h2>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                Orders moving through picking, packing, and transit
              </p>
            </div>
            <Link href="/dashboard/orders" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order / Shop</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id || ord.orderNumber}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>
                        {ord.orderNumber}
                      </div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                        {ord.shopkeeper || "Retail Pharmacy Store"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        ₹{(ord.amount || ord.netAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Incl. 5% GST
                      </div>
                    </td>
                    <td>{getStatusBadge(ord.status)}</td>
                    <td>
                      <Link
                        href={`/dashboard/orders`}
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action & Delivery Status Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Active Deliveries Quick Card */}
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(236,253,245,0.7), rgba(240,253,250,0.4))", borderColor: "rgba(16,185,129,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ fontSize: "1.2rem" }}>🛵</span>
                <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary-800)" }}>
                  Delivery Fleet Active
                </h3>
              </div>
              <span className="badge badge-success">2 Active Couriers</span>
            </div>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
              Rahul Sharma is en route with order <strong>ORD-2026-004448</strong> for Cheap Medical Stores. Expected ETA: 25 mins.
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Link href="/dashboard/deliveries" className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                Track Delivery Map & Assignments
              </Link>
            </div>
          </div>

          {/* Quick GST Tax Snapshot */}
          <div className="card">
            <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
              ⚡ GST Compliance Snapshot (Current Month)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <div style={{ padding: "var(--space-3)", background: "var(--color-neutral-50)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>SGST (2.5%)</p>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-primary-700)" }}>₹793.79</p>
              </div>
              <div style={{ padding: "var(--space-3)", background: "var(--color-neutral-50)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>CGST (2.5%)</p>
                <p style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-primary-700)" }}>₹793.79</p>
              </div>
            </div>
            <div style={{ marginTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Harmonized HSN 3004 Category</span>
              <Link href="/dashboard/invoices" style={{ fontSize: "0.75rem", color: "var(--color-primary-600)", fontWeight: 600 }}>
                View Invoices →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
