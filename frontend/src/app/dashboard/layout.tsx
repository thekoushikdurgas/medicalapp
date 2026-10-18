"use client";

import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}

