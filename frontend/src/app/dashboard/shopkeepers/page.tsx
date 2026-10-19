"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  SHOPKEEPERS_QUERY,
  UPDATE_SHOPKEEPER_KYC_MUTATION,
  UPDATE_SHOPKEEPER_CREDIT_LIMIT_MUTATION,
} from "@/lib/graphql-queries";
import { SideDrawer } from "@/components/ui/side-drawer";

interface Shopkeeper {
  id: string;
  userId?: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city?: string;
  gstin: string;
  drugLicense: string;
  creditLimit: number;
  outstandingBalance: number;
  totalOrders: number;
  verificationStatus:
    "VERIFIED" | "PENDING_VERIFICATION" | "REJECTED" | "SUSPENDED";
  verificationNotes?: string;
  creditLimitReason?: string;
}

const DEMO_SHOPKEEPERS: Shopkeeper[] = [
  {
    id: "sh-1",
    shopName: "Cheap Medical Stores",
    ownerName: "Amitabh Das",
    phone: "+91 98321 45678",
    email: "cheapmed.benachity@gmail.com",
    address: "Shop No 14, Main Market, Benachity, Durgapur-13",
    area: "Benachity",
    city: "Durgapur",
    gstin: "19AAACC1234D1Z5",
    drugLicense: "WB-BUR-20B-10492",
    creditLimit: 100000,
    outstandingBalance: 23375.0,
    totalOrders: 14,
    verificationStatus: "VERIFIED",
    verificationNotes:
      "Physical inspection completed. License valid through Dec 2028.",
    creditLimitReason: "15-day wholesale terms. Regular settlement cycle.",
  },
  {
    id: "sh-2",
    shopName: "Gupta Pharmacy & Clinic",
    ownerName: "Ramesh Gupta",
    phone: "+91 98321 45679",
    email: "gupta.pharma16@outlook.com",
    address: "A-22 Commercial Complex, City Centre, Durgapur-16",
    area: "City Centre",
    city: "Durgapur",
    gstin: "19BBBDD5678E1Z9",
    drugLicense: "WB-BUR-20B-11883",
    creditLimit: 150000,
    outstandingBalance: 8617.25,
    totalOrders: 9,
    verificationStatus: "VERIFIED",
    verificationNotes:
      "Wholesale & Retail licenses verified with state drug portal.",
    creditLimitReason: "Approved high volume revolving credit ceiling.",
  },
  {
    id: "sh-3",
    shopName: "Maa Tara Medical Hall",
    ownerName: "Subrata Roy",
    phone: "+91 98321 45680",
    email: "maataramedical@rediffmail.com",
    address: "Sector 2B Market, Bidhannagar, Durgapur-12",
    area: "Bidhannagar",
    city: "Durgapur",
    gstin: "19CCCEE9012F1Z1",
    drugLicense: "WB-BUR-20B-12994",
    creditLimit: 80000,
    outstandingBalance: 0.0,
    totalOrders: 21,
    verificationStatus: "VERIFIED",
    verificationNotes: "Fully compliant store. Zero payment default record.",
    creditLimitReason: "Standard credit allocation.",
  },
  {
    id: "sh-4",
    shopName: "Life Care Pharma & Surgicals",
    ownerName: "Dipankar Ghosh",
    phone: "+91 98321 45681",
    email: "lifecaredgp@gmail.com",
    address: "Station Road, Andal More, Durgapur-05",
    area: "Mamra Bazar",
    city: "Durgapur",
    gstin: "19DDDEF3456G1Z2",
    drugLicense: "WB-BUR-20B-14502",
    creditLimit: 0,
    outstandingBalance: 0.0,
    totalOrders: 0,
    verificationStatus: "PENDING_VERIFICATION",
    verificationNotes: "Awaiting physical copy of 20B wholesale drug license.",
    creditLimitReason: "Prepaid orders only until KYC verification approved.",
  },
  {
    id: "sh-5",
    shopName: "Apollo Medicos Franchise",
    ownerName: "Kishore Kumar Agarwal",
    phone: "+91 98321 45682",
    email: "apollomedicos.dgp@gmail.com",
    address: "Near Junction Mall, City Centre, Durgapur-16",
    area: "City Centre",
    city: "Durgapur",
    gstin: "19EEEFF7890H1Z3",
    drugLicense: "WB-BUR-20B-15980",
    creditLimit: 50000,
    outstandingBalance: 48500.0,
    totalOrders: 18,
    verificationStatus: "SUSPENDED",
    verificationNotes:
      "Credit ceiling breach (>95% utilized) and overdue invoice > 45 days.",
    creditLimitReason:
      "Restricted pending reconciliation of outstanding balance.",
  },
];

