"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/products", label: "Products", icon: "💊" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/orders", label: "Orders", icon: "🛒" },
  { href: "/dashboard/deliveries", label: "Deliveries", icon: "🚚" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "📄" },
  { href: "/dashboard/shopkeepers", label: "Shopkeepers", icon: "🏪" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
  { href: "/dashboard/reports", label: "Reports", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-container">
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">💊</span>
        <div>
          <div className="sidebar-brand-name">Pharmacy</div>
          <div className="sidebar-brand-sub">Fantasy</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <span style={{ fontSize: "1.1rem", width: "1.5rem", textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Switcher & User Section */}
      <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <ThemeToggle />
      </div>

      <div className="sidebar-user-section">
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--color-primary-600)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          SA
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Super Admin
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Wholesale Ops</div>
        </div>
        <Link
          href="/"
          className="btn btn-secondary"
          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          }}
        >
          Exit
        </Link>
      </div>
    </aside>
  );
}
