# 📋 Pharmacy Fantasy — Backend Engineering Backlog & TODO

> **Component Backlog:** Python / FastAPI / Strawberry GraphQL / SQLAlchemy

---

## 🚀 Priority 0: Service Layer Refactoring & Core Mutations

- [ ] **Extract `app/services/order_service.py`**:
  - [ ] Move order placement logic out of `resolvers/orders.py`.
  - [ ] Implement credit-limit pre-check.
  - [ ] Enforce atomic line-item tax calculation.
- [ ] **Extract `app/services/inventory_service.py`**:
  - [ ] Implement FEFO batch allocation algorithm (`allocate_batches_for_order`).
  - [ ] Add batch decrement and rollback mechanics on order cancellation.
- [ ] **Implement Missing Mutations**:
  - [ ] `cancelOrder(orderId: UUID!, reason: String)` — with inventory rollback.
  - [ ] `createPurchaseEntry(input: PurchaseEntryInput!)` — inbound distributor bills.
  - [ ] `recordPayment(orderId: UUID!, amount: Float!, method: PaymentMethod!)` — payment collection.
  - [ ] `updateStockBatch(batchId: UUID!, quantity: Int!, mrp: Float)` — warehouse batch adjustments.

---

## 📄 Priority 1: Invoicing & PDF Generation

- [ ] **Tax Invoice Template**:
  - [ ] Create HTML/CSS Jinja2 template in `app/templates/invoice.html` matching real WB pharma bills (MAA Eswari Pharmaceuticals).
  - [ ] Include HSN summary table with SGST/CGST tax breakout.
- [ ] **PDF Compilation Utility**:
  - [ ] Build `app/utils/invoice_gen.py` using `WeasyPrint` or `xhtml2pdf`.
  - [ ] Store compiled invoices in local static folder or S3/MinIO bucket.
  - [ ] Populate `Invoice.pdf_url` on order confirmation.

---

## 🧪 Priority 2: Automated Testing Suite

- [ ] **Order State Machine Tests (`tests/test_orders.py`)**:
  - [ ] Verify transition rules: cannot deliver a cancelled order; cannot pack an unconfirmed order.
  - [ ] Test inventory rollback when confirming then cancelling an order.
- [ ] **Authentication & Security Tests (`tests/test_auth.py`)**:
  - [ ] Verify JWT expiration, invalid token rejection, and password hash verification.
  - [ ] Test RBAC: shopkeepers cannot access `assignDelivery` or `confirmOrder`.
- [ ] **Concurrent Stock Allocation Tests**:
  - [ ] Simulate simultaneous orders on limited stock to verify no negative `quantity_available` occurs (using database row locking `with_for_update()`).

---

## ⚙️ Priority 3: Infrastructure, Background Workers & Redis

- [ ] **Redis Caching Integration**:
  - [ ] Cache product catalog queries with key `catalog:products:page_{p}` and automatic cache invalidation on batch/product updates.
- [ ] **Celery / ARQ Background Task Worker**:
  - [ ] Offload invoice PDF rendering to background worker.
  - [ ] Asynchronous SMS/WhatsApp order status notifications for shopkeepers.
- [ ] **Database Connection Pooling Tuning**:
  - [ ] Configure `pool_size=20`, `max_overflow=10`, `pool_pre_ping=True` in `app/db/session.py`.
