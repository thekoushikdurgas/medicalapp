"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "@/lib/graphql-queries";
import { AUTH_KEYS } from "@/lib/auth";

type RegisterRole = "SHOPKEEPER" | "DELIVERY";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("SHOPKEEPER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Shopkeeper fields
    shopName: "",
    shopAddress: "",
    gstin: "",
    drugLicenseNo: "",
    // Delivery fields
    vehicleType: "Two-Wheeler",
    vehicleNumber: "",
    assignedArea: "",
  });

  const [registerMutation] = useMutation(REGISTER_MUTATION, {
    errorPolicy: "all",
  });

  // SMS OTP Verification state
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  const set =
    (key: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.phone.trim()) {
      setError("Please provide a valid 10-digit mobile phone number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (
      role === "SHOPKEEPER" &&
      (!form.shopName.trim() || !form.shopAddress.trim())
    ) {
      setError("Please provide your Pharmacy Shop Name and Address.");
      return;
    }

    setLoading(true);

    try {
      const input: any = {
        role,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        email: form.email.trim() ? form.email.trim() : null,
      };

      if (role === "SHOPKEEPER") {
        input.shopName = form.shopName.trim();
        input.shopAddress = form.shopAddress.trim();
        input.gstin = form.gstin.trim() ? form.gstin.trim() : null;
        input.drugLicenseNo = form.drugLicenseNo.trim()
          ? form.drugLicenseNo.trim()
          : null;
      } else {
        input.vehicleType = form.vehicleType;
        input.vehicleNumber = form.vehicleNumber.trim()
          ? form.vehicleNumber.trim()
          : null;
        input.assignedArea = form.assignedArea.trim()
          ? form.assignedArea.trim()
          : null;
      }

      const res = await registerMutation({ variables: { input } });

      if (res.errors && res.errors.length > 0) {
        setError(res.errors[0].message);
        setLoading(false);
        return;
      }

      if (res.data?.register?.accessToken) {
        localStorage.setItem(AUTH_KEYS.TOKEN, res.data.register.accessToken);
        localStorage.setItem(
          AUTH_KEYS.USER,
          JSON.stringify(res.data.register.user),
        );
        setRegisteredUser(res.data.register.user);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please check details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (registeredUser) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.backdrop} />
        <div
          style={{ ...styles.card, maxWidth: "480px" }}
          className="animate-fade-in"
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "var(--space-2)" }}>
              🎉
            </div>
            <div
              style={{
                display: "inline-block",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--color-primary-800)",
                marginBottom: "var(--space-3)",
              }}
            >
              ⚡ Instant Free Registration • No Approval Needed
            </div>
            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: 800,
                color: "var(--color-primary-800)",
                marginBottom: "var(--space-2)",
              }}
            >
              Account Activated!
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "var(--space-4)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Welcome, <strong>{registeredUser.fullName}</strong>! Your account
              as{" "}
              <strong>
                {role === "SHOPKEEPER"
                  ? "🏪 Retail Shopkeeper"
                  : "🛵 Delivery Boy"}
              </strong>{" "}
              has been registered freely with full instant access.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "var(--space-3)",
                  fontWeight: 700,
                }}
                onClick={() => router.push("/dashboard")}
              >
                Go to Portal Dashboard →
              </button>
              <Link
                href="/login"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "var(--space-2)",
                }}
              >
                Sign in with another account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.backdrop} />
      <div
        style={{ ...styles.card, maxWidth: "560px" }}
        className="animate-fade-in"
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-1)" }}>
            {role === "SHOPKEEPER" ? "🏪" : "🛵"}
          </div>
          <h1
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--color-primary-800)",
            }}
          >
            {role === "SHOPKEEPER"
              ? "Retail Shopkeeper Registration"
              : "Delivery Boy Registration"}
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-secondary)",
              marginTop: "var(--space-1)",
            }}
          >
            Free self-service registration • Instantly active without approval
          </p>

          {/* Role Toggle */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-2)",
              marginTop: "var(--space-4)",
              background: "rgba(0,0,0,0.04)",
              padding: "4px",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole("SHOPKEEPER");
                setError("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background:
                  role === "SHOPKEEPER"
                    ? "var(--color-primary-600)"
                    : "transparent",
                color:
                  role === "SHOPKEEPER" ? "#ffffff" : "var(--text-secondary)",
                boxShadow:
                  role === "SHOPKEEPER"
                    ? "0 2px 8px rgba(5, 150, 105, 0.3)"
                    : "none",
              }}
            >
              🏪 Retail Shopkeeper
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("DELIVERY");
                setError("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background:
                  role === "DELIVERY"
                    ? "var(--color-primary-600)"
                    : "transparent",
                color:
                  role === "DELIVERY" ? "#ffffff" : "var(--text-secondary)",
                boxShadow:
                  role === "DELIVERY"
                    ? "0 2px 8px rgba(5, 150, 105, 0.3)"
                    : "none",
              }}
            >
              🛵 Delivery Boy
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <label htmlFor="fullName" className="label">
                {role === "SHOPKEEPER"
                  ? "Proprietor / Owner Name *"
                  : "Full Name *"}
              </label>
              <input
                id="fullName"
                className="input"
                placeholder={
                  role === "SHOPKEEPER"
                    ? "e.g. Ramesh Ghosh"
                    : "e.g. Rahul Sharma"
                }
                value={form.fullName}
                onChange={set("fullName")}
                required
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  htmlFor="phone"
                  className="label"
                  style={{ marginBottom: 0 }}
                >
                  Mobile Phone Number *
                </label>
                {isPhoneVerified ? (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--color-success)",
                    }}
                  >
                    ✓ SMS OTP Verified
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-1)",
                }}
              >
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  placeholder="e.g. 9832145678"
                  value={form.phone}
                  onChange={(e) => {
                    set("phone")(e);
                    if (isPhoneVerified) setIsPhoneVerified(false);
                  }}
                  required
                />
                {!isPhoneVerified && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      padding: "0 0.75rem",
                    }}
                    disabled={form.phone.trim().length < 10 || otpSending}
                    onClick={() => {
                      setOtpSending(true);
                      setOtpError("");
                      setTimeout(() => {
                        setOtpSent(true);
                        setOtpSending(false);
                      }, 500);
                    }}
                  >
                    {otpSending
                      ? "Sending..."
                      : otpSent
                        ? "Resend OTP"
                        : "Verify via OTP"}
                  </button>
                )}
              </div>

              {/* OTP Input Box if sent & not verified */}
              {otpSent && !isPhoneVerified && (
                <div
                  style={{
                    marginTop: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px dashed var(--color-primary-400)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Code dispatched to +91 {form.phone}</span>
                    <strong style={{ color: "var(--color-primary-700)" }}>
                      Demo OTP: 482910
                    </strong>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter 6-digit OTP"
                      style={{
                        padding: "0.3rem 0.5rem",
                        fontSize: "0.85rem",
                        letterSpacing: "2px",
                        fontWeight: 700,
                      }}
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        fontSize: "0.75rem",
                        padding: "0 0.75rem",
                        fontWeight: 700,
                      }}
                      onClick={() => {
                        if (
                          otpInput.trim() === "482910" ||
                          otpInput.trim().length === 6
                        ) {
                          setIsPhoneVerified(true);
                          setOtpError("");
                        } else {
                          setOtpError(
                            "Invalid code. Please enter 482910 for instant verification.",
                          );
                        }
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                  {otpError && (
                    <div
                      style={{
                        color: "var(--color-error)",
                        fontSize: "0.72rem",
                        marginTop: "4px",
                      }}
                    >
                      {otpError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email Address (optional)
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="e.g. partner@example.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          {/* Role-specific section */}
          {role === "SHOPKEEPER" ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label htmlFor="shopName" className="label">
                    Medical / Pharmacy Name *
                  </label>
                  <input
                    id="shopName"
                    className="input"
                    placeholder="e.g. Gupta Pharmacy"
                    value={form.shopName}
                    onChange={set("shopName")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gstin" className="label">
                    GSTIN (optional)
                  </label>
                  <input
                    id="gstin"
                    className="input"
                    placeholder="e.g. 19AAACC1234D1Z5"
                    value={form.gstin}
                    onChange={set("gstin")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shopAddress" className="label">
                  Pharmacy Address *
                </label>
                <textarea
                  id="shopAddress"
                  className="input"
                  placeholder="Street address, market name, pin code"
                  value={form.shopAddress}
                  onChange={set("shopAddress")}
                  required
                  style={{ minHeight: "65px", resize: "vertical" }}
                />
              </div>

              <div>
                <label htmlFor="drugLicenseNo" className="label">
                  Drug License Number (optional)
                </label>
                <input
                  id="drugLicenseNo"
                  className="input"
                  placeholder="e.g. DL-20B-123456"
                  value={form.drugLicenseNo}
                  onChange={set("drugLicenseNo")}
                />
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label htmlFor="vehicleType" className="label">
                    Vehicle Type *
                  </label>
                  <select
                    id="vehicleType"
                    className="input"
                    value={form.vehicleType}
                    onChange={set("vehicleType")}
                  >
                    <option value="Two-Wheeler">Bike / Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Three-Wheeler">Three-Wheeler / Auto</option>
                    <option value="Van">Small Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehicleNumber" className="label">
                    Vehicle Number (optional)
                  </label>
                  <input
                    id="vehicleNumber"
                    className="input"
                    placeholder="e.g. WB-40-AB-1234"
                    value={form.vehicleNumber}
                    onChange={set("vehicleNumber")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="assignedArea" className="label">
                  Preferred Delivery Zone / Area
                </label>
                <input
                  id="assignedArea"
                  className="input"
                  placeholder="e.g. Benachity, City Centre, B-Zone"
                  value={form.assignedArea}
                  onChange={set("assignedArea")}
                />
              </div>
            </>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <label htmlFor="password" className="label">
                Create Password *
              </label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                className="input"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                required
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "var(--space-3)",
              fontWeight: 700,
              marginTop: "var(--space-2)",
            }}
            disabled={loading}
          >
            {loading
              ? "Activating Free Account..."
              : `Register freely as ${role === "SHOPKEEPER" ? "Retail Shopkeeper" : "Delivery Boy"} →`}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginTop: "var(--space-4)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--color-primary-600)", fontWeight: 600 }}
          >
            Sign in here →
          </Link>
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
    maxWidth: "560px",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "var(--radius-2xl)",
    padding: "var(--space-6) var(--space-8)",
    boxShadow: "var(--shadow-2xl)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 1,
  },
};
