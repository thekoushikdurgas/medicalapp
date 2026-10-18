"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import {
  Package,
  Clock,
  IndianRupee,
  Pill,
  CalendarClock,
  CreditCard,
  Users,
  ShoppingCart,
  BarChart3,
  Store,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { DASHBOARD_STATS_QUERY, ORDERS_QUERY } from "@/lib/graphql-queries";
import { AUTH_KEYS, ROLE_META, getStoredUser } from "@/lib/auth";
import type { UserRole } from "@/types";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TrendAreaChart, OrderFlowTimeline } from "@/components/ui/kpi-chart";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      router.replace("/login");
      return;
    }
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="skeleton"
          style={{ width: 56, height: 56, borderRadius: "var(--radius-full)" }}
        />
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

function DashboardHeader({
  user,
  title,
  subtitle,
}: DashboardProps & { title: string; subtitle: string }) {
  const meta = ROLE_META[user.role];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <span
            className="badge"
            style={{
              background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
              color: meta.color,
              fontSize: "0.75rem",
              fontWeight: 600,
              border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
            }}
          >
            {meta.label}
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)", fontSize: "var(--font-size-sm)" }}>
          {subtitle}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          background: "var(--bg-primary)",
          padding: "var(--space-2) var(--space-4)",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-success)",
            animation: "pulse 2s infinite",
          }}
        />
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", fontWeight: 500 }}>
          {user.fullName}
        </span>
      </div>
    </div>
  );
}

function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="stagger-in"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}
    >
      {children}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        textDecoration: "none",
        borderLeft: `4px solid ${color}`,
        cursor: "pointer",
        transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
      }}
    >
      <div
        className="icon-animate"
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "var(--font-size-sm)" }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {description}
          </p>
        )}
      </div>
      <ArrowRight size={14} color="var(--text-muted)" />
    </Link>
  );
}

// ── Sample 7-day Wholesale Chart Data ───────────────────────
const REVENUE_DATA = [
  { label: "Mon", value: 34200 },
  { label: "Tue", value: 42150 },
  { label: "Wed", value: 38900 },
  { label: "Thu", value: 54600 },
  { label: "Fri", value: 68400 },
  { label: "Sat", value: 71200 },
  { label: "Sun", value: 78529 },
];

// ── 1. SUPER ADMIN DASHBOARD ────────────────────────────────

function SuperAdminDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, {
    errorPolicy: "ignore",
    pollInterval: 15000,
  });
  const { data: ordersData } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 5 },
    errorPolicy: "ignore",
  });

  const s = statsData?.dashboardStats;
  const orders = ordersData?.orders?.items || DEMO_ORDERS;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <DashboardHeader
        user={user}
        title="Command Center"
        subtitle="MAA Eswari Pharmaceuticals • Full System Oversight • GSTIN: 19BKMPG6092H1ZO"
      />

      {/* KPI Cards */}
      <StatsGrid>
        <StatCard
          icon={<Package size={22} />}
          label="Total Orders"
          value={statsLoading ? "..." : s?.totalOrders ?? 3}
          color="var(--color-primary-600)"
          sub="All-time wholesale volume"
          trend={{ value: "+14.2% MoM", isPositive: true }}
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending Orders"
          value={statsLoading ? "..." : s?.pendingOrders ?? 1}
          color="var(--color-warning)"
          sub="Awaiting warehouse pick"
          trend={{ value: "1 high priority", isNeutral: true }}
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Today's Sales"
          value={statsLoading ? "..." : `₹${(s?.todaySales ?? 7852.95).toLocaleString("en-IN")}`}
          color="var(--color-success)"
          sub="GST-compliant net invoice"
          trend={{ value: "+8.5% vs yesterday", isPositive: true }}
        />
        <StatCard
          icon={<Pill size={22} />}
          label="Active SKUs"
          value="10"
          color="#0284c7"
          sub="In-stock pharma lines"
          trend={{ value: "100% compliant", isPositive: true }}
        />
        <StatCard
          icon={<CalendarClock size={22} />}
          label="Expiring in 90D"
          value={statsLoading ? "..." : s?.expiringBatchesCount ?? 0}
          color="#8b5cf6"
          sub="Batches tracked by FEFO"
          trend={{ value: "0 risk items", isPositive: true }}
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Outstanding Due"
          value={statsLoading ? "..." : `₹${(s?.outstandingPayments ?? 31992.25).toLocaleString("en-IN")}`}
          color="var(--color-error)"
          sub="Shopkeeper credit ledger"
          trend={{ value: "4 retail accounts", isNeutral: true }}
        />
      </StatsGrid>

      {/* Interactive Charts & Flow Graphs Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <TrendAreaChart
          title="Wholesale Revenue Velocity"
          subtitle="Net verified sales over the last 7 calendar days"
          data={REVENUE_DATA}
          color="#059669"
        />

        <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--text-primary)" }}>
                Warehouse & Logistics Health
              </h3>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                Operational threshold monitoring
              </p>
            </div>
            <Activity size={18} color="var(--color-primary-600)" className="icon-pulse" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-2)" }}>
            <ProgressBar
              value={88}
              label="FEFO Batch Allocation Rate"
              sublabel="Near-expiry prioritized"
              color="success"
            />
            <ProgressBar
              value={65}
              label="Daily Delivery Route Completion"
              sublabel="13/20 shops covered"
              color="primary"
            />
            <ProgressBar
              value={42}
              label="Credit Collection Target (Monthly)"
              sublabel="₹45,000 / ₹1,00,000"
              color="warning"
            />
            <ProgressBar
              value={96}
              label="Tax Compliance & E-Way Bills"
              sublabel="100% generated"
              color="info"
            />
          </div>
        </div>
      </div>

      {/* Order Fulfillment Pipeline Timeline */}
      <OrderFlowTimeline
        currentStep="DISPATCHED"
        orderNumber="ORD-2026-004448"
        orderDate="Today, 10:30 AM • Delivery to Cheap Medical Stores"
      />

      {/* Quick Actions Grid */}
      <div>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Sparkles size={18} color="var(--color-primary-600)" />
          Quick Actions & Operations
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          <QuickAction
            href="/dashboard/users"
            icon={<Users size={20} />}
            label="Manage Users & Roles"
            description="Role permissions & access"
            color="#7c3aed"
          />
          <QuickAction
            href="/dashboard/orders"
            icon={<ShoppingCart size={20} />}
            label="Wholesale Order Queue"
            description="Verify approvals & stock"
            color="var(--color-primary-600)"
          />
          <QuickAction
            href="/dashboard/reports"
            icon={<BarChart3 size={20} />}
            label="Financial Analytics"
            description="GST, sales & margin P&L"
            color="#0284c7"
          />
          <QuickAction
            href="/dashboard/inventory"
            icon={<Package size={20} />}
            label="Inventory & Batches"
            description="FEFO & stock adjustments"
            color="#d97706"
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Live Fulfillment Feed</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
              Real-time orders processed across registered pharmacies
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary-600)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}

// ── 2. OPERATIONS ADMIN DASHBOARD ───────────────────────────

function AdminDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, {
    errorPolicy: "ignore",
    pollInterval: 15000,
  });
  const { data: ordersData } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 5 },
    errorPolicy: "ignore",
  });

  const s = statsData?.dashboardStats;
  const orders = ordersData?.orders?.items || DEMO_ORDERS;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <DashboardHeader
        user={user}
        title="Operations Hub"
        subtitle="Order confirmation, delivery dispatch & daily ledger monitoring"
      />

      <StatsGrid>
        <StatCard
          icon={<Package size={22} />}
          label="Total Orders"
          value={statsLoading ? "..." : s?.totalOrders ?? 3}
          color="var(--color-primary-600)"
          sub="All-time volume"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Pending Approval"
          value={statsLoading ? "..." : s?.pendingOrders ?? 1}
          color="var(--color-warning)"
          sub="Requires admin review"
          trend={{ value: "Action required", isNeutral: true }}
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Today's Revenue"
          value={statsLoading ? "..." : `₹${(s?.todaySales ?? 7852.95).toLocaleString("en-IN")}`}
          color="var(--color-success)"
          sub="Net billed invoice"
          trend={{ value: "+12.4%", isPositive: true }}
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Outstanding Dues"
          value={statsLoading ? "..." : `₹${(s?.outstandingPayments ?? 31992.25).toLocaleString("en-IN")}`}
          color="var(--color-error)"
          sub="Pending receivables"
        />
      </StatsGrid>

      {/* Daily Operations Quick Actions */}
      <div>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          ⚡ Daily Operations
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          <QuickAction
            href="/dashboard/orders"
            icon={<FileCheck size={20} />}
            label="Approve Pending Orders"
            description="Verify stock & confirm"
            color="var(--color-warning)"
          />
          <QuickAction
            href="/dashboard/deliveries"
            icon={<Truck size={20} />}
            label="Assign Delivery Boy"
            description="Optimize delivery routes"
            color="var(--color-primary-600)"
          />
          <QuickAction
            href="/dashboard/invoices"
            icon={<IndianRupee size={20} />}
            label="Generate Tax Invoices"
            description="GST compliance bills"
            color="#0284c7"
          />
          <QuickAction
            href="/dashboard/shopkeepers"
            icon={<Store size={20} />}
            label="Register Shopkeeper"
            description="Add pharmacy retail store"
            color="#dc2626"
          />
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Recent Wholesale Orders</h2>
          <Link
            href="/dashboard/orders"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}
          >
            View All →
          </Link>
        </div>
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}

// ── 3. WAREHOUSE STAFF DASHBOARD ────────────────────────────

