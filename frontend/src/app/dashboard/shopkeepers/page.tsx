"use client";

import { useState } from "react";
import Link from "next/link";

interface Shopkeeper {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  area: string;
  gstin: string;
  drugLicense: string;
  creditLimit: number;
  outstandingBalance: number;
  totalOrders: number;
  status: "ACTIVE" | "PENDING_KYC";
}

export default function ShopkeepersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([
    {
      id: "sh-1",
      shopName: "Cheap Medical Stores",
      ownerName: "Amitabh Das",
      phone: "+91 98321 45678",
      address: "Shop No 14, Main Market, Benachity, Durgapur-13",
      area: "Benachity",
      gstin: "19AAACC1234D1Z5",
      drugLicense: "WB-BUR-20B-10492",
      creditLimit: 100000,
      outstandingBalance: 23375.0,
      totalOrders: 14,
      status: "ACTIVE",
    },
    {
      id: "sh-2",
      shopName: "Gupta Pharmacy & Clinic",
      ownerName: "Ramesh Gupta",
      phone: "+91 98321 45679",
      address: "A-22 Commercial Complex, City Centre, Durgapur-16",
      area: "City Centre",
      gstin: "19BBBDD5678E1Z9",
      drugLicense: "WB-BUR-20B-11883",
      creditLimit: 150000,
      outstandingBalance: 8617.25,
      totalOrders: 9,
      status: "ACTIVE",
    },
    {
      id: "sh-3",
      shopName: "Maa Tara Medical Hall",
      ownerName: "Subrata Roy",
      phone: "+91 98321 45680",
      address: "Sector 2B Market, Bidhannagar, Durgapur-12",
      area: "Bidhannagar",
      gstin: "19CCCEE9012F1Z1",
      drugLicense: "WB-BUR-20B-12994",
      creditLimit: 80000,
      outstandingBalance: 0.0,
      totalOrders: 21,
      status: "ACTIVE",
    },
  ]);

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
      status: "ACTIVE",
    };
    setShopkeepers([...shopkeepers, item]);
    setShowAddModal(false);
    alert(`Shop ${item.shopName} onboarded with credit limit ₹${item.creditLimit.toLocaleString("en-IN")}!`);
  };

  const filteredShops = shopkeepers.filter(
    (s) =>
      s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            B2B shopkeeper profiles, Drug License verification, credit limits, and purchase history
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="add-shopkeeper-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Register New Pharmacy Store
        </button>
      </div>

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
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>RETAIL STORES</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary-700)" }}>
            {shopkeepers.length} Shops
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Verified license holders</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>TOTAL CREDIT EXTENDED</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary-600)" }}>
            ₹{shopkeepers.reduce((acc, s) => acc + s.creditLimit, 0).toLocaleString("en-IN")}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>15-day wholesale terms</p>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>TOTAL OUTSTANDING</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-error)" }}>
            ₹{shopkeepers.reduce((acc, s) => acc + s.outstandingBalance, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Uncollected balances</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <input
          className="input"
          placeholder="Search by pharmacy name, proprietor, area (e.g. Benachity, City Centre)..."
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
                <th>Area</th>
                <th>Drug License / GSTIN</th>
                <th>Credit Limit</th>
                <th>Outstanding Due</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((s) => {
                const creditUsedPct = (s.outstandingBalance / s.creditLimit) * 100;
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--color-primary-800)" }}>{s.shopName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Prop. {s.ownerName} • {s.phone}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
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
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        GSTIN: <code>{s.gstin}</code>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{s.creditLimit.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: s.outstandingBalance > 0 ? "var(--color-error)" : "var(--color-success)" }}>
                        ₹{s.outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      {s.outstandingBalance > 0 && (
                        <div style={{ width: "100%", background: "#e2e8f0", height: "4px", borderRadius: "2px", marginTop: "4px" }}>
                          <div
                            style={{
                              width: `${Math.min(creditUsedPct, 100)}%`,
                              background: creditUsedPct > 80 ? "var(--color-error)" : "var(--color-warning)",
                              height: "100%",
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.totalOrders}</td>
                    <td>
                      <span className="badge badge-success">✓ Verified</span>
                    </td>
                    <td>
                      <Link
                        href="/dashboard/orders"
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        + Create Order
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
          <div className="card" style={{ maxWidth: "560px", width: "100%", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800 }}>
                🏪 Onboard New Retail Medical Store
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddShop} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Pharmacy Shop Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Life Care Medicos"
                    required
                    value={newShop.shopName}
                    onChange={(e) => setNewShop({ ...newShop, shopName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Owner / Pharmacist Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Anup Ghosh"
                    value={newShop.ownerName}
                    onChange={(e) => setNewShop({ ...newShop, ownerName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Phone Number</label>
                  <input
                    className="input"
                    placeholder="e.g. 9832198765"
                    required
                    value={newShop.phone}
                    onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Area / Hub</label>
                  <select
                    className="input"
                    value={newShop.area}
                    onChange={(e) => setNewShop({ ...newShop, area: e.target.value })}
                  >
                    <option value="Benachity">Benachity Market</option>
                    <option value="City Centre">City Centre</option>
                    <option value="Bidhannagar">Bidhannagar</option>
                    <option value="Mamra Bazar">Mamra Bazar</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Detailed Street Address</label>
                <input
                  className="input"
                  placeholder="e.g. Holding No 22, Link Road, Benachity, Durgapur-13"
                  value={newShop.address}
                  onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Drug License Number (20B/21B)</label>
                  <input
                    className="input"
                    placeholder="e.g. WB-BUR-20B-18290"
                    value={newShop.drugLicense}
                    onChange={(e) => setNewShop({ ...newShop, drugLicense: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>GSTIN (15 Digits)</label>
                  <input
                    className="input"
                    placeholder="e.g. 19AAAAA0000A1Z5"
                    value={newShop.gstin}
                    onChange={(e) => setNewShop({ ...newShop, gstin: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Approved Credit Limit (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={newShop.creditLimit}
                  onChange={(e) => setNewShop({ ...newShop, creditLimit: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Approve & Onboard Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
