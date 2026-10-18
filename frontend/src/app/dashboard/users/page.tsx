"use client";

import { useState } from "react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "WAREHOUSE" | "DELIVERY" | "SHOPKEEPER";
  status: "ACTIVE" | "INACTIVE";
  details: string;
}

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: "u1",
      name: "Super Admin",
      email: "thekoushikdurgas@gmail.com",
      phone: "+91 96140 81313",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      details: "Headquarters System Controller • Full Privileges",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SHOPKEEPER" as UserRecord["role"],
    details: "",
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.phone) {
      alert("Please provide Name and Phone number");
      return;
    }
    const record: UserRecord = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email || `${newUser.name.toLowerCase().replace(/\s+/g, "")}@pharmacyfantasy.com`,
      phone: newUser.phone,
      role: newUser.role,
      status: "ACTIVE",
      details: newUser.details || "Newly enrolled account",
    };
    setUsers([...users, record]);
    setShowAddModal(false);
    alert(`Account for ${record.name} (${record.role}) created successfully!`);
  };

  const getRoleBadge = (role: UserRecord["role"]) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="badge badge-error" style={{ fontSize: "0.75rem" }}>Super Admin</span>;
      case "ADMIN":
        return <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>Admin</span>;
      case "WAREHOUSE":
        return <span className="badge badge-warning" style={{ fontSize: "0.75rem" }}>Warehouse</span>;
      case "DELIVERY":
        return <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>Delivery Courier</span>;
      case "SHOPKEEPER":
        return <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>Retail Shopkeeper</span>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (roleFilter !== "ALL") {
      return matchSearch && u.role === roleFilter;
    }
    return matchSearch;
  });

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
            Role-Based Access Control (RBAC)
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Provision and manage Super Admins, Warehouse Dispatchers, Delivery Couriers, and Shopkeepers
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="add-user-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Team Member / Retailer
        </button>
      </div>

      {/* Role Counts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        {[
          { label: "Super Admins", count: users.filter((u) => u.role === "SUPER_ADMIN").length, color: "var(--color-error)" },
          { label: "Operations Admins", count: users.filter((u) => u.role === "ADMIN").length, color: "var(--color-primary-600)" },
          { label: "Warehouse Staff", count: users.filter((u) => u.role === "WAREHOUSE").length, color: "var(--color-warning)" },
          { label: "Delivery Boys", count: users.filter((u) => u.role === "DELIVERY").length, color: "var(--color-info)" },
          { label: "Registered Shops", count: users.filter((u) => u.role === "SHOPKEEPER").length, color: "var(--color-success)" },
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ padding: "var(--space-4)", borderLeft: `4px solid ${item.color}` }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{item.label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Search team members or shops by name, mobile, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: "250px" }}
          />
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: "220px" }}
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="ADMIN">Admins</option>
            <option value="WAREHOUSE">Warehouse Staff</option>
            <option value="DELIVERY">Delivery Fleet</option>
            <option value="SHOPKEEPER">Shopkeeper Retailers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Phone Number</th>
                <th>Assignment / Domain Context</th>
                <th>Status</th>
                <th>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {u.email}
                    </div>
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    <code style={{ fontSize: "0.8rem", fontWeight: 600 }}>{u.phone}</code>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {u.details}
                  </td>
                  <td>
                    <span className="badge badge-success">● Active</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => alert(`Reset password link dispatched to ${u.email}`)}
                    >
                      🔑 Reset Key
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
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
          <div className="card" style={{ maxWidth: "520px", width: "100%", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800 }}>
                👤 Enroll System User / Partner
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Full Legal Name</label>
                <input
                  className="input"
                  placeholder="e.g. Subir Karmakar"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Role Assignment</label>
                  <select
                    className="input"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  >
                    <option value="SHOPKEEPER">Retail Shopkeeper</option>
                    <option value="DELIVERY">Delivery Boy</option>
                    <option value="WAREHOUSE">Warehouse Staff</option>
                    <option value="ADMIN">Operations Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Mobile Number</label>
                  <input
                    className="input"
                    placeholder="e.g. 9832109876"
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. subir@karmakarmedicals.in"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Context Details (Shop Name, Vehicle #, DL #)</label>
                <input
                  className="input"
                  placeholder="e.g. Karmakar Medicals, Benachity, GSTIN: 19XX..."
                  value={newUser.details}
                  onChange={(e) => setNewUser({ ...newUser, details: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
