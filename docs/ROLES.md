# 🔐 Roles & Permissions Architecture (RBAC)

> **Pharmacy Fantasy — Role-Based Access Control, Hierarchy & Operational Matrix**

---

## 1. Role Hierarchy

```
👑 Super Admin (SUPER_ADMIN)
    │   └── Full Global Governance & Role Assignment
    │
    └── 🛡️ Operations Admin (ADMIN)
            │   └── Operational Management (Can create/assign all roles EXCEPT Super Admin)
            │
            ├── 📦 Warehouse Staff (WAREHOUSE)
            │       └── Stock, Batches, Orders, Invoices, Challans, Returns & Advance Receipts
            │
            ├── 🛵 Delivery Boy (DELIVERY)
            │       └── Order Pickup, Route Deliveries, Physical/Digital Signature & POD Upload
            │
            └── 🏪 Retail Shopkeeper (SHOPKEEPER)
                    └── Catalog Ordering, Invoice History, Payment Records & Credit Ledger
```

---

## 2. Role Profiles & Personas

### 👑 1. Super Admin (`SUPER_ADMIN`)
- **Authority**: Highest-level administrative account.
- **Role Assignment**: Can assign and create **all user types of roles** (`SUPER_ADMIN`, `ADMIN`, `WAREHOUSE`, `DELIVERY`, `SHOPKEEPER`).
- **Core Scope**:
  - Global system settings and database maintenance.
  - Creation and governance of Operations Admins.
  - Financial, audit, and tax oversight across the entire distribution network.
  - Full override privileges for credit ceilings and disputed deliveries.

### 🛡️ 2. Operations Admin (`ADMIN`)
- **Authority**: Day-to-day administrative supervisor of warehouse logistics and retail trade.
- **Role Assignment**: Can create and assign **all user types of roles EXCEPT Super Admin**.
  - Attempting to create or assign a user with `SUPER_ADMIN` returns a strict `403 Forbidden` error.
- **Core Scope**:
  - Onboard and manage Warehouse Staff, Delivery Boys, and Retail Shopkeepers.
  - Approve or adjust credit limits and verify shopkeeper Drug Licenses and GSTIN certificates.
  - Assign delivery personnel to dispatch runs.
  - Review sales analytics, payment collections, and stock movement reports.

### 📦 3. Warehouse Staff (`WAREHOUSE`)
- **Authority**: Warehouse floor operations manager located at Benachity Central Warehouse.
- **Role Assignment**: None.
- **Core Scope**:
  - **Stock & Inventory**: Inward supplier stock entry (distributor purchase bills), physical stock audits, stock adjustments (breakage, expiry discard).
  - **Product SKU Master**: Create new pharmaceutical products in the catalog (Brand Name, Composition, Pack Size, HSN Code, GST rates).
  - **Stock Batches**: Manage lot numbers, expiry dates (MM/YY), purchase rates, selling rates, and FEFO priorities.
  - **Order Processing**: View real-time orders placed by Retail Shopkeepers (`PLACED`), trigger FEFO batch allocation, pick items, and pack cartons (`PICKING` ➔ `PACKED`).
  - **Invoices**: Generate, manage, print, and download statutory GST Tax Invoices.
  - **Delivery Challan**: Create and manage Delivery Challans accompanying shipments.
  - **Challan Return**: Process goods rejected at warehouse bay or during dispatch before invoice finalization.
  - **Invoice Return (Credit Note)**: Process returned goods post-invoicing (breakage, expiry, returns), calculate GST reversals, restock valid items, and credit retailer balance.
  - **Advance Payments**: Record advance cash/cheque/UPI deposits received from shopkeepers.

