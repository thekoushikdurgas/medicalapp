"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { getNavItems, getStoredUser, AUTH_KEYS, ROLE_META } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ role: UserRole; fullName: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const navItems = user ? getNavItems(user.role) : [];
  const meta = user ? ROLE_META[user.role] : null;
  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    router.push("/login");
  };

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

      {/* Theme Switcher */}
      <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
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
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.fullName ?? "Loading..."}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            {meta?.label ?? ""}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
          onClick={handleLogout}
        >
          Exit
        </button>
      </div>
    </aside>
  );
}
