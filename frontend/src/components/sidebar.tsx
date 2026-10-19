"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  Store,
  Users,
  BarChart3,
  LogOut,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { getStoredUser, AUTH_KEYS, ROLE_META } from "@/lib/auth";
import type { UserRole } from "@/types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    href: string;
    label: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

export default function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const meta = user ? ROLE_META[user.role] : null;
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    router.push("/login");
  };

  const getNavIcon = (href: string) => {
    switch (href) {
      case "/dashboard":
        return <LayoutDashboard size={19} className="icon-animate" />;
      case "/dashboard/products":
        return <Pill size={19} className="icon-animate" />;
      case "/dashboard/inventory":
        return <Package size={19} className="icon-animate" />;
      case "/dashboard/orders":
        return <ShoppingCart size={19} className="icon-animate" />;
      case "/dashboard/deliveries":
        return <Truck size={19} className="icon-animate" />;
      case "/dashboard/invoices":
        return <FileText size={19} className="icon-animate" />;
      case "/dashboard/shopkeepers":
        return <Store size={19} className="icon-animate" />;
      case "/dashboard/users":
        return <Users size={19} className="icon-animate" />;
      case "/dashboard/reports":
        return <BarChart3 size={19} className="icon-animate" />;
      default:
        return <Sparkles size={19} className="icon-animate" />;
    }
  };

  // Grouped Navigation by Role for reduced cognitive load
  const getNavSections = (role: UserRole): NavSection[] => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          {
            items: [{ href: "/dashboard", label: "Dashboard" }],
          },
          {
            title: "Commerce & Sales",
            items: [
              { href: "/dashboard/products", label: "Products Catalog" },
              { href: "/dashboard/orders", label: "Wholesale Orders", badge: "1", badgeColor: "var(--color-warning)" },
              { href: "/dashboard/invoices", label: "Tax Invoices" },
            ],
          },
          {
            title: "Supply Chain & Ops",
            items: [
              { href: "/dashboard/inventory", label: "Warehouse Inventory", badge: "FEFO", badgeColor: "var(--color-primary-600)" },
              { href: "/dashboard/deliveries", label: "Fleet Deliveries" },
              { href: "/dashboard/shopkeepers", label: "Pharmacies" },
            ],
          },
          {
            title: "Administration",
            items: [
              { href: "/dashboard/users", label: "Users & Roles" },
              { href: "/dashboard/reports", label: "GST & Financials" },
            ],
          },
        ];

      case "ADMIN":
        return [
          {
            items: [{ href: "/dashboard", label: "Dashboard" }],
          },
          {
            title: "Daily Operations",
            items: [
              { href: "/dashboard/orders", label: "Orders Queue", badge: "1", badgeColor: "var(--color-warning)" },
              { href: "/dashboard/deliveries", label: "Assign Delivery" },
              { href: "/dashboard/invoices", label: "Invoices" },
            ],
          },
          {
            title: "Catalog & Network",
            items: [
              { href: "/dashboard/products", label: "Products" },
              { href: "/dashboard/inventory", label: "Inventory" },
              { href: "/dashboard/shopkeepers", label: "Shopkeepers" },
              { href: "/dashboard/reports", label: "Reports" },
            ],
          },
          {
            title: "Administration",
            items: [
              { href: "/dashboard/users", label: "Staff & Users" },
            ],
          },
        ];

      case "WAREHOUSE":
        return [
          {
            items: [{ href: "/dashboard", label: "Floor Overview" }],
          },
          {
            title: "Warehouse Operations",
            items: [
              { href: "/dashboard/inventory", label: "Inventory & Racks", badge: "FEFO", badgeColor: "var(--color-primary-600)" },
              { href: "/dashboard/orders", label: "Picking Queue", badge: "2", badgeColor: "var(--color-warning)" },
              { href: "/dashboard/invoices", label: "Invoices & Challans" },
              { href: "/dashboard/products", label: "SKU Catalog" },
            ],
          },
        ];

      case "DELIVERY":
        return [
          {
            items: [{ href: "/dashboard", label: "Delivery Hub" }],
          },
          {
            title: "My Runs",
            items: [
              { href: "/dashboard/deliveries", label: "Assigned Trips", badge: "2 Active", badgeColor: "var(--color-primary-600)" },
            ],
          },
        ];

      case "SHOPKEEPER":
        return [
          {
            items: [{ href: "/dashboard", label: "My Store Portal" }],
          },
          {
            title: "Wholesale Purchasing",
            items: [
              { href: "/dashboard/products", label: "Browse Catalog" },
              { href: "/dashboard/orders", label: "My Orders", badge: "1 En Route", badgeColor: "var(--color-info)" },
              { href: "/dashboard/invoices", label: "My Invoices" },
            ],
          },
        ];

      default:
        return [
          {
            items: [{ href: "/dashboard", label: "Dashboard" }],
          },
        ];
    }
  };

  const navSections = user ? getNavSections(user.role) : [];

  return (
    <aside
      className={`sidebar-container ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none" }}
          onClick={onClose}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
              flexShrink: 0,
            }}
          >
            <Pill size={20} className="icon-pulse" />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Pharmacy</div>
            <div className="sidebar-brand-sub">Fantasy B2B</div>
          </div>
        </Link>

        {/* Mobile close trigger */}
        {onClose && (
          <button
            onClick={onClose}
            className="hamburger-btn"
            style={{ display: isOpen ? "flex" : "none" }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}

        {/* Desktop collapse toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="navbar-action-btn sidebar-brand-text"
            style={{
              width: "28px",
              height: "28px",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "#94a3b8",
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Collapse sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <nav className="sidebar-nav" aria-label="Sidebar Menu">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: "var(--space-2)" }}>
            {section.title && (
              <div className="sidebar-section-title">{section.title}</div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  data-tooltip={item.label}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {getNavIcon(item.href)}
                  </span>
                  <span className="sidebar-item-label" style={{ flex: 1, whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="sidebar-badge"
                      style={{
                        background: item.badgeColor ? `color-mix(in srgb, ${item.badgeColor} 20%, transparent)` : "rgba(255,255,255,0.12)",
                        color: item.badgeColor ?? "#ffffff",
                        border: `1px solid color-mix(in srgb, ${item.badgeColor ?? "#ffffff"} 30%, transparent)`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Section Footer */}
      <div className="sidebar-user-section">
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: meta?.color ?? "var(--color-primary-600)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            flexShrink: 0,
          }}
          title={`${user?.fullName} (${meta?.label})`}
        >
          {initials}
        </div>
        <div className="sidebar-user-details" style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#f8fafc",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.fullName ?? "Loading..."}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            {meta?.label ?? ""}
          </div>
        </div>
        <button
          className="btn btn-secondary sidebar-user-exit-btn"
          style={{
            padding: "4px 8px",
            fontSize: "0.75rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut size={12} />
          Exit
        </button>
      </div>
    </aside>
  );
}
