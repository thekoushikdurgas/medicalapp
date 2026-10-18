"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={styles.page}>
      {/* Background gradient */}
      <div style={styles.bgGradient} />
      <div style={styles.bgOrbs} />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.navBrand}>
            <span style={{ fontSize: "1.5rem" }}>💊</span>
            <span style={styles.navBrandText}>Pharmacy Fantasy</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#roles" style={styles.navLink}>Who It&apos;s For</a>
            <a href="#contact" style={styles.navLink}>Contact</a>
            <Link href="/login" className="btn btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero} className="animate-fade-in">
        <div style={styles.heroBadge}>
          <span style={{ fontSize: "0.75rem" }}>🇮🇳</span>
          Built for Indian Pharmaceutical Distribution
        </div>
        <h1 style={styles.heroTitle}>
          The Complete{" "}
          <span style={{ color: "var(--color-primary-400)" }}>B2B Pharma</span>{" "}
          Supply Chain Platform
        </h1>
        <p style={styles.heroSub}>
          End-to-end wholesale distribution management — from purchase entry and warehouse
          FEFO inventory to GST-compliant invoicing, delivery tracking, and retail shopkeeper portals.
        </p>
        <div style={styles.heroCta}>
          <Link href="/register" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem", fontWeight: 700 }}>
            Start Free Trial →
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
            Sign In to Dashboard
          </Link>
        </div>

        {/* Trust signals */}
        <div style={styles.trustRow}>
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>100%</span>
            <span style={styles.trustLabel}>GST Compliant</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>FEFO</span>
            <span style={styles.trustLabel}>Batch Tracking</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>5</span>
            <span style={styles.trustLabel}>Role-Based Portals</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>24/7</span>
            <span style={styles.trustLabel}>Real-Time Ops</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Everything You Need to Run a Pharma Wholesale Business</h2>
        <p style={styles.sectionSub}>
          Purpose-built for C&amp;F agencies, pharmaceutical distributors, and wholesale warehouses across India.
        </p>
        <div style={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={styles.featureCard}>
              <div style={{ ...styles.featureIcon, background: `${f.color}15`, color: f.color }}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" style={styles.roles}>
        <h2 style={styles.sectionTitle}>Dedicated Dashboards for Every Role</h2>
        <p style={styles.sectionSub}>Each user sees exactly what they need — nothing more, nothing less.</p>
        <div style={styles.rolesGrid}>
          {ROLES.map((r, i) => (
            <div key={i} style={styles.roleCard}>
              <div style={{ ...styles.roleIconWrap, background: `${r.color}20`, borderColor: `${r.color}40` }}>
                <span style={{ fontSize: "2rem" }}>{r.icon}</span>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.5rem" }}>{r.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{r.desc}</p>
              <ul style={styles.roleFeatures}>
                {r.features.map((feat, j) => (
                  <li key={j} style={styles.roleFeatureItem}>
                    <span style={{ color: r.color }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "#f8fafc", marginBottom: "var(--space-3)" }}>
            Ready to Modernize Your Pharma Distribution?
          </h2>
          <p style={{ fontSize: "var(--font-size-lg)", color: "#94a3b8", marginBottom: "var(--space-6)", maxWidth: "600px" }}>
            Join pharmaceutical distributors across West Bengal who trust Pharmacy Fantasy
            for their daily operations.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.75rem 2.5rem", fontSize: "1rem", fontWeight: 700 }}>
              Create Your Account →
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: "0.75rem 2.5rem", fontSize: "1rem" }}>
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.25rem" }}>💊</span>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#f8fafc" }}>Pharmacy Fantasy</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "300px" }}>
              B2B Pharmaceutical Wholesale &amp; Supply Chain Distribution Platform.
              Built for Indian pharma compliance.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Licensed Distribution Partner</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-primary-400)", fontWeight: 700 }}>
              MAA Eswari Pharmaceuticals
            </p>
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>GSTIN: 19BKMPG6092H1ZO</p>
          </div>
        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid #1e293b", paddingTop: "var(--space-4)", marginTop: "var(--space-6)" }}>
          <p style={{ fontSize: "0.75rem", color: "#475569" }}>
            © {new Date().getFullYear()} Pharmacy Fantasy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: "📦", title: "Purchase Entry & FEFO Inventory", desc: "Batch-level stock management with automatic First-Expiry-First-Out selection. Never dispatch expired stock.", color: "#059669" },
  { icon: "🧾", title: "GST-Compliant Invoicing", desc: "Auto-calculate CGST + SGST, DIS1%, DIS2%, round-offs. Generate print-ready invoices matching statutory norms.", color: "#2563eb" },
  { icon: "🛒", title: "B2B Order Pipeline", desc: "Retail shopkeepers place orders → Admin confirms → Warehouse picks → Delivery dispatches. Full lifecycle tracking.", color: "#7c3aed" },
  { icon: "🚚", title: "Delivery Fleet Tracking", desc: "Assign delivery boys, track dispatch status, collect proof of delivery, and record cash on delivery.", color: "#d97706" },
  { icon: "🏪", title: "Shopkeeper Self-Service Portal", desc: "Retail shops browse catalogs, place orders, view invoices, and track delivery status — all from their own portal.", color: "#dc2626" },
  { icon: "📊", title: "Real-Time Analytics & Reports", desc: "Sales reports, inventory levels, GST summaries, outstanding payments, and expiring batch alerts — all in real time.", color: "#0284c7" },
];

