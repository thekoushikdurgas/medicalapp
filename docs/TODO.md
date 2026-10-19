# 📝 Master Implementation Checklist & Phased Roadmap

> **Pharmacy Fantasy — Detailed Phased Execution Plan & Verification Checkpoints**

---

## 🚦 Implementation Status Legend
- [ ] **Pending**: Ready for implementation.
- [🔄] **In Progress**: Currently active development.
- [x] **Completed**: Implemented, verified, and passing all tests.

---

## Phase 1: Role-Based Access Control (RBAC) & Authority Guards
> **Objective**: Restrict user creation and role assignment per strict hierarchy rules.

- [x] **1.1 Backend RBAC Mutation Guard**
  - **Files**: [`backend/app/graphql/resolvers/auth.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/graphql/resolvers/auth.py)
  - **Action**: In `assign_user_role` and `create_user`, extract caller identity from `info.context["request"]`.
  - **Rule**: If caller is `ADMIN` (Operations Admin), reject attempts to create or assign `SUPER_ADMIN` with a `403 PermissionDenied` error.
  - **Rule**: If caller is `WAREHOUSE`, `DELIVERY`, or `SHOPKEEPER`, reject user creation entirely.
  - **Verification**: Write pytest tests in `backend/tests/test_auth_rbac.py` testing unauthorized role creation.

- [x] **1.2 Frontend Navigation & Role Filtering**
  - **Files**: [`frontend/src/lib/auth.ts`](file:///e:/chanchal/pharmacyfantasy/frontend/src/lib/auth.ts), [`frontend/src/components/sidebar.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/components/sidebar.tsx)
  - **Action**: Grant `ADMIN` (Operations Admin) access to `/dashboard/users`.
  - **Action**: In [`frontend/src/app/dashboard/users/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/users/page.tsx), hide the `SUPER_ADMIN` option from the creation modal when logged in as an Operations Admin.
  - **Verification**: Run `cmd.exe /c "npm run build"` to verify zero type regressions.

---

## Phase 2: Database Schema & Relational Models
> **Objective**: Add data models for Delivery Challans, Challan Returns, Invoice Returns (Credit Notes), and Advance Payments.

- [x] **2.1 SQLAlchemy Declarative Models**
  - **Files**: [`backend/app/db/models.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/db/models.py)
  - **Entities to Add**:
    - `DeliveryChallan` (`id`, `order_id`, `challan_number`, `challan_date`, `transporter_name`, `vehicle_number`, `total_cartons`, `created_by`, `created_at`)
    - `ChallanItem` (`id`, `challan_id`, `product_id`, `stock_batch_id`, `quantity`, `free_quantity`)
    - `ChallanReturn` & `ChallanReturnItem` (`return_number`, `return_date`, `reason`, `processed_by`)
    - `InvoiceReturn` & `InvoiceReturnItem` (`credit_note_no`, `return_date`, `refund_subtotal`, `refund_sgst`, `refund_cgst`, `grand_refund`, `restock_status`)
    - `AdvancePayment` (`receipt_number`, `shopkeeper_id`, `amount`, `payment_method`, `reference_no`, `notes`, `recorded_by`, `paid_at`)
  - **Verification**: Models and relationships registered cleanly with cascade rules and indexed foreign keys.

---

## Phase 3: Service Layer & Business Logic Engines
> **Objective**: Implement clean, isolated service functions for warehouse logistics, GST tax math, and financial ledgers.

- [x] **3.1 Delivery Challan Service**
  - **Files**: `backend/app/services/challan_service.py`
  - **Functions**: `create_challan_for_order(order_id, transporter, vehicle)`, `process_challan_return(challan_id, return_items, reason)`.
  - **Logic**: Deducts or restores warehouse batch stock on challan dispatch/return.

- [x] **3.2 Invoice Return & Credit Note Service**
  - **Files**: `backend/app/services/return_service.py`
  - **Functions**: `create_invoice_return(invoice_id, return_items, restock_flag, reason)`.
  - **Logic**: Reverses GST amounts, decrements shopkeeper outstanding balance, and segregates restocked units into quarantine or active inventory.

- [x] **3.3 Advance Payment & Ledger Service**
  - **Files**: `backend/app/services/payment_service.py`
  - **Functions**: `record_advance_payment(shopkeeper_id, amount, method, ref_no)`.
  - **Logic**: Decrements `ShopkeeperProfile.outstanding_balance` and records audit entry.

