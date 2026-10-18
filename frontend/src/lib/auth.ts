/**
 * Central auth configuration — role-based nav items, permissions, and helpers.
 */

import type { UserRole } from "@/types";

// ponytail: single source of truth for localStorage keys — fixes the
// token/access_token mismatch between page.tsx and use-auth.ts
export const AUTH_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/** Nav items visible per role. Order matters — first item is the default landing. */
const SHARED_DASHBOARD: NavItem = { href: "/dashboard", label: "Dashboard", icon: "📊" };

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    SHARED_DASHBOARD,
    { href: "/dashboard/products", label: "Products", icon: "💊" },
    { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
    { href: "/dashboard/orders", label: "Orders", icon: "🛒" },
    { href: "/dashboard/deliveries", label: "Deliveries", icon: "🚚" },
    { href: "/dashboard/invoices", label: "Invoices", icon: "📄" },
    { href: "/dashboard/shopkeepers", label: "Shopkeepers", icon: "🏪" },
    { href: "/dashboard/users", label: "Users", icon: "👥" },
    { href: "/dashboard/reports", label: "Reports", icon: "📈" },
  ],
  ADMIN: [
    SHARED_DASHBOARD,
    { href: "/dashboard/products", label: "Products", icon: "💊" },
    { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
    { href: "/dashboard/orders", label: "Orders", icon: "🛒" },
    { href: "/dashboard/deliveries", label: "Deliveries", icon: "🚚" },
    { href: "/dashboard/invoices", label: "Invoices", icon: "📄" },
    { href: "/dashboard/shopkeepers", label: "Shopkeepers", icon: "🏪" },
    { href: "/dashboard/reports", label: "Reports", icon: "📈" },
  ],
  WAREHOUSE: [
    SHARED_DASHBOARD,
    { href: "/dashboard/products", label: "Products", icon: "💊" },
    { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
    { href: "/dashboard/orders", label: "Orders", icon: "🛒" },
  ],
  DELIVERY: [
    SHARED_DASHBOARD,
    { href: "/dashboard/deliveries", label: "My Deliveries", icon: "🚚" },
  ],
  SHOPKEEPER: [
    SHARED_DASHBOARD,
    { href: "/dashboard/products", label: "Browse Catalog", icon: "💊" },
    { href: "/dashboard/orders", label: "My Orders", icon: "🛒" },
    { href: "/dashboard/invoices", label: "My Invoices", icon: "📄" },
  ],
};

export function getNavItems(role: UserRole): NavItem[] {
  return NAV_BY_ROLE[role] ?? NAV_BY_ROLE.SHOPKEEPER;
}

/** Role display metadata */
export const ROLE_META: Record<UserRole, { label: string; icon: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", icon: "👑", color: "#7c3aed" },
  ADMIN: { label: "Operations Admin", icon: "🛡️", color: "#2563eb" },
  WAREHOUSE: { label: "Warehouse Staff", icon: "📦", color: "#d97706" },
  DELIVERY: { label: "Delivery Boy", icon: "🛵", color: "#059669" },
  SHOPKEEPER: { label: "Retail Shopkeeper", icon: "🏪", color: "#dc2626" },
};

/** Read current user from localStorage (client-side only) */
export function getStoredUser(): { role: UserRole; fullName: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(AUTH_KEYS.TOKEN);
}
