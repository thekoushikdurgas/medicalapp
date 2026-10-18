"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { DASHBOARD_STATS_QUERY, ORDERS_QUERY } from "@/lib/graphql-queries";
import { AUTH_KEYS, ROLE_META, getStoredUser } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) { router.replace("/login"); return; }
    const u = getStoredUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius-full)" }} />
      </div>
    );
  }

  switch (user.role) {
    case "SUPER_ADMIN":
      return <SuperAdminDashboard user={user} />;
    case "ADMIN":
      return <AdminDashboard user={user} />;
    case "WAREHOUSE":
      return <WarehouseDashboard user={user} />;
    case "DELIVERY":
      return <DeliveryDashboard user={user} />;
    case "SHOPKEEPER":
      return <ShopkeeperDashboard user={user} />;
    default:
      return <SuperAdminDashboard user={user} />;
  }
}

// ── Shared types & helpers ──────────────────────────────────

interface DashboardProps {
  user: { role: UserRole; fullName: string; email: string };
}

function DashboardHeader({ user, title, subtitle }: DashboardProps & { title: string; subtitle: string }) {
  const meta = ROLE_META[user.role];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>{title}</h1>
          <span className="badge" style={{ background: `${meta.color}20`, color: meta.color, fontSize: "0.75rem" }}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>{subtitle}</p>
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        👤 {user.fullName}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string | number; color: string; sub: string }) {
  return (
    <div className="card" style={{ padding: "var(--space-5)", borderTop: `3px solid ${color}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
        <div>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--text-primary)", marginTop: "var(--space-1)" }}>{value}</p>
        </div>
        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", background: `${color}15` }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}

function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
      {children}
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <Link href={href} className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4)", textDecoration: "none", borderLeft: `4px solid ${color}`, cursor: "pointer" }}>
      <span style={{ fontSize: "1.5rem" }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "var(--font-size-sm)" }}>{label}</p>
      </div>
    </Link>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "DELIVERED": return <span className="badge badge-success">✓ Delivered</span>;
    case "DISPATCHED": return <span className="badge badge-info">🚚 Dispatched</span>;
    case "PICKING": return <span className="badge badge-warning">⚙️ Picking</span>;
    case "CONFIRMED": return <span className="badge badge-primary">Approved</span>;
    case "PLACED": return <span className="badge badge-neutral">📋 Placed</span>;
    default: return <span className="badge badge-neutral">{status}</span>;
  }
};

// ── 1. SUPER ADMIN DASHBOARD ────────────────────────────────

function SuperAdminDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, { errorPolicy: "ignore", pollInterval: 15000 });
  const { data: ordersData } = useQuery(ORDERS_QUERY, { variables: { page: 1, perPage: 5 }, errorPolicy: "ignore" });

  const s = statsData?.dashboardStats;
  const orders = ordersData?.orders?.items || DEMO_ORDERS;

  return (
    <div className="animate-fade-in">
      <DashboardHeader user={user} title="Command Center" subtitle="MAA Eswari Pharmaceuticals • Full System Oversight • GSTIN: 19BKMPG6092H1ZO" />

      <StatsGrid>
        <StatCard icon="📦" label="Total Orders" value={statsLoading ? "..." : s?.totalOrders ?? 3} color="var(--color-primary-600)" sub="All time wholesale orders" />
        <StatCard icon="⏳" label="Pending Orders" value={statsLoading ? "..." : s?.pendingOrders ?? 1} color="var(--color-warning)" sub="Needs warehouse fulfillment" />
        <StatCard icon="💰" label="Today's Sales" value={statsLoading ? "..." : `₹${(s?.todaySales ?? 7852.95).toLocaleString("en-IN")}`} color="var(--color-success)" sub="GST-compliant net invoice" />
        <StatCard icon="💊" label="Active SKUs" value="10" color="#0284c7" sub="In-stock pharmaceutical lines" />
        <StatCard icon="📅" label="Expiring in 90D" value={statsLoading ? "..." : s?.expiringBatchesCount ?? 0} color="#8b5cf6" sub="Batches monitored for FEFO" />
        <StatCard icon="🏦" label="Outstanding Due" value={statsLoading ? "..." : `₹${(s?.outstandingPayments ?? 31992.25).toLocaleString("en-IN")}`} color="var(--color-error)" sub="Shopkeeper credit balance" />
      </StatsGrid>

      {/* Quick Actions */}
      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>⚡ Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        <QuickAction href="/dashboard/users" icon="👥" label="Manage Users & Roles" color="#7c3aed" />
        <QuickAction href="/dashboard/orders" icon="🛒" label="Process Orders" color="var(--color-primary-600)" />
        <QuickAction href="/dashboard/reports" icon="📊" label="Financial Reports" color="#0284c7" />
        <QuickAction href="/dashboard/inventory" icon="📦" label="Warehouse Inventory" color="#d97706" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Live Fulfillment Feed</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>All orders across the system</p>
          </div>
          <Link href="/dashboard/orders" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}>View All →</Link>
        </div>
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}

// ── 2. OPERATIONS ADMIN DASHBOARD ───────────────────────────

function AdminDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, { errorPolicy: "ignore", pollInterval: 15000 });
  const { data: ordersData } = useQuery(ORDERS_QUERY, { variables: { page: 1, perPage: 5 }, errorPolicy: "ignore" });

  const s = statsData?.dashboardStats;
  const orders = ordersData?.orders?.items || DEMO_ORDERS;

  return (
    <div className="animate-fade-in">
      <DashboardHeader user={user} title="Operations Hub" subtitle="Order processing, delivery assignment & daily operations" />

      <StatsGrid>
        <StatCard icon="📦" label="Total Orders" value={statsLoading ? "..." : s?.totalOrders ?? 3} color="var(--color-primary-600)" sub="All time orders" />
        <StatCard icon="⏳" label="Pending Approval" value={statsLoading ? "..." : s?.pendingOrders ?? 1} color="var(--color-warning)" sub="Needs your confirmation" />
        <StatCard icon="💰" label="Today's Revenue" value={statsLoading ? "..." : `₹${(s?.todaySales ?? 7852.95).toLocaleString("en-IN")}`} color="var(--color-success)" sub="Net invoice amount" />
        <StatCard icon="🏦" label="Outstanding Payments" value={statsLoading ? "..." : `₹${(s?.outstandingPayments ?? 31992.25).toLocaleString("en-IN")}`} color="var(--color-error)" sub="Pending shopkeeper dues" />
      </StatsGrid>

      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>⚡ Daily Operations</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        <QuickAction href="/dashboard/orders" icon="✅" label="Approve Pending Orders" color="var(--color-warning)" />
        <QuickAction href="/dashboard/deliveries" icon="🚚" label="Assign Delivery Boys" color="var(--color-primary-600)" />
        <QuickAction href="/dashboard/invoices" icon="🧾" label="Generate Invoices" color="#0284c7" />
        <QuickAction href="/dashboard/shopkeepers" icon="🏪" label="Register New Shopkeeper" color="#dc2626" />
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Recent Orders</h2>
          <Link href="/dashboard/orders" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}>View All →</Link>
        </div>
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}

// ── 3. WAREHOUSE STAFF DASHBOARD ────────────────────────────

function WarehouseDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, { errorPolicy: "ignore" });

  const s = statsData?.dashboardStats;

  const pickingQueue = [
    { id: "1", orderNumber: "ORD-2026-004448", shop: "Cheap Medical Stores", items: "AZITHRAL 500 x12, HIFENAC MR x20", priority: "HIGH" },
    { id: "2", orderNumber: "ORD-2026-000538", shop: "Gupta Pharmacy", items: "TELMA 40 x10, MONTEK LC x15", priority: "NORMAL" },
  ];

  return (
    <div className="animate-fade-in">
      <DashboardHeader user={user} title="Warehouse Floor" subtitle="Stock management, order picking & batch tracking" />

      <StatsGrid>
        <StatCard icon="📋" label="Orders to Pick" value={statsLoading ? "..." : s?.pendingOrders ?? 2} color="var(--color-warning)" sub="Confirmed & awaiting pick" />
        <StatCard icon="💊" label="Active SKUs" value="10" color="#0284c7" sub="Products in warehouse" />
        <StatCard icon="📅" label="Expiring Soon" value={statsLoading ? "..." : s?.expiringBatchesCount ?? 0} color="#8b5cf6" sub="Batches expiring in 90 days" />
        <StatCard icon="⚠️" label="Low Stock" value={statsLoading ? "..." : s?.lowStockCount ?? 0} color="var(--color-error)" sub="Items needing reorder" />
      </StatsGrid>

      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>⚡ Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        <QuickAction href="/dashboard/inventory" icon="📦" label="Stock Check & Adjustment" color="#d97706" />
        <QuickAction href="/dashboard/products" icon="💊" label="Add New Product" color="var(--color-primary-600)" />
        <QuickAction href="/dashboard/orders" icon="📋" label="View Picking Queue" color="var(--color-warning)" />
      </div>

      {/* Picking Queue */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>📋 Picking Queue</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>Orders confirmed & ready for picking</p>
          </div>
          <Link href="/dashboard/orders" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}>Full Queue →</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Shop</th>
                <th>Items</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pickingQueue.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{q.orderNumber}</td>
                  <td>{q.shop}</td>
                  <td style={{ fontSize: "var(--font-size-xs)", maxWidth: "200px" }}>{q.items}</td>
                  <td>
                    <span className={`badge ${q.priority === "HIGH" ? "badge-error" : "badge-neutral"}`}>
                      {q.priority}
                    </span>
                  </td>
                  <td>
                    <Link href="/dashboard/orders" className="btn btn-primary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}>
                      Start Picking
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 4. DELIVERY BOY DASHBOARD ───────────────────────────────

function DeliveryDashboard({ user }: DashboardProps) {
  const myDeliveries = [
    { id: "1", orderNumber: "ORD-2026-004448", shop: "Cheap Medical Stores", address: "Benachity, Durgapur", amount: 12742.82, status: "IN_TRANSIT", payment: "CASH" },
    { id: "2", orderNumber: "ORD-2026-000538", shop: "Gupta Pharmacy", address: "City Centre, Durgapur", amount: 7852.95, status: "ASSIGNED", payment: "UPI" },
  ];

  const activeCount = myDeliveries.filter((d) => d.status !== "DELIVERED").length;
  const todayTotal = myDeliveries.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="animate-fade-in">
      <DashboardHeader user={user} title="My Deliveries" subtitle="Your assigned routes and delivery status updates" />

      <StatsGrid>
        <StatCard icon="🛵" label="Active Deliveries" value={activeCount} color="var(--color-primary-600)" sub="Currently assigned to you" />
        <StatCard icon="📦" label="Today's Packages" value={myDeliveries.length} color="#d97706" sub="Total orders for today" />
        <StatCard icon="💰" label="Cash to Collect" value={`₹${todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} color="var(--color-success)" sub="COD amount on route" />
        <StatCard icon="✅" label="Delivered Today" value="0" color="#8b5cf6" sub="Successfully completed" />
      </StatsGrid>

      {/* Active Deliveries */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          🚚 Today&apos;s Route
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {myDeliveries.map((d, i) => (
            <div key={d.id} className="card" style={{ border: d.status === "IN_TRANSIT" ? "2px solid var(--color-primary-400)" : "1px solid var(--border-color)", padding: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary-600)" }}>#{i + 1}</span>
                    <span style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{d.orderNumber}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{d.shop}</p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>📍 {d.address}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, fontSize: "var(--font-size-lg)" }}>₹{d.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  <span className={`badge ${d.status === "IN_TRANSIT" ? "badge-info" : "badge-warning"}`}>
                    {d.status === "IN_TRANSIT" ? "🚚 In Transit" : "📋 Assigned"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
                {d.status === "ASSIGNED" && (
                  <button className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}>
                    Start Delivery
                  </button>
                )}
                {d.status === "IN_TRANSIT" && (
                  <>
                    <button className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}>
                      ✅ Mark Delivered
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}>
                      ❌ Failed
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method reminder */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(236,253,245,0.7), rgba(240,253,250,0.4))", borderColor: "rgba(16,185,129,0.3)" }}>
        <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary-800)", marginBottom: "var(--space-2)" }}>
          💡 Payment Collection Reminder
        </h3>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
          Collect cash on delivery and update status immediately. UPI payments are auto-confirmed.
        </p>
      </div>
    </div>
  );
}

// ── 5. SHOPKEEPER DASHBOARD ─────────────────────────────────

function ShopkeeperDashboard({ user }: DashboardProps) {
  const myOrders = [
    { id: "1", orderNumber: "ORD-2026-004448", amount: 12742.82, status: "DISPATCHED", date: "Today, 10:30 AM", items: "AZITHRAL 500, HIFENAC MR, PAN D" },
    { id: "2", orderNumber: "ORD-2026-000109", amount: 6408.94, status: "DELIVERED", date: "Yesterday", items: "CALPOL 650, DOLO 650" },
  ];

  const pendingDue = myOrders.filter((o) => o.status !== "DELIVERED").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="animate-fade-in">
      <DashboardHeader user={user} title="My Store Portal" subtitle="Order medicines, track deliveries & view invoices" />

      <StatsGrid>
        <StatCard icon="🛒" label="My Orders" value={myOrders.length} color="var(--color-primary-600)" sub="Total orders placed" />
        <StatCard icon="🚚" label="In Transit" value={myOrders.filter((o) => o.status === "DISPATCHED").length} color="#d97706" sub="On the way to your shop" />
        <StatCard icon="💳" label="Pending Due" value={`₹${pendingDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} color="var(--color-error)" sub="Outstanding payment" />
        <StatCard icon="✅" label="Completed" value={myOrders.filter((o) => o.status === "DELIVERED").length} color="var(--color-success)" sub="Successfully delivered" />
      </StatsGrid>

      {/* Quick Actions */}
      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>⚡ Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        <QuickAction href="/dashboard/products" icon="💊" label="Browse Catalog & Order" color="var(--color-primary-600)" />
        <QuickAction href="/dashboard/orders" icon="📋" label="Track My Orders" color="#d97706" />
        <QuickAction href="/dashboard/invoices" icon="🧾" label="View My Invoices" color="#0284c7" />
      </div>

      {/* My Recent Orders */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>📦 My Recent Orders</h2>
          <Link href="/dashboard/orders" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}>View All →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {myOrders.map((o) => (
            <div key={o.id} className="card" style={{ padding: "var(--space-4)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-primary-700)", marginBottom: "var(--space-1)" }}>{o.orderNumber}</p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>{o.items}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>{o.date}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, marginBottom: "var(--space-1)" }}>₹{o.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  {getStatusBadge(o.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared order table ──────────────────────────────────────

function OrderTable({ orders }: { orders: any[] }) {
  return (
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
          {orders.map((ord: any) => (
            <tr key={ord.id || ord.orderNumber}>
              <td>
                <div style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{ord.orderNumber}</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>{ord.shopkeeper || "Retail Pharmacy Store"}</div>
              </td>
              <td>
                <div style={{ fontWeight: 700 }}>₹{(ord.amount || ord.netAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Incl. 5% GST</div>
              </td>
              <td>{getStatusBadge(ord.status)}</td>
              <td>
                <Link href="/dashboard/orders" className="btn btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}>
                  Inspect
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Demo data ──────────────────────────────────────────────

const DEMO_ORDERS = [
  { id: "1", orderNumber: "ORD-2026-004448", shopkeeper: "Cheap Medical Stores (Benachity)", amount: 12742.82, status: "DISPATCHED", date: "Today, 10:30 AM" },
  { id: "2", orderNumber: "ORD-2026-000538", shopkeeper: "Gupta Pharmacy (City Centre)", amount: 7852.95, status: "PICKING", date: "Today, 08:15 AM" },
  { id: "3", orderNumber: "ORD-2026-000109", shopkeeper: "Cheap Medical Stores (Benachity)", amount: 6408.94, status: "DELIVERED", date: "Yesterday" },
];