### 🛵 4. Delivery Boy (`DELIVERY`)
- **Authority**: Field courier and logistics runner handling two-wheeler or van delivery trips.
- **Role Assignment**: None (Self-service registration with phone/vehicle details).
- **Core Scope**:
  - View assigned deliveries and delivery routes on mobile.
  - Collect packed medicine cartons from the warehouse bay (`ASSIGNED` ➔ `PICKED_UP` ➔ `IN_TRANSIT`).
  - Travel to destination retail pharmacies.
  - Obtain the physical stamp or digital signature of the Retail Shopkeeper on the delivery screen.
  - Upload the signed Proof of Delivery (POD) photo/signature data to the server to mark the delivery `DELIVERED`.
  - Collect on-spot cash or UPI payments and hand over to warehouse cashier.

### 🏪 5. Retail Shopkeeper (`SHOPKEEPER`)
- **Authority**: Commercial pharmacy owner / retailer (e.g., Cheap Medical Stores, Gupta Pharmacy).
- **Role Assignment**: Self-service registration (Instant access via mobile phone + shop name).
- **Core Scope**:
  - Browse wholesale drug catalog with live trade pricing, pack sizes, and scheme discounts.
  - Place clean wholesale orders within their approved credit limit.
  - Placed orders appear immediately in real-time on the Warehouse Staff's picking screen.
  - Track order progression (`PLACED` ➔ `CONFIRMED` ➔ `PACKED` ➔ `DISPATCHED` ➔ `DELIVERED`).
  - Review invoice history, view ledger balances, and download PDF invoices.

---

## 3. Comprehensive Permission Matrix

| Capability / Module | Super Admin | Operations Admin | Warehouse Staff | Delivery Boy | Retail Shopkeeper |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **User & Role Management** | | | | | |
| Create Super Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Operations Admin | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Warehouse Staff | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Delivery Boy | ✅ | ✅ | ❌ | ❌ | ❌ |
| Register / Onboard Shopkeeper | ✅ | ✅ | ❌ | ❌ | Self-Service |
| Assign / Change Roles | All Roles | All Except Super Admin | ❌ | ❌ | ❌ |
| Deactivate / Reactivate User | ✅ | ✅ (Non-Super Admin) | ❌ | ❌ | ❌ |
| **Product Master & Catalog** | | | | | |
| Create New Product SKU | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Product Details / HSN / Tax | ✅ | ✅ | ✅ | ❌ | ❌ |
| Browse Product Catalog | ✅ | ✅ | ✅ | ❌ | ✅ |
| View Trade Rates & Schemes | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Inventory & Stock Batches** | | | | | |
| Inward Purchase Entry (Supplier) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add / Edit Stock Batches | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Live Stock Quantities | ✅ | ✅ | ✅ (Exact Units) | ❌ | ✅ (In-Stock Flag) |
| Physical Stock Adjustments | ✅ | ✅ | ✅ | ❌ | ❌ |
| Expiry & FEFO Early Warning View | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Wholesale Orders** | | | | | |
| Place Wholesale Order | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Real-Time Placed Orders Queue | ✅ | ✅ | ✅ | ❌ | Own Orders |
| Confirm Order & FEFO Batch Allocation | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Picking / Packing Status | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel Order | ✅ | ✅ | ✅ (Pre-Dispatch) | ❌ | ✅ (Pre-Confirmation) |
| **Delivery Challan & Dispatch** | | | | | |
| Create Delivery Challan | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage / Print Delivery Challan | ✅ | ✅ | ✅ | ✅ (Assigned) | ✅ (Own Delivery) |
| Process Challan Return (Pre-Invoice) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Delivery Boy to Order | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Courier & POD Delivery** | | | | | |
| Check Assigned Orders Queue | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mark Pickup from Warehouse | ✅ | ✅ | ✅ | ✅ | ❌ |
| Collect Shopkeeper Signature | ❌ | ❌ | ❌ | ✅ | ✅ (Signs at Counter) |
| Upload Signed POD to Server | ✅ | ✅ | ❌ | ✅ | ❌ |
| Update Delivery Status (Delivered/Failed)| ✅ | ✅ | ❌ | ✅ | ❌ |
| **Tax Invoices & Credit Notes** | | | | | |
| Generate Statutory GST Invoice | ✅ | ✅ | ✅ | ❌ | ❌ |
| View All Invoices | ✅ | ✅ | ✅ | ❌ | Own Invoices |
| Download Invoice PDF / Print | ✅ | ✅ | ✅ | ✅ (Assigned) | ✅ (Own) |
| Create Invoice Return (Credit Note) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Invoice Returns & Restocking | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Payments & Advances** | | | | | |
| Record Advance Payment Receipt | ✅ | ✅ | ✅ | ❌ | ❌ |
| Record Delivery Cash/UPI Collection | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Shopkeeper Outstanding Ledger | ✅ | ✅ | ✅ | ❌ | Own Ledger |
| Override Credit Limit Ceiling | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reports & Analytics** | | | | | |
| Sales & Financial Summaries | ✅ | ✅ | ❌ | ❌ | ❌ |
| Warehouse Stock Movement Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| GSTR-1 & Statutory Tax Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| System Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 4. Security & Server-Side Enforcement Rules

