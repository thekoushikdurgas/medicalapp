"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Pill,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Store,
  BarChart3,
  Crown,
  ShieldCheck,
  Warehouse,
  Bike,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  Clock,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={styles.page}>
      {/* Background gradient & dynamic ambient glow */}
      <div style={styles.bgGradient} />
      <div style={styles.bgOrbs} />

      {/* Navigation Bar */}
      <nav style={styles.nav} aria-label="Main Website Navigation">
        <div style={styles.navInner}>
          <div style={styles.navBrand}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background:
                  "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 2px 8px rgba(5, 150, 105, 0.4)",
              }}
            >
              <Pill size={18} className="icon-pulse" />
            </div>
            <span style={styles.navBrandText}>Pharmacy Fantasy</span>
          </div>

          {/* Desktop links */}
          <div style={styles.navLinks} className="desktop-only">
            <a href="#features" style={styles.navLink}>
              Features
            </a>
            <a href="#roles" style={styles.navLink}>
              Who It&apos;s For
            </a>
            <a href="#pipeline" style={styles.navLink}>
              Fulfillment Pipeline
            </a>
            <a href="#contact" style={styles.navLink}>
              Contact
            </a>
            <div style={{ marginLeft: "var(--space-2)" }}>
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{
                padding: "0.4rem 1.1rem",
                fontSize: "0.85rem",
                gap: "4px",
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
            className="mobile-only"
          >
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hamburger-btn"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "var(--space-4) var(--space-6)",
              background: "rgba(15, 23, 42, 0.98)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: "#f8fafc",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Features
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: "#f8fafc",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Who It&apos;s For
            </a>
            <a
              href="#pipeline"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: "#f8fafc",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Fulfillment Pipeline
            </a>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-2)",
              }}
            >
              <Link
                href="/login"
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="animate-fade-in">
        <div style={styles.heroBadge}>
          <Sparkles size={14} className="icon-pulse" />
          <span>Built for Indian Pharmaceutical Wholesale Supply Chains</span>
        </div>

        <h1 style={styles.heroTitle}>
          The Intelligent{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            B2B Pharma
          </span>{" "}
          Distribution Platform
        </h1>

        <p style={styles.heroSub}>
          End-to-end wholesale distribution management — from warehouse FEFO
          inventory &amp; batch allocation to GST-compliant invoicing, live
          route dispatching, and retail pharmacy portals.
        </p>

        <div style={styles.heroCta}>
          <Link
            href="/register"
            className="btn btn-primary"
            style={{
              padding: "0.85rem 2.25rem",
              fontSize: "1rem",
              fontWeight: 700,
              gap: "8px",
            }}
          >
            <span>Start Free Trial</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="btn btn-secondary"
            style={{
              padding: "0.85rem 2.25rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Trust Signals Row */}
        <div style={styles.trustRow}>
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>100%</span>
            <span style={styles.trustLabel}>GST Compliant</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>FEFO</span>
            <span style={styles.trustLabel}>Batch Allocation</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>5</span>
            <span style={styles.trustLabel}>Role Portals</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustItem}>
            <span style={styles.trustNumber}>24/7</span>
            <span style={styles.trustLabel}>Real-Time Ops</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={styles.features}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-primary-400)",
            }}
          >
            Enterprise Capabilities
          </span>
          <h2 style={styles.sectionTitle}>
            Engineered for Pharmaceutical Wholesalers &amp; C&amp;F Agents
          </h2>
          <p style={styles.sectionSub}>
            Purpose-built for pharmaceutical distributors, bulk warehouses, and
            retail pharmacy networks across India.
          </p>
        </div>

        <div style={styles.featuresGrid} className="stagger-in">
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={styles.featureCard}>
              <div
                className="icon-animate"
                style={{
                  ...styles.featureIcon,
                  background: `color-mix(in srgb, ${f.color} 15%, transparent)`,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fulfillment Pipeline Banner */}
      <section
        id="pipeline"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <div
          className="card"
          style={{
            background: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "var(--space-8) var(--space-6)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            <span
              className="badge badge-primary"
              style={{ marginBottom: "var(--space-2)" }}
            >
              Lifecycle Flow
            </span>
            <h2
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: 800,
                color: "#f8fafc",
              }}
            >
              The 5-Stage Wholesale Supply Chain Pipeline
            </h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "#94a3b8",
                marginTop: "4px",
              }}
            >
              Zero paper friction, seamless tracking from order placement to OTP
              cash collection.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {[
              {
                step: "1",
                title: "Retail Order Placed",
                desc: "Shopkeeper submits bulk requisition with margin calculation.",
                icon: <ShoppingCart size={20} />,
              },
              {
                step: "2",
                title: "Admin Confirmation",
                desc: "Credit ledger & outstanding dues verified before confirmation.",
                icon: <ShieldCheck size={20} />,
              },
              {
                step: "3",
                title: "FEFO Picking",
                desc: "Warehouse staff picks batch with nearest expiry date.",
                icon: <Package size={20} />,
              },
              {
                step: "4",
                title: "Dispatch & Routing",
                desc: "Assigned to delivery boy with GST E-way bill generation.",
                icon: <Truck size={20} />,
              },
              {
                step: "5",
                title: "Delivery & Settlement",
                desc: "OTP verified drop-off with instant COD or UPI reconciliation.",
                icon: <CheckCircle2 size={20} />,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "var(--color-primary-600)",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {p.step}
                  </div>
                  <div style={{ color: "var(--color-primary-400)" }}>
                    {p.icon}
                  </div>
                </div>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#f8fafc",
                  }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Dashboards Grid */}
      <section id="roles" style={styles.roles}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={styles.sectionTitle}>
            Dedicated Portals for Every Supply Chain Role
          </h2>
          <p style={styles.sectionSub}>
            Each team member sees exactly what they need — zero cognitive
            clutter.
          </p>
        </div>

        <div style={styles.rolesGrid}>
          {ROLES.map((r, i) => (
            <div key={i} style={styles.roleCard}>
              <div
                className="icon-animate"
                style={{
                  ...styles.roleIconWrap,
                  background: `color-mix(in srgb, ${r.color} 15%, transparent)`,
                  borderColor: `color-mix(in srgb, ${r.color} 40%, transparent)`,
                  color: r.color,
                }}
              >
                {r.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f8fafc",
                  marginBottom: "0.5rem",
                }}
              >
                {r.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  lineHeight: 1.6,
                }}
              >
                {r.desc}
              </p>
              <ul style={styles.roleFeatures}>
                {r.features.map((feat, j) => (
                  <li key={j} style={styles.roleFeatureItem}>
                    <CheckCircle2 size={13} color={r.color} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "#f8fafc",
              marginBottom: "var(--space-3)",
            }}
          >
            Ready to Modernize Your Wholesale Pharma Operations?
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "#94a3b8",
              marginBottom: "var(--space-6)",
              maxWidth: "600px",
              margin: "0 auto var(--space-6)",
            }}
          >
            Join pharmaceutical distributors and wholesale agencies across West
            Bengal who rely on Pharmacy Fantasy for high-speed, compliant
            wholesale fulfillment.
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/register"
              className="btn btn-primary"
              style={{
                padding: "0.85rem 2.5rem",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Create Wholesaler Account →
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}
            >
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-primary-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Pill size={16} />
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#f8fafc",
                }}
              >
                Pharmacy Fantasy
              </span>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                maxWidth: "340px",
                lineHeight: 1.6,
              }}
            >
              B2B Pharmaceutical Wholesale &amp; Supply Chain Logistics
              Platform. Engineered for statutory Indian drug distribution
              compliance.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p
              style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}
            >
              Licensed Distribution Partner
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--color-primary-400)",
                fontWeight: 700,
              }}
            >
              MAA Eswari Pharmaceuticals
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "2px",
              }}
            >
              GSTIN: 19BKMPG6092H1ZO • Wholesale Drug License: DL-WB-BUR-2024
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "var(--space-4)",
            marginTop: "var(--space-6)",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "#475569" }}>
            © {new Date().getFullYear()} Pharmacy Fantasy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Data Collections with Lucide Icons ──────────────────────