- [x] **3.4 Unit Tests for Services**
  - **Files**: `backend/tests/test_logistics_services.py`
  - **Verification**: Run `uv run --with-requirements backend/requirements.txt pytest backend/tests` (23/23 tests passing).

---

## Phase 4: GraphQL Resolvers & Schema Exposure
> **Objective**: Expose all new domain capabilities via Strawberry GraphQL queries and mutations.

- [x] **4.1 GraphQL Types & Input Definitions**
  - **Files**: [`backend/app/graphql/types.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/graphql/types.py)
  - **Types**: `DeliveryChallanType`, `ChallanItemType`, `InvoiceReturnType`, `AdvancePaymentType`.
  - **Inputs**: `CreateChallanInput`, `ChallanReturnInput`, `InvoiceReturnInput`, `AdvancePaymentInput`.

- [x] **4.2 Resolvers & Root Schema Integration**
  - **Files**: `backend/app/graphql/resolvers/challan.py`, `backend/app/graphql/resolvers/returns.py`, [`backend/app/graphql/schema.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/graphql/schema.py)
  - **Mutations**:
    - `createDeliveryChallan`
    - `createChallanReturn`
    - `createInvoiceReturn`
    - `recordAdvancePayment`
  - **Queries**:
    - `deliveryChallans`, `deliveryChallan`
    - `invoiceReturns`
    - `advancePayments`
  - **Verification**: Successfully bound to Strawberry schema and tested with GraphQL queries.

---

## Phase 5: Warehouse Staff Frontend Modules
> **Objective**: Provide comprehensive floor controls for Invoices, Challans, Returns, and Advances.

- [x] **5.1 Multi-Tab Invoices & Documents Hub**
  - **Files**: [`frontend/src/app/dashboard/invoices/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/invoices/page.tsx)
  - **Tabs**:
    - 📄 **Tax Invoices** (Existing GST bills + printable view)
    - 🚚 **Delivery Challans** (List of challans with status & print option)
    - 🔄 **Invoice Returns (Credit Notes)** (List of credit notes & refund values)
    - 💰 **Advance Payments** (Deposit receipts and customer balances)

- [x] **5.2 Interactive SideDrawers for Warehouse Staff**
  - **Drawer 1**: *Create Delivery Challan* (Select packed order, assign transporter & vehicle).
  - **Drawer 2**: *Issue Invoice Return / Credit Note* (Select returned line items, enter reason, toggle restock).
  - **Drawer 3**: *Record Advance Payment* (Select retailer, enter amount, payment mode, reference number).

- [x] **5.3 Warehouse Staff Navigation Expansion**
  - **Files**: [`frontend/src/lib/auth.ts`](file:///e:/chanchal/pharmacyfantasy/frontend/src/lib/auth.ts), [`frontend/src/components/sidebar.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/components/sidebar.tsx)
  - **Action**: Added direct sidebar links for Warehouse Staff: `Invoices & Challans`, `Stock Batches`, `Picking Queue`.

---

## Phase 6: Retail Shopkeeper Catalog & Instant Order Flow
> **Objective**: Streamline the ordering experience and guarantee instantaneous warehouse queue synchronization.

- [x] **6.1 Catalog Ordering Experience**
  - **Files**: [`frontend/src/app/dashboard/products/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/products/page.tsx), [`frontend/src/app/dashboard/orders/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/orders/page.tsx)
  - **Action**: Shopkeepers can inspect and add items directly to a wholesale cart showing rates, trade discounts, and GST.
  - **Action**: Live credit limit validation before submission with over-credit warnings.

- [x] **6.2 Real-Time Warehouse Queue Notification**
  - **Files**: [`frontend/src/app/dashboard/orders/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/orders/page.tsx)
  - **Action**: Automatically badge new orders in `PLACED` status with `⚡ New (Picking Queue)` for immediate picking by warehouse floor staff.

---

## Phase 7: Delivery Boy Mobile Experience & Digital Signature POD
> **Objective**: Enable couriers to view assigned orders, accept bay pickup, and upload retail counter signatures.

- [x] **7.1 Live Courier Trips Feed**
  - **Files**: [`frontend/src/app/dashboard/deliveries/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/deliveries/page.tsx)
  - **Action**: Connect real Apollo query `myDeliveries` for the authenticated Delivery Boy.
  - **Action**: Add pickup and in-transit status buttons (`ASSIGNED` ➔ `PICKED_UP` ➔ `IN_TRANSIT`).

