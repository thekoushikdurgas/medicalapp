"use client";

import { useState } from "react";
import Link from "next/link";

type RecoveryStep = "CONTACT" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<RecoveryStep>("CONTACT");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "#9ca3af" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8) score += 1;

    if (score === 1)
      return { score: 1, label: "Weak", color: "var(--color-error)" };
    if (score === 2)
      return { score: 2, label: "Good", color: "var(--color-warning)" };
    return { score: 3, label: "Strong", color: "var(--color-success)" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!contact.trim()) {
      setError("Please enter your registered email or phone number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("OTP");
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim() === "739201" || otp.trim().length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("NEW_PASSWORD");
      }, 500);
    } else {
      setError("Invalid OTP code. Please enter 739201 to verify.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("SUCCESS");
    }, 600);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.backdrop} />
      <div style={styles.card} className="animate-fade-in">
        {/* Step Indicator Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>
            {step === "CONTACT" && "🔑"}
            {step === "OTP" && "💬"}
            {step === "NEW_PASSWORD" && "🛡️"}
            {step === "SUCCESS" && "✅"}
          </div>
          <h1
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--color-primary-800)",
            }}
          >
            {step === "CONTACT" && "Recover Account"}
            {step === "OTP" && "Enter Recovery OTP"}
            {step === "NEW_PASSWORD" && "Set New Password"}
            {step === "SUCCESS" && "Password Reset Complete!"}
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginTop: "var(--space-1)",
            }}
          >
            {step === "CONTACT" &&
              "Enter your registered mobile or email to initiate secure verification"}
            {step === "OTP" && `6-digit security code dispatched to ${contact}`}
            {step === "NEW_PASSWORD" &&
              "Choose a strong password to protect your pharmacy account"}
            {step === "SUCCESS" &&
              "Your password has been successfully updated"}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "var(--space-3)",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "0.85rem",
              marginBottom: "var(--space-4)",
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: CONTACT */}
        {step === "CONTACT" && (
          <form
            onSubmit={handleSendOtp}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <label htmlFor="contact" className="label">
                Registered Email or Mobile Number *
              </label>
              <input
                id="contact"
                className="input"
                placeholder="e.g. 9832145678 or partner@example.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                fontWeight: 700,
              }}
            >
              {loading ? "Dispatching OTP..." : "Send Verification OTP →"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              <Link
                href="/login"
                style={{ color: "var(--color-primary-600)", fontWeight: 600 }}
              >
                ← Return to Login
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "OTP" && (
          <form
            onSubmit={handleVerifyOtp}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                padding: "var(--space-3)",
                background: "rgba(16, 185, 129, 0.08)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Verification Code Sent</span>
              <strong style={{ color: "var(--color-primary-700)" }}>
                Demo Code: 739201
              </strong>
            </div>

            <div>
              <label htmlFor="otp" className="label">
                6-Digit Security Code *
              </label>
              <input
                id="otp"
                className="input"
                placeholder="739201"
                maxLength={6}
                style={{
                  letterSpacing: "4px",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  textAlign: "center",
                }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || otp.length < 6}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                fontWeight: 700,
              }}
            >
              {loading ? "Verifying..." : "Verify Code & Proceed →"}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
              }}
            >
              <button
                type="button"
                onClick={() => setStep("CONTACT")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                ← Change Contact
              </button>
              <button
                type="button"
                onClick={() => setOtp("739201")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary-600)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Auto-fill Demo Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "NEW_PASSWORD" && (
          <form
            onSubmit={handleResetPassword}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <label htmlFor="newPassword" className="label">
                New Password *
              </label>
              <input
                id="newPassword"
                type="password"
                className="input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {/* Strength Meter */}
              {newPassword && (
                <div style={{ marginTop: "6px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.72rem",
                      marginBottom: "2px",
                    }}
                  >
                    <span>Password Strength:</span>
                    <strong style={{ color: strength.color }}>
                      {strength.label}
                    </strong>
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "rgba(0,0,0,0.1)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(strength.score / 3) * 100}%`,
                        background: strength.color,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm New Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                fontWeight: 700,
              }}
            >
              {loading ? "Updating Password..." : "Save & Update Password →"}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "SUCCESS" && (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-6)",
              }}
            >
              Your account password has been updated securely. You can now log
              into your Pharmacy Fantasy dashboard using your new credentials.
            </p>
            <Link
              href="/login"
              className="btn btn-primary"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "var(--space-3)",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Sign In to Your Account →
            </Link>
          </div>
        )}
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
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
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
};