const FEATURES = [
  {
    icon: <Package size={24} />,
    title: "Purchase Entry & FEFO Batches",
    desc: "Batch-level stock tracking with First-Expiry-First-Out automation. Prevents expired inventory dispatches.",
    color: "#059669",
  },
  {
    icon: <FileText size={24} />,
    title: "GST-Compliant Invoicing",
    desc: "Auto-calculate CGST + SGST, multi-tier trade discounts, and round-offs matching drug controller norms.",
    color: "#2563eb",
  },
  {
    icon: <ShoppingCart size={24} />,
    title: "B2B Order Pipeline",
    desc: "Seamless 5-stage lifecycle: Placement → Admin review → FEFO picking → Assigned route → Delivered.",
    color: "#7c3aed",
  },
  {
    icon: <Truck size={24} />,
    title: "Delivery Fleet Route Tracking",
    desc: "Assign delivery staff, map multi-stop routes, collect digital OTP proof of delivery, and track cash.",
    color: "#d97706",
  },
  {
    icon: <Store size={24} />,
    title: "Retail Pharmacy Portal",
    desc: "Retail shopkeepers browse live catalogs, place wholesale orders, and track deliveries independently.",
    color: "#dc2626",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Real-Time Ledger Analytics",
    desc: "Live visibility into daily revenue velocity, credit balances, expiring batches, and reorder alerts.",
    color: "#0284c7",
  },
];