- [x] **7.2 HTML5 Digital Signature Pad & POD Upload**
  - **Files**: `frontend/src/components/ui/signature-pad.tsx`, [`frontend/src/app/dashboard/deliveries/page.tsx`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/dashboard/deliveries/page.tsx)
  - **Action**: Render interactive touch/mouse canvas capturing the shopkeeper's signature.
  - **Action**: Submit signature data to `updateDeliveryStatus` mutation, closing order as `DELIVERED`.

---

## Phase 8: Verification, Test Coverage & EC2 Deployment
> **Objective**: Validate the entire ecosystem with automated tests and deploy to production.

- [x] **8.1 Backend Test Suite Verification**
  - Run: `uv run --with-requirements backend/requirements.txt pytest backend/tests`
  - Target: 100% test pass rate across GST math, FEFO allocation, returns, and RBAC guards (23 passed).

- [x] **8.2 Frontend Production Compilation Verification**
  - Run: `cmd.exe /c "npm run build"`
  - Target: Zero TypeScript errors, all 16 static routes successfully generated.

- [ ] **8.3 EC2 Deployment Staging**
  - Execute clean git sync on server, run migrations, seed data, and verify health checks.

- [ ] **8.3 EC2 Deployment Staging**
  - Execute clean git sync on server, run migrations, seed data, and verify health checks.

---

## 🔮 Advanced Future Works & Next-Gen Phases (Phases 9 - 14)
> **Objective**: Strategic enterprise scaling, government integrations, hardware connectivity, and high availability.

### Phase 9: Statutory Government & Tax Integrations
- [ ] **9.1 National E-Way Bill API Connectivity**: Automated generation of NIC E-Way bills for dispatches over ₹50,000.
- [ ] **9.2 Drug & Cosmetics Act Schedule H1 Register**: Statutory compliance logs for antibiotic & narcotic formulations.
- [ ] **9.3 Tally Prime & Busy Accounting Synchronization**: Direct export of XML/JSON vouchers for external chartered accountants.

### Phase 10: Real-Time WebSockets & Streaming Architecture
- [ ] **10.1 Strawberry GraphQL Subscriptions**: Redis Pub/Sub powered live order broadcasts directly to warehouse terminal displays.
- [ ] **10.2 Live GPS Courier Fleet Tracking**: Real-time vehicle location streaming for delivery boys on route to pharmacies.
- [ ] **10.3 Instant Audio Alerts**: Web Audio API chime sounding on the warehouse floor upon new order placement.

### Phase 11: Warehouse Hardware & Edge Automation
- [ ] **11.1 Web Bluetooth Portable Thermal Printing**: Direct 2-inch and 3-inch slip/challan printing without OS print dialogues.
- [ ] **11.2 Camera Barcode & QR Scanner**: Real-time carton barcode decoding via `@zxing/library` during inward receiving and order picking.
- [ ] **11.3 Drag-and-Drop Floor Kanban**: Interactive visual board on `/dashboard/orders` for warehouse dispatch bay managers.

### Phase 12: Offline-First Courier Mobility
- [ ] **12.1 Progressive Web App (PWA) with Background Sync**: Offline route access and signature capture in subterranean pharmacy counters.
- [ ] **12.2 Native OS Push Notifications**: Immediate alerts on delivery assignments and dispatch schedule updates.

### Phase 13: High-Concurrency Data & Partitioning
- [ ] **13.1 PostgreSQL Annual Partitioning**: Declarative range partitioning of `orders` and `invoices` by Indian Financial Year (`FY26-27`).
- [ ] **13.2 Distributed Redis Mutex Locking (Redlock)**: Race condition prevention on rapid concurrent orders claiming identical medicine batches.
- [ ] **13.3 Read-Only Analytical Replicas & PgBouncer**: Dedicated query routing for reports to preserve primary OLTP transaction throughput.

### Phase 14: Omnichannel Customer Engagement
- [ ] **14.1 WhatsApp Business Transactional API**: Order confirmations, dispatch ETAs, and PDF tax invoices delivered directly via WhatsApp.
- [ ] **14.2 Dynamic Counter UPI QR Codes**: Printable BharatQR codes on Delivery Challans for instant digital bank settlement at delivery.
- [ ] **14.3 Bilingual Regionalization**: Full Bengali (বাংলা) and English UI toggling for retail chemists and logistics staff.

