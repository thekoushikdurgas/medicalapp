# 📋 Pharmacy Fantasy — Master Engineering Roadmap & Backlog

> **System Status:** MVP Core Functional · Target: Enterprise Production Readiness  
> *Tracking:* Priority Tasks, Gap Analysis & Milestone Delivery

---

## 🎯 Current Milestone: Phase 1 — Production Hardening & Core Loop

| Milestone | Target Horizon | Status | Description |
| :--- | :--- | :--- | :--- |
| **Phase 0: Architecture & Foundation** | Completed | ✅ Done | Schema design, models, Strawberry GraphQL setup, Next.js dashboard shell. |
| **Phase 1: Operational Core** | In Progress | 🟡 70% | End-to-end order placement, batch allocation, delivery dispatch, invoice generation. |
| **Phase 2: Service Layer & Testing** | Planned | ⚪ 15% | Service abstraction in backend, test suite expansion, GST compliance verification. |
| **Phase 3: Real-Time & PWA** | Planned | ⚪ 0% | WebSocket subscriptions, delivery boy mobile PWA view, offline caching. |

---

## 🚀 Priority 0: Critical Path & MVP Hardening (Current Sprint)

- [x] **Relational Schema**: 11 core tables modeled in SQLAlchemy 2.0 (`User`, `Product`, `StockBatch`, `Order`, `OrderItem`, `Invoice`, `DeliveryAssignment`, `Payment`, `PurchaseEntry`, `PurchaseItem`).
- [x] **Alembic Migrations**: Initial migration established and seeded with superadmin and realistic pharmaceutical data.
- [x] **GraphQL Core Resolvers**: Auth, Products, Orders, and Deliveries basic queries and mutations implemented.
- [x] **Frontend Dashboard Shell**: Next.js App Router layout with role-based sidebar and overview metrics.
- [ ] **Backend Service Layer Extraction**: Refactor business logic out of `app/graphql/resolvers/` into dedicated modules inside `app/services/` (`order_service.py`, `inventory_service.py`, `invoice_service.py`).
- [ ] **FEFO Batch Auto-Allocation**: When confirming an order, automatically pick the nearest expiring non-expired batch with available quantity (`quantity_available >= requested`).
- [ ] **Real PDF Invoice Generation**: Implement WeasyPrint or ReportLab service in `app/utils/invoice_gen.py` to produce printable GST invoices matching the MAA Eswari Pharmaceuticals bill layout.

---

## 📦 Priority 1: Wholesale Operations & Inventory Features

- [ ] **Inbound Purchase Entry Workflow**:
  - [ ] Add GraphQL mutations for recording incoming stock from pharmaceutical distributors (`createPurchaseEntry`).
  - [ ] Auto-create new `StockBatch` records and increment available inventory upon purchase confirmation.
- [ ] **Shopkeeper Credit Limit Guard**:
  - [ ] Check `ShopkeeperProfile.outstanding_balance + order.net_amount <= credit_limit` before allowing order placement in `PLACED` state.
- [ ] **Batch Expiry & Alert Dashboard**:
  - [ ] Dedicated view highlighting batches expiring in 30, 60, and 90 days.
  - [ ] Warning flag preventing warehouse staff from dispatching medicine with less than 60 days shelf life without explicit override.
- [ ] **Payment Recording & Ledger**:
  - [ ] GraphQL mutation to record cash/UPI/cheque collections by delivery boy or admin.
  - [ ] Deduct payment amount from shopkeeper's outstanding balance with audit log.

---

## 🧪 Priority 2: Quality Assurance, Security & DevOps

- [ ] **Test Suite Expansion**:
  - [x] GST math test in `backend/tests/test_gst.py`.
  - [ ] Unit tests for Order state transitions (`DRAFT` $\to$ `PLACED` $\to$ `CONFIRMED` $\to$ `PACKED` $\to$ `DISPATCHED` $\to$ `DELIVERED`).
  - [ ] Auth & RBAC access tests ensuring shopkeepers cannot access warehouse mutations.
  - [ ] Integration test verifying batch decrement and concurrent order reservation.
- [ ] **Frontend Component Decoupling**:
  - [ ] Extract duplicated UI elements into reusable components: `DataTable`, `StatusBadge`, `ModalDialog`, `StatCard`, `QuantityInput`.
  - [ ] Set up GraphQL Code Generator (`@graphql-codegen/cli`) to produce auto-typed Apollo hooks from Strawberry schema.
- [ ] **CI/CD Pipeline**:
  - [ ] GitHub Actions workflow for linting (`ruff`, `eslint`), typechecking (`mypy`, `tsc`), and test runs on pull requests.
  - [ ] Multi-stage production Dockerfiles with non-root user execution.

---

## 📱 Priority 3: Mobile Experience & Real-time Logistics

- [ ] **Delivery Boy Mobile View**:
  - [ ] Responsive mobile interface for delivery personnel with route list, phone dialer integration, and camera capture for Proof of Delivery (POD).
- [ ] **GraphQL Subscriptions**:
  - [ ] WebSockets via Redis Pub/Sub for real-time order status updates on warehouse and admin screens.
- [ ] **Daily Closing & Reconciliation Reports**:
  - [ ] End-of-day sales, GST collected (SGST/CGST breakdown), cash collected by delivery boys, and inventory valuation export (CSV/Excel).
