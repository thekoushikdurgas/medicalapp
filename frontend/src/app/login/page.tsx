"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { LOGIN_MUTATION } from "@/lib/graphql-queries";
import { AUTH_KEYS, ROLE_META } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@pharmacyfantasy.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    errorPolicy: "all",
  });

  const handleLogin = async (loginEmail = email, loginPass = password) => {
    setLoading(true);
    setError("");

    try {
      const res = await loginMutation({
        variables: { email: loginEmail, password: loginPass },
      });

      if (res.data?.login?.accessToken) {
        localStorage.setItem(AUTH_KEYS.TOKEN, res.data.login.accessToken);
        localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(res.data.login.user));
        router.push("/dashboard");
        return;
      }
    } catch {
      // Backend may be offline — fallback to demo
    }

    // Demo fallback
    const DEMO_USERS: Record<string, { fullName: string; role: UserRole; pass: string }> = {
      "superadmin@pharmacyfantasy.com": { fullName: "Rajesh Mukherjee", role: "SUPER_ADMIN", pass: "admin123" },
      "admin@pharmacyfantasy.com": { fullName: "Pooja Sharma", role: "ADMIN", pass: "admin123" },
      "warehouse@pharmacyfantasy.com": { fullName: "Sunil Ghosh", role: "WAREHOUSE", pass: "warehouse123" },
      "delivery@pharmacyfantasy.com": { fullName: "Rahul Sharma", role: "DELIVERY", pass: "delivery123" },
      "cheapmedical@pharmacyfantasy.com": { fullName: "Amitabh Das", role: "SHOPKEEPER", pass: "shop123" },
    };

    const demo = DEMO_USERS[loginEmail];
    if (demo && loginPass === demo.pass) {
      localStorage.setItem(AUTH_KEYS.TOKEN, "demo-token-" + Date.now());
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify({ email: loginEmail, fullName: demo.fullName, role: demo.role }));
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Use a demo account below for quick access.");
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    handleLogin(quickEmail, quickPass);
  };

  const quickLogins: { email: string; pass: string; role: UserRole }[] = [
    { email: "superadmin@pharmacyfantasy.com", pass: "admin123", role: "SUPER_ADMIN" },
    { email: "admin@pharmacyfantasy.com", pass: "admin123", role: "ADMIN" },
    { email: "warehouse@pharmacyfantasy.com", pass: "warehouse123", role: "WAREHOUSE" },
    { email: "delivery@pharmacyfantasy.com", pass: "delivery123", role: "DELIVERY" },
    { email: "cheapmedical@pharmacyfantasy.com", pass: "shop123", role: "SHOPKEEPER" },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.backdrop} />

      <div style={styles.card} className="animate-fade-in">
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoIcon}>💊</div>
          <h1 style={styles.brandName}>Pharmacy Fantasy</h1>
          <p style={styles.brandTagline}>
            B2B Pharmaceutical Wholesale &amp; Supply Chain Distribution
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={styles.form}
        >
          <div>
            <label htmlFor="email" className="label">
              Registered Email / Phone ID
            </label>
            <input
              id="email"
              type="text"
              className="input"
              placeholder="e.g. superadmin@pharmacyfantasy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Authenticating Session..." : "Sign In to Operations Portal →"}
          </button>
        </form>

        {/* Quick Login */}
        <div style={{ marginTop: "var(--space-6)", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "center", marginBottom: "var(--space-3)" }}>
            ⚡ 1-Click Fast Login by Role
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            {quickLogins.slice(0, 4).map((q) => {
              const meta = ROLE_META[q.role];
              return (
                <button
                  key={q.role}
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }}
                  onClick={() => handleQuickLogin(q.email, q.pass)}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
          {quickLogins.slice(4).map((q) => {
            const meta = ROLE_META[q.role];
            return (
              <button
                key={q.role}
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", fontSize: "0.75rem", padding: "0.35rem 0.5rem", marginTop: "var(--space-2)" }}
                onClick={() => handleQuickLogin(q.email, q.pass)}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>

        {/* Links */}
        <div style={{ marginTop: "var(--space-4)", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--color-primary-600)" }}>
            Forgot your password?
          </Link>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Retail Shopkeeper?{" "}
            <Link href="/register" style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>
              Register here →
            </Link>
          </p>
        </div>

        <p style={styles.footer}>
          Licensed Distribution Partner:{" "}
          <strong style={{ color: "var(--color-primary-600)" }}>
            MAA Eswari Pharmaceuticals (GSTIN: 19BKMPG6092H1ZO)
          </strong>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-4)",
    position: "relative",
    background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    padding: "var(--space-8)",
    boxShadow: "var(--shadow-2xl)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 1,
  },
  brand: { textAlign: "center", marginBottom: "var(--space-6)" },
  logoIcon: { fontSize: "2.75rem", marginBottom: "var(--space-2)" },
  brandName: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: 800,
    color: "var(--color-primary-800)",
    letterSpacing: "-0.02em",
  },
  brandTagline: {
    fontSize: "var(--font-size-xs)",
    color: "var(--text-secondary)",
    marginTop: "var(--space-1)",
  },
  form: { display: "flex", flexDirection: "column", gap: "var(--space-4)" },
  submitBtn: {
    width: "100%",
    padding: "var(--space-3)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 700,
    marginTop: "var(--space-2)",
  },
  error: {
    color: "var(--color-error)",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    marginTop: "var(--space-6)",
  },
};
