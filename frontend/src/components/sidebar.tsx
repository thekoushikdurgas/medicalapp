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
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { getNavItems, getStoredUser, AUTH_KEYS, ROLE_META } from "@/lib/auth";
import type { UserRole } from "@/types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const navItems = user ? getNavItems(user.role) : [];
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
        return <LayoutDashboard size={18} className="icon-animate" />;
      case "/dashboard/products":
        return <Pill size={18} className="icon-animate" />;
      case "/dashboard/inventory":
        return <Package size={18} className="icon-animate" />;
      case "/dashboard/orders":
        return <ShoppingCart size={18} className="icon-animate" />;
      case "/dashboard/deliveries":
        return <Truck size={18} className="icon-animate" />;
      case "/dashboard/invoices":
        return <FileText size={18} className="icon-animate" />;
      case "/dashboard/shopkeepers":
        return <Store size={18} className="icon-animate" />;
      case "/dashboard/users":
        return <Users size={18} className="icon-animate" />;
      case "/dashboard/reports":
        return <BarChart3 size={18} className="icon-animate" />;
      default:
        return <Sparkles size={18} className="icon-animate" />;
    }
  };

  return (
    <aside
      className={`sidebar-container ${isOpen ? "open" : ""}`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
          }}
        >
          <Pill size={20} className="icon-pulse" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-brand-name">Pharmacy</div>
          <div className="sidebar-brand-sub">Fantasy</div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="hamburger-btn"
            style={{ display: isOpen ? "flex" : "none" }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav" aria-label="Sidebar Menu">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.5rem",
                }}
              >
                {getNavIcon(item.href)}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Switcher */}
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <ThemeToggle />
      </div>

      {/* User Section */}
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
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#f8fafc",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.fullName ?? "Loading..."}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            {meta?.label ?? ""}
          </div>
        </div>
        <button
          className="btn btn-secondary"
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
