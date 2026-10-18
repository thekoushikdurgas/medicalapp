"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ponytail: no backend call — stub for demo
    setSubmitted(true);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.backdrop} />
      <div style={styles.card} className="animate-fade-in">
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>🔑</div>
          <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-primary-800)" }}>
            Reset Password
          </h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Enter your registered email or phone number
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>📧</div>
            <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-primary-800)", marginBottom: "var(--space-3)" }}>
              Reset Link Sent!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-6)" }}>
              If an account exists with <strong>{contact}</strong>, you&apos;ll receive reset instructions shortly.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.6rem 2rem" }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="contact" className="label">Email or Phone</label>
              <input
                id="contact"
                className="input"
                placeholder="e.g. name@example.com or +91 98765..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "var(--space-3)", fontWeight: 700 }}>
              Send Reset Link →
            </button>
            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <Link href="/login" style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>
                ← Back to Login
              </Link>
            </p>
          </form>
        )}
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
    width: "100%", maxWidth: "440px",
    background: "rgba(255, 255, 255, 0.96)", backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)", padding: "var(--space-8)",
    boxShadow: "var(--shadow-2xl)", border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative", zIndex: 1,
  },
};