export default function ShopkeepersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "VERIFIED" | "PENDING_VERIFICATION" | "SUSPENDED" | "CREDIT_ALERT"
  >("ALL");

  // Selected shop for drawer inspection / verification
  const [selectedShop, setSelectedShop] = useState<Shopkeeper | null>(null);

  // Verification & Credit drawer form state
  const [kycNotesInput, setKycNotesInput] = useState("");
  const [newCreditLimitInput, setNewCreditLimitInput] = useState<
    number | string
  >("");
  const [creditReasonInput, setCreditReasonInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Local state for shops
  const [localShops, setLocalShops] = useState<Shopkeeper[]>(DEMO_SHOPKEEPERS);

  // Apollo queries and mutations
  const { data, loading, refetch } = useQuery(SHOPKEEPERS_QUERY, {
    variables: {
      search: searchTerm || null,
      status:
        activeFilter === "ALL" || activeFilter === "CREDIT_ALERT"
          ? null
          : activeFilter,
    },
    fetchPolicy: "network-only",
  });

  const [updateKycMutation, { loading: updatingKyc }] = useMutation(
    UPDATE_SHOPKEEPER_KYC_MUTATION,
  );
  const [updateCreditLimitMutation, { loading: updatingCredit }] = useMutation(
    UPDATE_SHOPKEEPER_CREDIT_LIMIT_MUTATION,
  );

  // Compute effective shops
  const effectiveShops: Shopkeeper[] =
    data?.shopkeepers && data.shopkeepers.length > 0
      ? data.shopkeepers.map((item: any) => ({
          id: item.id,
          userId: item.userId,
          shopName: item.shopName,
          ownerName: item.ownerName || "Medical Store In-charge",
          phone: item.phone || "—",
          email: item.email || undefined,
          address: item.shopAddress || "Durgapur, West Bengal",
          area: item.area || "Durgapur",
          city: item.city || "Durgapur",
          gstin: item.gstin || "Unregistered",
          drugLicense: item.drugLicenseNo || "Pending Verification",
          creditLimit: item.creditLimit || 0,
          outstandingBalance: item.outstandingBalance || 0,
          totalOrders: item.totalOrders || 0,
          verificationStatus: (item.verificationStatus ||
            "VERIFIED") as Shopkeeper["verificationStatus"],
          verificationNotes: item.verificationNotes || undefined,
          creditLimitReason: item.creditLimitReason || undefined,
        }))
      : localShops;

  // New Shop modal state
  const [newShop, setNewShop] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    area: "Benachity",
    gstin: "",
    drugLicense: "",
    creditLimit: 50000,
  });

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.shopName || !newShop.phone) {
      alert("Please provide Shop Name and Mobile Number");
      return;
    }
    const item: Shopkeeper = {
      id: `sh-${Date.now()}`,
      shopName: newShop.shopName,
      ownerName: newShop.ownerName || "Medical Store In-charge",
      phone: newShop.phone,
      address: newShop.address || "Durgapur, West Bengal",
      area: newShop.area,
      gstin: newShop.gstin || "Unregistered",
      drugLicense: newShop.drugLicense || "Pending Verification",
      creditLimit: Number(newShop.creditLimit),
      outstandingBalance: 0,
      totalOrders: 0,
      verificationStatus: "PENDING_VERIFICATION",
      verificationNotes: "New registration - Pending license inspection.",
      creditLimitReason: "Initial credit allocation requested upon onboarding.",
    };
    setLocalShops((prev) => [item, ...prev]);
    setShowAddModal(false);
    setFeedbackMessage(
      `Pharmacy "${item.shopName}" onboarded! Pending KYC verification.`,
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const openDrawer = (shop: Shopkeeper) => {
    setSelectedShop(shop);
    setKycNotesInput(shop.verificationNotes || "");
    setNewCreditLimitInput(shop.creditLimit);
    setCreditReasonInput(shop.creditLimitReason || "");
  };

  const handleUpdateKyc = async (
    newStatus: Shopkeeper["verificationStatus"],
  ) => {
    if (!selectedShop) return;
    try {
      if (selectedShop.userId) {
        await updateKycMutation({
          variables: {
            shopkeeperId: selectedShop.userId,
            status: newStatus,
            notes: kycNotesInput.trim() || null,
          },
        });
        refetch();
      }

      // Update local state
      setLocalShops((prev) =>
        prev.map((s) =>
          s.id === selectedShop.id
            ? {
                ...s,
                verificationStatus: newStatus,
                verificationNotes: kycNotesInput.trim(),
              }
            : s,
        ),
      );

      setSelectedShop((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: newStatus,
              verificationNotes: kycNotesInput.trim(),
            }
          : null,
      );

      setFeedbackMessage(
        `KYC status for "${selectedShop.shopName}" updated to ${newStatus}.`,
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to update KYC status");
    }
  };

  const handleUpdateCreditLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    const numLimit = Number(newCreditLimitInput);
    if (isNaN(numLimit) || numLimit < 0) {
      alert("Please enter a valid credit limit (>= 0).");
      return;
    }
    if (!creditReasonInput.trim()) {
      alert(
        "Documented justification reason is mandatory for credit limit updates.",
      );
      return;
    }

    try {
      if (selectedShop.userId) {
        await updateCreditLimitMutation({
          variables: {
            shopkeeperId: selectedShop.userId,
            newLimit: numLimit,
            reason: creditReasonInput.trim(),
          },
        });
        refetch();
      }

      // Update local state
      setLocalShops((prev) =>
        prev.map((s) =>
          s.id === selectedShop.id
            ? {
                ...s,
                creditLimit: numLimit,
                creditLimitReason: creditReasonInput.trim(),
              }
            : s,
        ),
      );

      setSelectedShop((prev) =>
        prev
          ? {
              ...prev,
              creditLimit: numLimit,
              creditLimitReason: creditReasonInput.trim(),
            }
          : null,
      );

      setFeedbackMessage(
        `Credit limit for "${selectedShop.shopName}" updated to ₹${numLimit.toLocaleString("en-IN")}.`,
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to update credit limit");
    }
  };

  // Filter application
  const filteredShops = effectiveShops.filter((s) => {
    const matchesSearch =
      s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.drugLicense.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") return true;
    if (activeFilter === "CREDIT_ALERT") {
      return s.creditLimit > 0 && s.outstandingBalance / s.creditLimit >= 0.8;
    }
    return s.verificationStatus === activeFilter;
  });

  // Aggregate metrics
  const totalVerified = effectiveShops.filter(
    (s) => s.verificationStatus === "VERIFIED",
  ).length;
  const totalPendingKyc = effectiveShops.filter(
    (s) => s.verificationStatus === "PENDING_VERIFICATION",
  ).length;
  const totalCredit = effectiveShops.reduce((acc, s) => acc + s.creditLimit, 0);
  const totalOutstanding = effectiveShops.reduce(
    (acc, s) => acc + s.outstandingBalance,
    0,
  );

  const getStatusBadge = (status: Shopkeeper["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return <span className="badge badge-success">✓ Verified</span>;
      case "PENDING_VERIFICATION":
        return <span className="badge badge-warning">⏳ Pending KYC</span>;
      case "REJECTED":
        return <span className="badge badge-neutral">✕ Rejected</span>;
      case "SUSPENDED":
        return <span className="badge badge-error">⛔ Suspended</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
            Registered Retail Pharmacies
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            B2B shopkeeper profiles, Drug License KYC verification, credit
            exposure limits, and order authorization
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="add-shopkeeper-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Onboard New Pharmacy Store
        </button>
      </div>

      {feedbackMessage && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-success)",
            fontWeight: 600,
            marginBottom: "var(--space-4)",
          }}
        >
          ✓ {feedbackMessage}
        </div>
      )}

      {/* Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            RETAIL STORES
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--color-primary-700)",
            }}
          >
            {effectiveShops.length} Stores
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {totalVerified} Verified • {totalPendingKyc} Pending KYC
          </p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            TOTAL CREDIT EXTENDED
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--color-primary-600)",
            }}
          >
            ₹{totalCredit.toLocaleString("en-IN")}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Revolving wholesale credit ceiling
          </p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            TOTAL OUTSTANDING DUE
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--color-error)",
            }}
          >
            ₹
            {totalOutstanding.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {totalCredit > 0
              ? `${((totalOutstanding / totalCredit) * 100).toFixed(1)}% of credit line used`
              : "0%"}
          </p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            PENDING KYC VERIFICATION
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color:
                totalPendingKyc > 0
                  ? "var(--color-warning)"
                  : "var(--color-success)",
            }}
          >
            {totalPendingKyc} Pending
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Requires Drug License (20B/21B) check
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className="card"
        style={{
          padding: "var(--space-4)",
          marginBottom: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
        >
          <button
            className={`btn ${activeFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => setActiveFilter("ALL")}
          >
            All Pharmacies ({effectiveShops.length})
          </button>
          <button
            className={`btn ${activeFilter === "VERIFIED" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => setActiveFilter("VERIFIED")}
          >
            ✓ Verified ({totalVerified})
          </button>
          <button
            className={`btn ${activeFilter === "PENDING_VERIFICATION" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => setActiveFilter("PENDING_VERIFICATION")}
          >
            ⏳ Pending KYC ({totalPendingKyc})
          </button>
          <button
            className={`btn ${activeFilter === "SUSPENDED" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => setActiveFilter("SUSPENDED")}
          >
            ⛔ Suspended (
            {
              effectiveShops.filter((s) => s.verificationStatus === "SUSPENDED")
                .length
            }
            )
          </button>
          <button
            className={`btn ${activeFilter === "CREDIT_ALERT" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => setActiveFilter("CREDIT_ALERT")}
          >
            ⚠️ High Credit Exposure (
            {
              effectiveShops.filter(
                (s) =>
                  s.creditLimit > 0 &&
                  s.outstandingBalance / s.creditLimit >= 0.8,
              ).length
            }
            )
          </button>
        </div>

        <input
          className="input"
          placeholder="Search by pharmacy name, proprietor, area (Benachity, City Centre), or Drug License No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Shopkeepers Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Pharmacy Details</th>
                <th>Area / Hub</th>
                <th>Drug License / GSTIN</th>
                <th>Credit Limit</th>
                <th>Outstanding Due</th>
                <th>Orders</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "var(--space-6)",
                      color: "var(--text-muted)",
                    }}
                  >
                    No retail pharmacies match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredShops.map((s) => {
                  const creditUsedPct =
                    s.creditLimit > 0
                      ? (s.outstandingBalance / s.creditLimit) * 100
                      : 0;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--color-primary-800)",
                          }}
                        >
                          {s.shopName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Prop. {s.ownerName} • {s.phone}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {s.address}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{s.area}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          DL: <code>{s.drugLicense}</code>
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          GSTIN: <code>{s.gstin}</code>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{s.creditLimit.toLocaleString("en-IN")}
                        {s.creditLimitReason && (
                          <div
                            style={{
                              fontSize: "0.65rem",
                              color: "var(--text-muted)",
                              maxWidth: "120px",
                            }}
                          >
                            {s.creditLimitReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color:
                              s.outstandingBalance > 0
                                ? "var(--color-error)"
                                : "var(--color-success)",
                          }}
                        >
                          ₹
                          {s.outstandingBalance.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        {s.creditLimit > 0 && (
                          <div
                            style={{
                              width: "100%",
                              background: "#e2e8f0",
                              height: "4px",
                              borderRadius: "2px",
                              marginTop: "4px",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(creditUsedPct, 100)}%`,
                                background:
                                  creditUsedPct > 80
                                    ? "var(--color-error)"
                                    : "var(--color-warning)",
                                height: "100%",
                                borderRadius: "2px",
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.totalOrders}</td>
                      <td>{getStatusBadge(s.verificationStatus)}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "var(--space-2)",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: "0.25rem 0.6rem",
                              fontSize: "0.75rem",
                            }}
                            onClick={() => openDrawer(s)}
                          >
                            🔍 Review KYC & Credit
                          </button>
                          <Link
                            href="/dashboard/invoices"
                            className="btn btn-secondary"
                            style={{
                              padding: "0.25rem 0.6rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            Ledger
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SideDrawer: Pharmacy Profile, KYC Verification & Credit Control */}
      <SideDrawer
        isOpen={!!selectedShop}
        onClose={() => setSelectedShop(null)}
        title="🏪 Pharmacy Profile & Verification"
        subtitle={
          selectedShop
            ? `${selectedShop.shopName} • Prop. ${selectedShop.ownerName}`
            : ""
        }
      >
        {selectedShop && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            {/* Pharmacy Contact & Regulatory Details */}
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-2)",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Proprietor:
                  </span>
                  <div style={{ fontWeight: 700 }}>
                    {selectedShop.ownerName}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Phone / Contact:
                  </span>
                  <div style={{ fontWeight: 700 }}>{selectedShop.phone}</div>
                </div>
                <div>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Hub / Area:
                  </span>
                  <div style={{ fontWeight: 600 }}>
                    {selectedShop.area}, {selectedShop.city || "Durgapur"}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Current KYC Status:
                  </span>
                  <div>{getStatusBadge(selectedShop.verificationStatus)}</div>
                </div>
              </div>

              <div style={{ marginTop: "var(--space-2)" }}>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                  }}
                >
                  Registered Address:
                </span>
                <div
                  style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}
                >
                  {selectedShop.address}
                </div>
              </div>
            </div>

            {/* Statutory Compliance Section */}
            <div
              style={{
                border: "1px solid var(--border-color)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  marginBottom: "var(--space-3)",
                }}
              >
                📜 Statutory Licenses & KYC Verification
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-3)",
                }}
              >
                <div
                  style={{
                    padding: "var(--space-2)",
                    background: "rgba(37, 99, 235, 0.05)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Drug License (Form 20B/21B)
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "var(--color-primary-800)",
                    }}
                  >
                    {selectedShop.drugLicense}
                  </div>
                </div>
                <div
                  style={{
                    padding: "var(--space-2)",
                    background: "rgba(37, 99, 235, 0.05)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    GSTIN
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "var(--color-primary-800)",
                    }}
                  >
                    {selectedShop.gstin}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "var(--space-3)" }}>
                <label className="label">
                  Verification Notes / Inspection Remarks
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Record verification notes, license expiry, physical store visit details..."
                  value={kycNotesInput}
                  onChange={(e) => setKycNotesInput(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: "120px" }}
                  disabled={
                    updatingKyc ||
                    selectedShop.verificationStatus === "VERIFIED"
                  }
                  onClick={() => handleUpdateKyc("VERIFIED")}
                >
                  ✓ Approve KYC
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: "120px" }}
                  disabled={
                    updatingKyc ||
                    selectedShop.verificationStatus === "REJECTED"
                  }
                  onClick={() => handleUpdateKyc("REJECTED")}
                >
                  ✕ Reject License
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    color: "var(--color-error)",
                    borderColor: "var(--color-error)",
                    flex: 1,
                    minWidth: "120px",
                  }}
                  disabled={
                    updatingKyc ||
                    selectedShop.verificationStatus === "SUSPENDED"
                  }
                  onClick={() => handleUpdateKyc("SUSPENDED")}
                >
                  ⛔ Suspend Store
                </button>
              </div>
            </div>

            {/* Credit Ceiling & Exposure Controls */}
            <div
              style={{
                border: "1px solid var(--border-color)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  marginBottom: "var(--space-3)",
                }}
              >
                💳 Credit Limit & Financial Safeguards
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-4)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    padding: "var(--space-2)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Current Limit
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "var(--color-primary-700)",
                    }}
                  >
                    ₹{selectedShop.creditLimit.toLocaleString("en-IN")}
                  </div>
                </div>
                <div
                  style={{
                    padding: "var(--space-2)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Outstanding Due
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color:
                        selectedShop.outstandingBalance > 0
                          ? "var(--color-error)"
                          : "var(--color-success)",
                    }}
                  >
                    ₹
                    {selectedShop.outstandingBalance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div
                  style={{
                    padding: "var(--space-2)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Remaining Credit
                  </div>
                  <div
                    style={{ fontWeight: 800, color: "var(--color-success)" }}
                  >
                    ₹
                    {Math.max(
                      0,
                      selectedShop.creditLimit -
                        selectedShop.outstandingBalance,
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {selectedShop.creditLimitReason && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  <strong>Prior Reason:</strong>{" "}
                  {selectedShop.creditLimitReason}
                </div>
              )}

              <form
                onSubmit={handleUpdateCreditLimit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label className="label">Adjust Credit Ceiling (₹) *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={newCreditLimitInput}
                    onChange={(e) => setNewCreditLimitInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">
                    Documented Justification Reason *
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Verified good repayment history over 6 months; approved limit increase"
                    required
                    value={creditReasonInput}
                    onChange={(e) => setCreditReasonInput(e.target.value)}
                  />
                  <span
                    style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                  >
                    Mandatory audit trail reason required under financial
                    controls.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingCredit}
                  style={{ alignSelf: "flex-end" }}
                >
                  {updatingCredit ? "Updating..." : "Save Credit Ceiling"}
                </button>
              </form>
            </div>

            {/* Quick Navigation Footer */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                marginTop: "var(--space-2)",
              }}
            >
              <Link
                href="/dashboard/invoices"
                className="btn btn-secondary"
                style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
              >
                📄 View Party Ledger & Claims
              </Link>
              <Link
                href="/dashboard/orders"
                className="btn btn-secondary"
                style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
              >
                📦 Create Wholesale Order
              </Link>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Add Shopkeeper Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            className="card"
            style={{ maxWidth: "560px", width: "100%", background: "#fff" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800 }}>
                🏪 Onboard New Retail Medical Store
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleAddShop}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Pharmacy Shop Name *
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Life Care Medicos"
                    required
                    value={newShop.shopName}
                    onChange={(e) =>
                      setNewShop({ ...newShop, shopName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Owner / Pharmacist Name
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. Anup Ghosh"
                    value={newShop.ownerName}
                    onChange={(e) =>
                      setNewShop({ ...newShop, ownerName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Phone Number *
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. 9832198765"
                    required
                    value={newShop.phone}
                    onChange={(e) =>
                      setNewShop({ ...newShop, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Area / Hub
                  </label>
                  <select
                    className="input"
                    value={newShop.area}
                    onChange={(e) =>
                      setNewShop({ ...newShop, area: e.target.value })
                    }
                  >
                    <option value="Benachity">Benachity Market</option>
                    <option value="City Centre">City Centre</option>
                    <option value="Bidhannagar">Bidhannagar</option>
                    <option value="Mamra Bazar">Mamra Bazar</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Detailed Street Address
                </label>
                <input
                  className="input"
                  placeholder="e.g. Holding No 22, Link Road, Benachity, Durgapur-13"
                  value={newShop.address}
                  onChange={(e) =>
                    setNewShop({ ...newShop, address: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Drug License Number (20B/21B)
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. WB-BUR-20B-18290"
                    value={newShop.drugLicense}
                    onChange={(e) =>
                      setNewShop({ ...newShop, drugLicense: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    GSTIN (15 Digits)
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. 19AAAAA0000A1Z5"
                    value={newShop.gstin}
                    onChange={(e) =>
                      setNewShop({ ...newShop, gstin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Approved Credit Limit (₹)
                </label>
                <input
                  type="number"
                  className="input"
                  value={newShop.creditLimit}
                  onChange={(e) =>
                    setNewShop({
                      ...newShop,
                      creditLimit: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-3)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Onboard Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
