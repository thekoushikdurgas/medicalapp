"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingCart,
  Pill,
  Store,
  Users,
  LogOut,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { getStoredUser, AUTH_KEYS, ROLE_META } from "@/lib/auth";
import type { UserRole } from "@/types";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export default function DashboardNavbar({
  onToggleSidebar,
  isSidebarCollapsed,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Wholesale Order",
      desc: "ORD-2026-004448 from Cheap Medical Stores (₹12,742)",
      time: "10m ago",
      type: "order",
      unread: true,
    },
    {
      id: "2",
      title: "Batch Expiry Warning",
      desc: "AZITHRAL 500 (Batch B-2026) expiring in 45 days",
      time: "1h ago",
      type: "alert",
      unread: true,
    },
    {
      id: "3",
      title: "Payment Received",
      desc: "₹7,852.95 cleared via UPI from Gupta Pharmacy",
      time: "3h ago",
      type: "success",
      unread: false,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Human readable page titles based on path
  const getPageTitle = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard Overview";
    const last = segments[segments.length - 1];
    switch (last) {
      case "products":
        return "Product & SKU Catalog";
      case "inventory":
        return "Warehouse Stock & FEFO Batches";
      case "orders":
        return "Wholesale Orders Pipeline";
      case "deliveries":
        return "Fleet Logistics & Delivery";
      case "invoices":
        return "Tax Invoices & GST Bills";
      case "shopkeepers":
        return "Registered Pharmacies";
      case "users":
        return "User Management & Permissions";
      case "reports":
        return "Financial & Tax Analytics";
      default:
        return last.charAt(0).toUpperCase() + last.slice(1);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="dashboard-navbar" aria-label="Dashboard Top Bar">
        {/* Left: Sidebar Toggle & Page Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
          <button
            onClick={onToggleSidebar}
            className="navbar-action-btn"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle navigation sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeft size={18} className="icon-animate" />
            ) : (
              <PanelLeftClose size={18} className="icon-animate" />
            )}
          </button>

          {/* Breadcrumb Context */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                fontWeight: 500,
                textDecoration: "none",
                display: "none",
              }}
              className="breadcrumb-home-link"
            >
              Overview
            </Link>
            <ChevronRight size={12} color="var(--text-muted)" style={{ display: "none" }} className="breadcrumb-chevron" />
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "240px",
              }}
            >
              {getPageTitle(pathname)}
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar Trigger */}
        <div style={{ flex: 1, maxWidth: "420px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setSearchOpen(true)}
            className="navbar-search-btn"
            style={{ width: "100%", justifyContent: "space-between" }}
            aria-label="Search medicines, orders, or shopkeepers"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={14} color="var(--text-muted)" />
              <span className="navbar-search-text" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Quick search drugs, orders, batches...
              </span>
            </div>
            <kbd className="navbar-search-kbd">⌘K</kbd>
          </button>
        </div>

        {/* Right: Live GST Server Status, Notifications, Theme, User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
          {/* GST Live Server Badge */}
          <div
            className="navbar-gst-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--color-primary-600)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-success)",
                boxShadow: "0 0 6px var(--color-success)",
              }}
            />
            <span>GST Live: 19BKMPG</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Popover Trigger */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="navbar-action-btn"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} className={unreadCount > 0 ? "icon-bounce" : ""} />
              {unreadCount > 0 && <span className="navbar-notification-dot" />}
            </button>

            {/* Notifications Popover Dropdown */}
            {notificationsOpen && (
              <div className="navbar-popover">
                <div
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>
                    Notifications
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "var(--color-primary-100)",
                      color: "var(--color-primary-700)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {unreadCount} new
                  </span>
                </div>

                <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        borderBottom: "1px solid var(--border-color)",
                        background: n.unread ? "var(--bg-primary)" : "var(--bg-secondary)",
                        cursor: "pointer",
                        transition: "background var(--transition-fast)",
                      }}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                        );
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          {n.type === "order" && <ShoppingCart size={15} color="var(--color-primary-600)" />}
                          {n.type === "alert" && <AlertTriangle size={15} color="var(--color-warning)" />}
                          {n.type === "success" && <CheckCircle2 size={15} color="var(--color-success)" />}
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: n.unread ? 700 : 500, color: "var(--text-primary)" }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {n.desc}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: "var(--space-2) var(--space-4)",
                    textAlign: "center",
                    borderTop: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <button
                    onClick={() => {
                      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary-600)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div style={{ position: "relative" }} ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
              }}
              aria-label="User profile menu"
              aria-expanded={userMenuOpen}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: meta?.color ?? "var(--color-primary-600)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
              >
                {initials}
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "var(--color-success)",
                    border: "2px solid var(--bg-primary)",
                  }}
                />
              </div>
            </button>

            {/* User Dropdown Popover */}
            {userMenuOpen && (
              <div className="navbar-popover" style={{ width: "240px", right: 0 }}>
                <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                    {user?.fullName ?? "Wholesale Operator"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {user?.email}
                  </div>
                  <span
                    className="badge"
                    style={{
                      marginTop: "6px",
                      display: "inline-block",
                      background: `color-mix(in srgb, ${meta?.color ?? "#059669"} 15%, transparent)`,
                      color: meta?.color ?? "var(--color-primary-600)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {meta?.label ?? "User"}
                  </span>
                </div>

                <div style={{ padding: "var(--space-2)" }}>
                  <Link
                    href="/dashboard/users"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <Users size={14} />
                    <span>User Accounts</span>
                  </Link>

                  <Link
                    href="/dashboard/reports"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <Activity size={14} />
                    <span>Audit &amp; Logs</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-error)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      marginTop: "4px",
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      {searchOpen && (
        <CommandSearchModal onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}

// ── Global Command Search Palette ───────────────────────────

function CommandSearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const SEARCH_ITEMS = [
    { type: "Medicine", label: "AZITHRAL 500 MG (Alembic)", href: "/dashboard/products", icon: <Pill size={16} /> },
    { type: "Medicine", label: "TELMA 40 MG (Glenmark)", href: "/dashboard/products", icon: <Pill size={16} /> },
    { type: "Medicine", label: "HIFENAC MR (Intas)", href: "/dashboard/products", icon: <Pill size={16} /> },
    { type: "Medicine", label: "PAN D CAPSULES (Alkem)", href: "/dashboard/products", icon: <Pill size={16} /> },
    { type: "Order", label: "ORD-2026-004448 (Cheap Medical Stores)", href: "/dashboard/orders", icon: <ShoppingCart size={16} /> },
    { type: "Order", label: "ORD-2026-000538 (Gupta Pharmacy)", href: "/dashboard/orders", icon: <ShoppingCart size={16} /> },
    { type: "Pharmacy", label: "Cheap Medical Stores (Benachity)", href: "/dashboard/shopkeepers", icon: <Store size={16} /> },
    { type: "Pharmacy", label: "Gupta Pharmacy (City Centre)", href: "/dashboard/shopkeepers", icon: <Store size={16} /> },
    { type: "Page", label: "FEFO Warehouse Inventory", href: "/dashboard/inventory", icon: <Package size={16} /> },
    { type: "Page", label: "GST Tax Invoices & Reports", href: "/dashboard/invoices", icon: <Shield size={16} /> },
  ];

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 6);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="cmd-dialog-backdrop" onClick={onClose}>
      <div className="cmd-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <Search size={18} color="var(--color-primary-600)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a drug name, batch, order number, or pharmacy..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "var(--font-size-base)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-family)",
            }}
          />
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "var(--space-2)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No matches found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-gray-100)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary-600)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.type}</div>
                  </div>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Jump →</span>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Shortcut hints */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Tip: Press ESC to close</span>
          <span>Pharmacy Fantasy Quick Jump</span>
        </div>
      </div>
    </div>
  );
}
