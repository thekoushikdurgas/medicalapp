# 📱 Page-by-Page Screen Inventory & UX Specifications

> **Pharmacy Fantasy — Complete Next.js App Router Screen Reference**

---

## 1. Public & Authentication Screens

### 1.1 `/` — Enterprise Landing Portal

- **Audience**: All visitors, prospective retail pharmacies, couriers, and staff.
- **Key Sections**:
  - Hero banner highlighting digital B2B pharmaceutical wholesale in West Bengal.
  - Quick Portal Selector: Direct links for Super Admin, Operations Admin, Warehouse, Delivery, and Retailers.
  - Interactive Feature Grid: FEFO compliance, GST statutory billing, zero stockouts, rapid courier delivery.
  - Live Theme Toggle & Security Assurance badges.

### 1.2 `/login` — Multi-Role Universal Authentication

- **Audience**: All 5 user roles.
- **Features**:
  - Single login input accepting either **Email address** (admins/warehouse) OR **Phone number** (retailers/couriers).
  - Password field with show/hide toggle.
  - Demo Quick-Login pills for rapid evaluation (`Super Admin`, `Operations Admin`, `Warehouse Staff`, `Delivery Boy`, `Retail Shopkeeper`).
  - Automatic redirect to `/dashboard` upon successful JWT issuance.

### 1.3 `/register` — Self-Service Onboarding

- **Audience**: Retail Shopkeepers & Delivery Boys.
- **Features**:
  - Role switcher tab: **🏪 Retail Shopkeeper** vs. **🛵 Delivery Boy**.
  - Retailer Fields: Shop Name, Counter Address, GSTIN, Drug License Number (Form 20B/21B), Area, City.
  - Delivery Fields: Full Name, Phone, Vehicle Type (Two-Wheeler, Van), Vehicle Plate Number, Assigned Beat.
  - Instant activation (no admin approval required; accounts are activated immediately).

### 1.4 `/forgot-password` — Credential Recovery

- **Features**:
  - Clean input for registered Email or Phone.
  - Dispatches temporary recovery instructions and displays support hotline for warehouse dispatch office.

---

## 2. Dashboard Workspace Screens

### 2.1 `/dashboard` — Executive & Operational Overview

- **Role Customization**:
  - **Super Admin & Operations Admin**: Daily sales turnover, pending orders, aggregate outstanding credit balance, low stock count.
  - **Warehouse Staff**: Floor overview, orders in picking queue, batches nearing expiry (< 30/60/90 days), bay dispatch ready count.
  - **Delivery Boy**: Summary of assigned trips, pending handovers, collected cash/UPI total.
  - **Retail Shopkeeper**: Active order progress, available credit headroom, recent invoices.
- **Components**:
  - Stat cards with percentage metrics.
  - Live order timeline showing status changes.
  - Quick action shortcuts (New Order, Inward Stock, New Product).

---

### 2.2 `/dashboard/products` — SKU Catalog Master

- **Primary Roles**: Warehouse Staff, Operations Admin, Super Admin (Full CRUD); Retail Shopkeeper (Browse & Order).
- **Features**:
  - Dual-axis scrollable table: Brand Name, Composition, Pack Size, HSN Code, Category, MRP, Selling Rate, Available Units, Status.
  - Live search bar (by medicine name or chemical salt) and Category multi-select filter.
  - **"Add Product SKU" SideDrawer**: Form with validation for Brand, Pack Form (`10S`, `15S`, `60ML`), HSN, and GST rates.

---

### 2.3 `/dashboard/inventory` — Warehouse Rack Batches & FEFO

- **Primary Roles**: Warehouse Staff, Operations Admin, Super Admin.
- **Features**:
  - Lot-level inventory table: Product, Batch Number, Expiry Date (MM/YY), Expiry Health Badge, Purchase Rate, Selling Rate, MRP, Units In Stock, Units Dispatched.
  - Expiry Health Color Coding:
    - 🔴 **Critical (< 30 days)**
    - 🟡 **Warning (< 60 days)**
    - 🔵 **Advisory (< 90 days)**
    - 🟢 **Healthy**
  - **"Inward Purchase Entry" SideDrawer**: Log incoming distributor bills (e.g. *MAA Medical Agency*), auto-incrementing rack stock.
  - Stock Adjustment Drawer: Write off damaged cartons or record physical audit reconciliation.

---

### 2.4 `/dashboard/orders` — Wholesale Orders & Picking Queue

- **Primary Roles**: Retail Shopkeeper (Place Order); Warehouse Staff & Admins (Fulfill & Dispatch).
- **Features**:
  - Segmented status tabs: **All**, **Placed (New)**, **Confirmed**, **Picking**, **Packed**, **Dispatched**, **Delivered**.
  - **Real-Time Warehouse Alert**: Placed orders appear instantly in the queue.
  - **Order Details SideDrawer**:
    - Itemized breakdown: Pack sizes, ordered quantities, allocated batches.
    - One-click **"Run FEFO Allocation"** button.
    - State transition triggers: `Confirm Order` ➔ `Start Picking` ➔ `Mark Packed` ➔ `Issue Delivery Challan`.
  - **"Place Wholesale Order" SideDrawer** (Shopkeeper):
    - Multi-line item picker, live calculation of trade discounts, SGST, CGST, and credit limit headroom check.

---