const ROLES = [
  {
    icon: "👑", title: "Super Admin", color: "#7c3aed",
    desc: "Complete system control — user management, financial oversight, system configuration.",
    features: ["Create all user types", "System configuration", "GST & financial reports", "Full audit logs"],
  },
  {
    icon: "🛡️", title: "Operations Admin", color: "#2563eb",
    desc: "Day-to-day operations management — order processing, inventory, delivery assignment.",
    features: ["Confirm/reject orders", "Assign delivery boys", "Generate invoices", "Inventory management"],
  },
  {
    icon: "📦", title: "Warehouse Staff", color: "#d97706",
    desc: "Inventory and order fulfillment — stock management, picking, and packing operations.",
    features: ["Manage stock levels", "Process purchase entries", "Order picking & packing", "Inventory reports"],
  },
  {
    icon: "🛵", title: "Delivery Boy", color: "#059669",
    desc: "Field operations — assigned deliveries, route management, and proof of delivery.",
    features: ["View assigned deliveries", "Update delivery status", "Upload proof of delivery", "Record cash collection"],
  },
  {
    icon: "🏪", title: "Retail Shopkeeper", color: "#dc2626",
    desc: "Self-service ordering portal — browse catalog, place orders, track status.",
    features: ["Browse product catalog", "Place & track orders", "View own invoices", "Payment history"],
  },
];

const styles: Record<string, React.CSSProperties> = {
  page: { position: "relative", minHeight: "100vh", overflow: "hidden" },
  bgGradient: {
    position: "fixed", inset: 0, zIndex: -2,
    background: "linear-gradient(160deg, #020617 0%, #0f172a 40%, #064e3b 70%, #020617 100%)",
  },
  bgOrbs: {
    position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
                       radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)`,
  },
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backdropFilter: "blur(16px)",
    background: "rgba(15, 23, 42, 0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "0.75rem 1.5rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "0.5rem" },
  navBrandText: { fontWeight: 800, fontSize: "1.15rem", color: "#f8fafc", letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "1.5rem" },
  navLink: { fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500, textDecoration: "none" },
  hero: {
    maxWidth: "900px", margin: "0 auto",
    padding: "6rem 1.5rem 4rem",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "0.4rem",
    padding: "0.35rem 1rem", borderRadius: "var(--radius-full)",
    background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.2)",
    color: "var(--color-primary-400)", fontSize: "0.8rem", fontWeight: 600,
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800,
    color: "#f8fafc", lineHeight: 1.15, letterSpacing: "-0.03em",
    marginBottom: "1.25rem",
  },
  heroSub: {
    fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#94a3b8",
    maxWidth: "700px", margin: "0 auto 2rem", lineHeight: 1.7,
  },
  heroCta: {
    display: "flex", gap: "var(--space-3)",
    justifyContent: "center", flexWrap: "wrap" as const,
    marginBottom: "3rem",
  },
  trustRow: {
    display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem",
    flexWrap: "wrap" as const,
  },
  trustItem: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "0.2rem" },
  trustNumber: { fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary-400)" },
  trustLabel: { fontSize: "0.75rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  trustDivider: { width: "1px", height: "40px", background: "rgba(255,255,255,0.1)" },
  features: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "4rem 1.5rem",
  },
  sectionTitle: {
    fontSize: "var(--font-size-3xl)", fontWeight: 800,
    color: "#f8fafc", textAlign: "center", marginBottom: "0.75rem",
  },
  sectionSub: {
    fontSize: "var(--font-size-base)", color: "#94a3b8",
    textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "var(--space-5)",
  },
  featureCard: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  featureIcon: {
    width: "3rem", height: "3rem",
    borderRadius: "var(--radius-lg)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.4rem", marginBottom: "var(--space-4)",
  },
  featureTitle: { fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.5rem" },
  featureDesc: { fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 },
  roles: { maxWidth: "1200px", margin: "0 auto", padding: "4rem 1.5rem" },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "var(--space-4)",
  },
  roleCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "var(--radius-xl)",
    padding: "var(--space-6)",
    backdropFilter: "blur(8px)",
  },
  roleIconWrap: {
    width: "4rem", height: "4rem",
    borderRadius: "var(--radius-xl)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid", marginBottom: "var(--space-4)",
  },
  roleFeatures: { listStyle: "none", padding: 0, marginTop: "var(--space-3)", display: "flex", flexDirection: "column" as const, gap: "0.3rem" },
  roleFeatureItem: { fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: "0.4rem", alignItems: "center" },
  ctaSection: {
    maxWidth: "900px", margin: "0 auto",
    padding: "4rem 1.5rem",
  },
  ctaCard: {
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(124, 58, 237, 0.1))",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "var(--radius-2xl)",
    padding: "3rem 2rem",
    backdropFilter: "blur(12px)",
  },
  footer: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "3rem 1.5rem 2rem",
  },
  footerInner: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", flexWrap: "wrap" as const, gap: "2rem",
  },
};
