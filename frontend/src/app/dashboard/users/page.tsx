"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  USERS_QUERY,
  ASSIGN_USER_ROLE_MUTATION,
  CREATE_USER_MUTATION,
} from "@/lib/graphql-queries";

interface UserItem {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "WAREHOUSE" | "DELIVERY" | "SHOPKEEPER";
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(USERS_QUERY, {
    variables: { role: roleFilter === "ALL" ? null : roleFilter },
    fetchPolicy: "network-only",
  });

  const [assignRoleMutation] = useMutation(ASSIGN_USER_ROLE_MUTATION, {
    errorPolicy: "all",
  });

  const [createUserMutation] = useMutation(CREATE_USER_MUTATION, {
    errorPolicy: "all",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    email: "",
    password: "admin123",
    role: "ADMIN" as UserItem["role"],
    shopName: "",
    vehicleType: "Two-Wheeler",
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setAssigningId(userId);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await assignRoleMutation({
        variables: { userId, newRole },
      });

      if (res.errors && res.errors.length > 0) {
        setActionError(res.errors[0].message);
      } else {
        setActionSuccess(`User role successfully updated to ${newRole}`);
        refetch();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to assign role.");
    } finally {
      setAssigningId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccess("");
    setActionError("");

    if (!newUser.name.trim() || !newUser.phone.trim()) {
      alert("Please provide Name and Phone number");
      return;
    }

    try {
      const input = {
        fullName: newUser.name.trim(),
        phone: newUser.phone.trim(),
        email: newUser.email.trim() || null,
        password: newUser.password,
        role: newUser.role,
        shopName: newUser.shopName.trim() || null,
        vehicleType: newUser.vehicleType,
      };

      const res = await createUserMutation({ variables: { input } });
      if (res.errors && res.errors.length > 0) {
        setActionError(res.errors[0].message);
      } else {
        setActionSuccess(`Account for ${newUser.name} (${newUser.role}) created successfully!`);
        setShowAddModal(false);
        setNewUser({
          name: "",
          phone: "",
          email: "",
          password: "admin123",
          role: "ADMIN",
          shopName: "",
          vehicleType: "Two-Wheeler",
        });
        refetch();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to create user account.");
    }
  };

  const users: UserItem[] = data?.users || [];

  const getRoleBadge = (role: UserItem["role"]) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="badge badge-error" style={{ fontSize: "0.75rem" }}>👑 Super Admin</span>;
      case "ADMIN":
        return <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>🛡️ Operations Admin</span>;
      case "WAREHOUSE":
        return <span className="badge badge-warning" style={{ fontSize: "0.75rem" }}>📦 Warehouse Staff</span>;
      case "DELIVERY":
        return <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>🛵 Delivery Boy</span>;
      case "SHOPKEEPER":
        return <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>🏪 Retail Shopkeeper</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
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
            Super Admin Role Management: Assign any user to <strong>👑 Super Admin</strong>, <strong>🛡️ Operations Admin</strong>, or <strong>📦 Warehouse Staff</strong>
          </p>
        </div>
        <button
          className="btn btn-primary"
          id="add-user-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Provision Operations Staff / Admin
        </button>
      </div>

      {actionSuccess && (
        <div style={{
          padding: "var(--space-3) var(--space-4)",
          background: "rgba(16, 185, 129, 0.12)",
          color: "var(--color-primary-800)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
          fontWeight: 600,
          fontSize: "0.85rem",
        }}>
          ✅ {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{
          padding: "var(--space-3) var(--space-4)",
          background: "rgba(239, 68, 68, 0.12)",
          color: "var(--color-error)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
          fontWeight: 600,
          fontSize: "0.85rem",
        }}>
          ⚠️ {actionError}
        </div>
      )}

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
          { label: "👑 Super Admins", count: users.filter((u) => u.role === "SUPER_ADMIN").length, color: "var(--color-error)" },
          { label: "🛡️ Operations Admins", count: users.filter((u) => u.role === "ADMIN").length, color: "var(--color-primary-600)" },
          { label: "📦 Warehouse Staff", count: users.filter((u) => u.role === "WAREHOUSE").length, color: "var(--color-warning)" },
          { label: "🛵 Delivery Boys", count: users.filter((u) => u.role === "DELIVERY").length, color: "var(--color-info)" },
          { label: "🏪 Retail Shopkeepers", count: users.filter((u) => u.role === "SHOPKEEPER").length, color: "var(--color-success)" },
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
            placeholder="Search by name, mobile phone, or email..."
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
            <option value="ALL">All Roles ({users.length})</option>
            <option value="SUPER_ADMIN">👑 Super Admins</option>
            <option value="ADMIN">🛡️ Operations Admins</option>
            <option value="WAREHOUSE">📦 Warehouse Staff</option>
            <option value="DELIVERY">🛵 Delivery Boys</option>
            <option value="SHOPKEEPER">🏪 Retail Shopkeepers</option>
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
                <th>Current Role</th>
                <th>Contact Phone</th>
                <th>Status</th>
                <th>Super Admin Role Assignment</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                    Loading active users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {u.email || "No email linked"}
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <code style={{ fontSize: "0.8rem", fontWeight: 600 }}>{u.phone || "—"}</code>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-success" : "badge-error"}`}>
                        {u.isActive ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <select
                          className="input"
                          style={{
                            padding: "0.3rem 0.5rem",
                            fontSize: "0.75rem",
                            height: "auto",
                            width: "195px",
                            fontWeight: 600,
                          }}
                          value={u.role}
                          disabled={assigningId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="SUPER_ADMIN">👑 Super Admin</option>
                          <option value="ADMIN">🛡️ Operations Admin</option>
                          <option value="WAREHOUSE">📦 Warehouse Staff</option>
                          <option value="DELIVERY">🛵 Delivery Boy</option>
                          <option value="SHOPKEEPER">🏪 Retail Shopkeeper</option>
                        </select>
                        {assigningId === u.id && (
                          <span style={{ fontSize: "0.75rem", color: "var(--color-primary-600)" }}>
                            Saving...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                👤 Provision Internal Staff or Partner
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
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Full Legal Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Subir Ghosh"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Role Assignment *</label>
                  <select
                    className="input"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  >
                    <option value="SUPER_ADMIN">👑 Super Admin</option>
                    <option value="ADMIN">🛡️ Operations Admin</option>
                    <option value="WAREHOUSE">📦 Warehouse Staff</option>
                    <option value="DELIVERY">🛵 Delivery Boy</option>
                    <option value="SHOPKEEPER">🏪 Retail Shopkeeper</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Mobile Phone Number *</label>
                  <input
                    className="input"
                    placeholder="e.g. 9832109876"
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Email Address (optional)</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="e.g. staff@pharmacyfantasy.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Initial Password *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Min 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {newUser.role === "SHOPKEEPER" && (
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Pharmacy Shop Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Ghosh Medical Stores"
                    value={newUser.shopName}
                    onChange={(e) => setNewUser({ ...newUser, shopName: e.target.value })}
                  />
                </div>
              )}

              {newUser.role === "DELIVERY" && (
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Vehicle Type</label>
                  <select
                    className="input"
                    value={newUser.vehicleType}
                    onChange={(e) => setNewUser({ ...newUser, vehicleType: e.target.value })}
                  >
                    <option value="Two-Wheeler">Bike / Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Van">Small Delivery Van</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign &amp; Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
