"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ shopName: "", ownerName: "", phone: "", email: "", gstIn: "", address: "", password: "", confirmPassword: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    // ponytail: no backend call yet — stub for demo
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.backdrop} />
        <div style={styles.card} className="animate-fade-in">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>✅</div>
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--color-primary-800)", marginBottom: "var(--space-3)" }}>
              Registration Submitted!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
              Your shopkeeper account is pending approval by the operations team.
              You&apos;ll receive a confirmation via phone/email once approved.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.6rem 2rem" }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.backdrop} />
      <div style={{ ...styles.card, maxWidth: "540px" }} className="animate-fade-in">
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>🏪</div>
          <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-800)" }}>
            Shopkeeper Registration
          </h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Register your retail pharmacy to start ordering from our wholesale catalog
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="shopName" className="label">Shop Name *</label>
              <input id="shopName" className="input" placeholder="e.g. Cheap Medical Stores" value={form.shopName} onChange={set("shopName")} required />
            </div>
            <div>
              <label htmlFor="ownerName" className="label">Owner Name *</label>
              <input id="ownerName" className="input" placeholder="e.g. Amitabh Das" value={form.ownerName} onChange={set("ownerName")} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="phone" className="label">Phone Number *</label>
              <input id="phone" className="input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set("phone")} required />
            </div>
            <div>
              <label htmlFor="email" className="label">Email (optional)</label>
              <input id="email" className="input" type="email" placeholder="shop@example.com" value={form.email} onChange={set("email")} />
            </div>
          </div>

          <div>
            <label htmlFor="gstIn" className="label">GSTIN (optional)</label>
            <input id="gstIn" className="input" placeholder="e.g. 19ABCDE1234F1Z5" value={form.gstIn} onChange={set("gstIn")} />
          </div>

          <div>
            <label htmlFor="address" className="label">Shop Address *</label>
            <textarea
              id="address"
              className="input"
              placeholder="Full shop address with pin code"
              value={form.address}
              onChange={set("address")}
              required
              style={{ minHeight: "80px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="password" className="label">Password *</label>
              <input id="password" className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password *</label>
              <input id="confirmPassword" className="input" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
            </div>
          </div>

          {error && <p style={{ color: "var(--color-error)", fontSize: "var(--font-size-xs)", fontWeight: 600, textAlign: "center" }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "var(--space-3)", fontWeight: 700, marginTop: "var(--space-2)" }}>
            Submit Registration Request →
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "var(--space-4)" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>
            Sign in here →
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "var(--space-4)", position: "relative",
    background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)",
  },
  backdrop: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
  },
  card: {
    width: "100%", maxWidth: "460px",
    background: "rgba(255, 255, 255, 0.96)", backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)", padding: "var(--space-8)",
    boxShadow: "var(--shadow-2xl)", border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative", zIndex: 1,
  },
};