1. **Context-Aware Authentication**:
   - Every GraphQL resolver inspects the validated JWT `sub` and `role` claims in `info.context["request"]`.
2. **Operations Admin Ceiling Rule**:
   - If a caller has `role == "ADMIN"`, any mutation attempting `role = "SUPER_ADMIN"` or targeting a `SUPER_ADMIN` user record must abort immediately:
     ```python
     if caller.role == UserRole.ADMIN and target_role == UserRole.SUPER_ADMIN:
         raise PermissionError("Operations Admin is strictly prohibited from creating or modifying Super Admin accounts.")
     ```
3. **Warehouse Operational Autonomy**:
   - Warehouse Staff have complete autonomous CRUD permissions on inventory, orders, invoices, challans, returns, and advances without requiring admin escalation.
4. **Delivery Signature Integrity**:
   - An order cannot transition to `DELIVERED` status unless a non-null `proof_image_url` or digital signature vector is provided and validated.
5. **Shopkeeper Credit Limit Guard**:
   - Order placement fails immediately if `shopkeeper.outstanding_balance + order.net_amount > shopkeeper.credit_limit`.

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase R.1: Security Hardening & Session Revocation
- [ ] **R.1.1 Immutable Role Audit Logging**:
  - Implement a dedicated `role_audit_logs` table tracking every role assignment, user creation, or permission change.
  - Store `actor_id`, `target_user_id`, `old_role`, `new_role`, `ip_address`, and `user_agent`.
- [ ] **R.1.2 Instant Session Invalidation**:
  - When an Operations Admin or Super Admin changes a user's role or marks them inactive, publish a Redis event to blacklist all active JWT refresh/access tokens for that user immediately.
- [ ] **R.1.3 Two-Factor Authentication (2FA / TOTP)**:
  - Add optional or mandatory TOTP (Google Authenticator / Authy) for `SUPER_ADMIN` and `ADMIN` accounts to prevent unauthorized access to sensitive financial and drug registers.

### 📋 Phase R.2: Granular Role Scoping & Multi-Warehouse Support
- [ ] **R.2.1 Sub-Role Scoping for Warehouse Staff**:
  - Introduce sub-permissions for warehouse floor staff (e.g., `PICKER` who can only view picking lists vs. `DISPATCH_MANAGER` who can finalize invoices and challans).
- [ ] **R.2.2 Multi-Warehouse / Multi-Branch Scoping**:
  - Support multi-depot pharmaceutical operations (e.g., Durgapur Central Warehouse, Asansol Depot, Raniganj Bay).
  - Scope Warehouse Staff and Delivery Boys to specific warehouse facilities (`warehouse_id`).
- [ ] **R.2.3 Temporary Role Delegation (Holiday Mode)**:
  - Allow an Operations Admin to grant temporary delegation to a Senior Warehouse Staff member with an automatic expiration timestamp.