function WarehouseDashboard({ user }: DashboardProps) {
  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY, {
    errorPolicy: "ignore",
  });

  const s = statsData?.dashboardStats;

  const pickingQueue = [
    {
      id: "1",
      orderNumber: "ORD-2026-004448",
      shop: "Cheap Medical Stores",
      items: "AZITHRAL 500 x12, HIFENAC MR x20",
      priority: "HIGH",
    },
    {
      id: "2",
      orderNumber: "ORD-2026-000538",
      shop: "Gupta Pharmacy",
      items: "TELMA 40 x10, MONTEK LC x15",
      priority: "NORMAL",
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <DashboardHeader
        user={user}
        title="Warehouse Operations Floor"
        subtitle="Stock management, FEFO picking queue & batch allocation"
      />

      <StatsGrid>
        <StatCard
          icon={<Clock size={22} />}
          label="Orders to Pick"
          value={statsLoading ? "..." : s?.pendingOrders ?? 2}
          color="var(--color-warning)"
          sub="Confirmed & awaiting pick"
        />
        <StatCard
          icon={<Pill size={22} />}
          label="Active SKUs"
          value="10"
          color="#0284c7"
          sub="Pharma lines in stock"
        />
        <StatCard
          icon={<CalendarClock size={22} />}
          label="Expiring Soon"
          value={statsLoading ? "..." : s?.expiringBatchesCount ?? 0}
          color="#8b5cf6"
          sub="Expiring within 90 days"
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          label="Low Stock Items"
          value={statsLoading ? "..." : s?.lowStockCount ?? 0}
          color="var(--color-error)"
          sub="Reorder threshold reached"
        />
      </StatsGrid>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-3)" }}>
        <QuickAction
          href="/dashboard/inventory"
          icon={<Package size={20} />}
          label="Stock Check & Adjust"
          description="Update batch & rack"
          color="#d97706"
        />
        <QuickAction
          href="/dashboard/products"
          icon={<Pill size={20} />}
          label="Add Product SKU"
          description="Register new medicine"
          color="var(--color-primary-600)"
        />
        <QuickAction
          href="/dashboard/orders"
          icon={<Layers size={20} />}
          label="Full Picking Queue"
          description="Batch picking sheet"
          color="var(--color-warning)"
        />
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>Priority Picking Queue</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
              Allocate stock according to earliest expiry (FEFO)
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}
          >
            Full Queue →
          </Link>
        </div>

        <div className="table-scroll-container">
          <table className="table table-header-sticky">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Retail Pharmacy</th>
                <th>Medicines & Qty</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pickingQueue.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{q.orderNumber}</td>
                  <td>{q.shop}</td>
                  <td style={{ fontSize: "var(--font-size-xs)", maxWidth: "260px" }}>{q.items}</td>
                  <td>
                    <StatusBadge status={q.priority} label={q.priority} />
                  </td>
                  <td>
                    <Link
                      href="/dashboard/orders"
                      className="btn btn-primary"
                      style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                    >
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
    {
      id: "1",
      orderNumber: "ORD-2026-004448",
      shop: "Cheap Medical Stores",
      address: "Benachity Market, Durgapur",
      amount: 12742.82,
      status: "IN_TRANSIT",
      payment: "CASH",
    },
    {
      id: "2",
      orderNumber: "ORD-2026-000538",
      shop: "Gupta Pharmacy",
      address: "City Centre Commercial Complex, Durgapur",
      amount: 7852.95,
      status: "ASSIGNED",
      payment: "UPI",
    },
  ];

  const activeCount = myDeliveries.filter((d) => d.status !== "DELIVERED").length;
  const todayTotal = myDeliveries.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <DashboardHeader
        user={user}
        title="My Delivery Hub"
        subtitle="Assigned wholesale runs, cash-on-delivery tracking & drop-off confirmation"
      />

      <StatsGrid>
        <StatCard
          icon={<Truck size={22} />}
          label="Active Deliveries"
          value={activeCount}
          color="var(--color-primary-600)"
          sub="Assigned runs for today"
        />
        <StatCard
          icon={<Package size={22} />}
          label="Today's Packages"
          value={myDeliveries.length}
          color="#d97706"
          sub="Confirmed boxes"
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          label="Cash to Collect"
          value={`₹${todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          color="var(--color-success)"
          sub="COD on current route"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Delivered Today"
          value="0"
          color="#8b5cf6"
          sub="Successfully dropped"
        />
      </StatsGrid>

      <div className="card">
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Truck size={20} color="var(--color-primary-600)" />
          Today&apos;s Active Delivery Route
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {myDeliveries.map((d, i) => (
            <div
              key={d.id}
              className="card"
              style={{
                border: d.status === "IN_TRANSIT" ? "2px solid var(--color-primary-400)" : "1px solid var(--border-color)",
                padding: "var(--space-5)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-primary-600)" }}>
                      Stop #{i + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{d.orderNumber}</span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                    {d.shop}
                  </p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "2px" }}>
                    📍 {d.address}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, fontSize: "var(--font-size-xl)", color: "var(--text-primary)" }}>
                    ₹{d.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "4px" }}>
                    <span className="badge badge-neutral">{d.payment}</span>
                    <StatusBadge status={d.status} label={d.status === "IN_TRANSIT" ? "In Transit" : "Assigned"} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  justifyContent: "flex-end",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "var(--space-3)",
                }}
              >
                {d.status === "ASSIGNED" && (
                  <button className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                    Start Trip
                  </button>
                )}
                {d.status === "IN_TRANSIT" && (
                  <>
                    <button className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                      ✓ Confirm Delivered
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                      Report Issue
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 5. SHOPKEEPER DASHBOARD ─────────────────────────────────

function ShopkeeperDashboard({ user }: DashboardProps) {
  const myOrders = [
    {
      id: "1",
      orderNumber: "ORD-2026-004448",
      amount: 12742.82,
      status: "DISPATCHED",
      date: "Today, 10:30 AM",
      items: "AZITHRAL 500, HIFENAC MR, PAN D",
    },
    {
      id: "2",
      orderNumber: "ORD-2026-000109",
      amount: 6408.94,
      status: "DELIVERED",
      date: "Yesterday",
      items: "CALPOL 650, DOLO 650",
    },
  ];

  const pendingDue = myOrders
    .filter((o) => o.status !== "DELIVERED")
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <DashboardHeader
        user={user}
        title="Pharmacy Store Portal"
        subtitle="Order wholesale medicines, live delivery updates & verified GST invoices"
      />

      <StatsGrid>
        <StatCard
          icon={<ShoppingCart size={22} />}
          label="My Orders"
          value={myOrders.length}
          color="var(--color-primary-600)"
          sub="Orders placed this month"
        />
        <StatCard
          icon={<Truck size={22} />}
          label="In Transit"
          value={myOrders.filter((o) => o.status === "DISPATCHED").length}
          color="#d97706"
          sub="On route to your pharmacy"
          trend={{ value: "Expected 2 PM", isNeutral: true }}
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Pending Due"
          value={`₹${pendingDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          color="var(--color-error)"
          sub="Outstanding ledger balance"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          label="Completed"
          value={myOrders.filter((o) => o.status === "DELIVERED").length}
          color="var(--color-success)"
          sub="Delivered & stocked"
        />
      </StatsGrid>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
          ⚡ Store Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          <QuickAction
            href="/dashboard/products"
            icon={<Pill size={20} />}
            label="Browse Catalog & Order"
            description="100+ wholesale lines with margin"
            color="var(--color-primary-600)"
          />
          <QuickAction
            href="/dashboard/orders"
            icon={<Truck size={20} />}
            label="Track Delivery Status"
            description="Live GPS & OTP drop updates"
            color="#d97706"
          />
          <QuickAction
            href="/dashboard/invoices"
            icon={<IndianRupee size={20} />}
            label="Download GST Invoices"
            description="PDF receipts with E-way bill"
            color="#0284c7"
          />
        </div>
      </div>

      {/* Orders */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>My Recent Wholesale Orders</h2>
          <Link
            href="/dashboard/orders"
            style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary-600)", fontWeight: 600 }}
          >
            View All →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {myOrders.map((o) => (
            <div
              key={o.id}
              className="card"
              style={{
                padding: "var(--space-4)",
                border: "1px solid var(--border-color)",
                transition: "transform var(--transition-fast)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "var(--space-2)",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: "var(--color-primary-700)", marginBottom: "var(--space-1)" }}>
                    {o.orderNumber}
                  </p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                    {o.items}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                    {o.date}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, marginBottom: "var(--space-1)" }}>
                    ₹{o.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared Order Table Component ────────────────────────────

function OrderTable({ orders }: { orders: any[] }) {
  return (
    <div className="table-scroll-container">
      <table className="table table-header-sticky">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Retail Pharmacy</th>
            <th>Invoice Amount</th>
            <th>Fulfillment Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((ord: any) => (
            <tr key={ord.id || ord.orderNumber}>
              <td>
                <div style={{ fontWeight: 600, color: "var(--color-primary-700)" }}>{ord.orderNumber}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {ord.date || "Today"}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                  {ord.shopkeeper || "Retail Pharmacy Store"}
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{(ord.amount || ord.netAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Includes GST</div>
              </td>
              <td>
                <StatusBadge status={ord.status} />
              </td>
              <td>
                <Link
                  href="/dashboard/orders"
                  className="btn btn-secondary"
                  style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Demo Orders Data ────────────────────────────────────────

const DEMO_ORDERS = [
  {
    id: "1",
    orderNumber: "ORD-2026-004448",
    shopkeeper: "Cheap Medical Stores (Benachity)",
    amount: 12742.82,
    status: "DISPATCHED",
    date: "Today, 10:30 AM",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-000538",
    shopkeeper: "Gupta Pharmacy (City Centre)",
    amount: 7852.95,
    status: "PICKING",
    date: "Today, 08:15 AM",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-000109",
    shopkeeper: "Cheap Medical Stores (Benachity)",
    amount: 6408.94,
    status: "DELIVERED",
    date: "Yesterday",
  },
];
