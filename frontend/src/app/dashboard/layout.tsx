"use client";

import { useState } from "react";
import { Menu, Pill } from "lucide-react";
import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        {/* Mobile Hamburger Header (Visible on <= 768px via CSS) */}
        <header className="mobile-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="hamburger-btn"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={22} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Pill size={16} />
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pharmacy Fantasy</span>
            </div>
          </div>
        </header>

        {/* Backdrop for mobile drawer */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="dashboard-main"
          style={{
            flex: 1,
            padding: "2rem",
            overflow: "auto",
            minWidth: 0,
            background: "var(--bg-secondary)",
          }}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
