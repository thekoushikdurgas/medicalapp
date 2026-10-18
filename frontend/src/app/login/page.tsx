"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { LOGIN_MUTATION } from "@/lib/graphql-queries";
import { AUTH_KEYS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    errorPolicy: "all",
  });

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please enter your registered email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginMutation({
        variables: { email, password },
      });

      if (res.data?.login?.accessToken) {
        localStorage.setItem(AUTH_KEYS.TOKEN, res.data.login.accessToken);
        localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(res.data.login.user));
        router.push("/dashboard");
        return;
      }

      if (res.errors && res.errors.length > 0) {
        setError(res.errors[0].message || "Invalid email or password.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please verify credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label htmlFor="email" className="label">
              Registered Email / Phone ID
            </label>
            <input
              id="email"
              type="text"
              className="input"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
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
              autoComplete="current-password"
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