const ROLES = [
  {
    icon: <Crown size={32} />,
    title: "Super Admin",
    color: "#7c3aed",
    desc: "Full system control — multi-user administration, statutory GST audit reports, and master oversight.",
    features: [
      "Manage all roles & permissions",
      "System configuration",
      "GST & margin P&L reports",
      "Full audit trail",
    ],
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "Operations Admin",
    color: "#2563eb",
    desc: "Day-to-day operations management — wholesale order approvals, deliveries, and tax invoices.",
    features: [
      "Review & approve bulk orders",
      "Assign delivery agents",
      "Generate statutory invoices",
      "Credit ledger monitoring",
    ],
  },
  {
    icon: <Warehouse size={32} />,
    title: "Warehouse Staff",
    color: "#d97706",
    desc: "Warehouse floor logistics — purchase entry, batch racking, and FEFO picking queue.",
    features: [
      "Batch receipt & rack allocation",
      "FEFO picking sheets",
      "Expiry alert monitoring",
      "Stock adjustment logs",
    ],
  },
  {
    icon: <Bike size={32} />,
    title: "Delivery Boy",
    color: "#059669",
    desc: "Mobile dispatch agent — assigned multi-stop runs, COD cash collection, and OTP confirmation.",
    features: [
      "View route & shop stops",
      "Update trip status in real time",
      "OTP delivery verification",
      "Cash on delivery ledger",
    ],
  },
  {
    icon: <Store size={32} />,
    title: "Retail Shopkeeper",
    color: "#dc2626",
    desc: "Independent pharmacy portal — 24/7 ordering, order tracking, and invoice downloads.",
    features: [
      "Search 100+ wholesale lines",
      "Live order tracking",
      "Download tax invoices",
      "Credit balance tracking",
    ],
  },
];

const styles: Record<string, React.CSSProperties> = {
  page: { position: "relative", minHeight: "100vh", overflow: "hidden" },
  bgGradient: {
    position: "fixed",
    inset: 0,
    zIndex: -2,
    background:
      "linear-gradient(160deg, #020617 0%, #0f172a 40%, #064e3b 75%, #020617 100%)",
  },
  bgOrbs: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.09) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, rgba(124, 58, 237, 0.07) 0%, transparent 50%),
                       radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)`,
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(16px)",
    background: "rgba(15, 23, 42, 0.85)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0.75rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "0.6rem" },
  navBrandText: {
    fontWeight: 800,
    fontSize: "1.15rem",
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  navLinks: { display: "flex", alignItems: "center", gap: "1.25rem" },
  navLink: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 150ms",
  },
  hero: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "5rem 1.5rem 3.5rem",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.35rem 1rem",
    borderRadius: "var(--radius-full)",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    color: "var(--color-primary-400)",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
    fontWeight: 800,
    color: "#f8fafc",
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    marginBottom: "1.25rem",
  },
  heroSub: {
    fontSize: "clamp(1rem, 2vw, 1.2rem)",
    color: "#94a3b8",
    maxWidth: "740px",
    margin: "0 auto 2.25rem",
    lineHeight: 1.7,
  },
  heroCta: {
    display: "flex",
    gap: "var(--space-3)",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "3.5rem",
  },
  trustRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2.5rem",
    flexWrap: "wrap",
  },
  trustItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
  },
  trustNumber: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "var(--color-primary-400)",
  },
  trustLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  trustDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.12)",
  },
  features: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "4rem 1.5rem",
  },
  sectionTitle: {
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 800,
    color: "#f8fafc",
    marginTop: "var(--space-2)",
    marginBottom: "0.75rem",
    letterSpacing: "-0.02em",
  },
  sectionSub: {
    fontSize: "var(--font-size-base)",
    color: "#94a3b8",
    maxWidth: "650px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "var(--space-5)",
  },
  featureCard: {
    background: "rgba(30, 41, 59, 0.65)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    padding: "var(--space-6)",
    transition:
      "transform var(--transition-fast), box-shadow var(--transition-fast)",
  },
  featureIcon: {
    width: "3.25rem",
    height: "3.25rem",
    borderRadius: "var(--radius-xl)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "var(--space-4)",
  },
  featureTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "0.5rem",
  },
  featureDesc: { fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 },
  roles: { maxWidth: "1240px", margin: "0 auto", padding: "4rem 1.5rem" },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "var(--space-4)",
  },
  roleCard: {
    background: "rgba(30, 41, 59, 0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "var(--radius-xl)",
    padding: "var(--space-6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    flexDirection: "column",
  },
  roleIconWrap: {
    width: "4rem",
    height: "4rem",
    borderRadius: "var(--radius-xl)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid",
    marginBottom: "var(--space-4)",
  },
  roleFeatures: {
    listStyle: "none",
    padding: 0,
    marginTop: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  roleFeatureItem: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  ctaSection: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "4rem 1.5rem",
  },
  ctaCard: {
    textAlign: "center",
    background:
      "linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(124, 58, 237, 0.12))",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    borderRadius: "var(--radius-2xl)",
    padding: "3.5rem 2rem",
    backdropFilter: "blur(14px)",
  },
  footer: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "3rem 1.5rem 2rem",
  },
  footerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "2rem",
  },
};
