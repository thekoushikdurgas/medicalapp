"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import DashboardNavbar from "@/components/navbar";
import AuthGuard from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    // If on mobile viewport, open mobile drawer; otherwise toggle collapsed mode
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <AuthGuard>
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        {/* Backdrop for mobile drawer */}
        <div
          className={`sidebar-overlay ${mobileDrawerOpen ? "visible" : ""}`}
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />

        {/* Enhanced Collapsible Sidebar Component */}
        <Sidebar
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Content & Top Navbar Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
          {/* Top Enterprise Dashboard Navbar */}
          <DashboardNavbar
            onToggleSidebar={handleToggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Main Workspace Body */}
          <main
            id="main-content"
            className="dashboard-main"
            style={{
              flex: 1,
              padding: "1.75rem 2rem",
              overflow: "auto",
              minWidth: 0,
              background: "var(--bg-secondary)",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