### 2.5 `/dashboard/deliveries` — Fleet Logistics & Signature POD

- **Primary Roles**: Delivery Boy (Execution); Operations Admin & Warehouse Staff (Assignment & Tracking).
- **Features**:
  - Active Delivery Cards: Shop Name, Address, Destination Map / Dial link, Carton Count, Bill Amount.
  - **Courier Workflow Controls**:
    - Tap **"Pick Up from Bay"** (`ASSIGNED` ➔ `PICKED_UP` ➔ `IN_TRANSIT`).
    - Tap **"Hand Over & Collect Signature"** to open the delivery completion drawer.
  - **Digital Signature Drawer**:
    - Interactive HTML5 drawing canvas for Retail Shopkeeper counter signature.
    - Camera capture button for physical shop stamp/receipt photo.
    - "Confirm Delivery" button that uploads POD to server and marks status `DELIVERED`.

---

### 2.6 `/dashboard/invoices` — Tax Invoices, Challans, Returns & Advances

- **Primary Roles**: Warehouse Staff, Operations Admin, Super Admin (Full Management); Retail Shopkeeper (View Own).
- **Multi-Tab Architecture**:
  - **Tab 1: Tax Invoices**:
    - Official GST bills (`INV-YYYYMMDD-XXXX`), taxable amounts, SGST, CGST, grand totals.
    - Modal/drawer to preview and print statutory printable HTML/PDF invoices.
  - **Tab 2: Delivery Challans**:
    - Dispatch notes (`DC-YYYYMMDD-XXXX`), carton counts, transporter name, vehicle number.
    - Action to create Delivery Challan from packed orders.
  - **Tab 3: Invoice Returns (Credit Notes)**:
    - View and issue sales returns (`CRN-YYYYMMDD-XXXX`).
    - Reverse GST calculations and credit retailer balances.
  - **Tab 4: Advance Payments**:
    - Log advance cash/UPI deposits from shopkeepers (`ADV-YYYYMMDD-XXXX`).
    - Live ledger summary of retailer credits.

---

### 2.7 `/dashboard/shopkeepers` — Pharmacy Directory & Credit Ceilings

- **Primary Roles**: Operations Admin, Super Admin, Warehouse Staff.
- **Features**:
  - Directory table: Shop Name, Owner Name, Contact Phone, Drug License No, GSTIN, Area, Credit Limit, Outstanding Balance, Payment Status.
  - Edit Drawer: Verify drug licenses, adjust credit limits, or flag accounts with overdue payments.

---

### 2.8 `/dashboard/users` — Staff RBAC & Role Governance

- **Primary Roles**: Super Admin (All Roles); Operations Admin (All Roles except Super Admin).
- **Features**:
  - User Directory: Full Name, Contact Info, Assigned Role Badge, Account Status (`Active`/`Deactivated`), Created Date.
  - **Role Filter**: Super Admin, Operations Admin, Warehouse Staff, Delivery Boy, Retail Shopkeeper.
  - **"Add User" Modal**:
    - Dynamically excludes `Super Admin` if the logged-in user is an Operations Admin.
    - Form creates user and associated profile (Shopkeeper or Delivery profile) in a single atomic transaction.
  - Quick Role Assignment dropdown on each row with real-time server mutation.

---

### 2.9 `/dashboard/reports` — Statutory Tax & Sales Analytics

- **Primary Roles**: Operations Admin, Super Admin.
- **Features**:
  - Sales performance charts (turnover over time, top selling medicines, top purchasing retail stores).
  - Stock Movement & Fast/Slow Moving Drugs report.
  - GSTR-1 Export preparation: B2B sales invoices, HSN summary, and credit notes breakdown.

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase PG.1: Camera Barcode Scanner & Rapid Picking

- [ ] **PG.1.1 Web Camera Barcode / QR Scanner**:
  - Embed HTML5 video barcode reader (`@zxing/library` or native Barcode Detection API) in the Inward Stock Drawer and Order Picking Drawer.
  - Allows warehouse staff to scan manufacturer carton barcodes to auto-populate product, batch number, and expiry date.
- [ ] **PG.1.2 Drag-and-Drop Order Kanban Board**:
  - Add a toggleable Kanban Board view on `/dashboard/orders` allowing floor managers to drag order cards across `Placed` ➔ `Confirmed` ➔ `Picking` ➔ `Packed` columns.

### 📋 Phase PG.2: Courier Navigation & Mapping

- [ ] **PG.2.1 Interactive Delivery Beat Map**:
  - Embed an interactive OpenStreetMap / Leaflet view on `/dashboard/deliveries` displaying pharmacy destination pins across Durgapur, Benachity, and City Centre.
  - Compute shortest multi-stop courier route from warehouse bay to all assigned pharmacy counters.

### 📋 Phase PG.3: Financial Ledger & CSV Ingestion

- [ ] **PG.3.1 Bulk Distributor Purchase Bill CSV Ingestion**:
  - Provide a drag-and-drop CSV / Excel uploader on `/dashboard/inventory` that automatically parses multi-page distributor purchase bills into structured `PurchaseEntry` records.
- [ ] **PG.3.2 Printable Retailer Statement of Accounts**:
  - On `/dashboard/shopkeepers`, add a one-click button to download a customer statement of accounts (PDF) showing all debits, credits, invoices, returns, and advance receipts for any custom date range.
