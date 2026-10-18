# 📋 Pharmacy Fantasy — Project Specification

## 1. Business Context

**Pharmacy Fantasy** digitizes the pharmaceutical distribution chain operating in West Bengal, India. The business flow is:

```
Pharma Companies / Distributors (e.g., MAA Medical Agency)
        │
        ▼  (Purchase invoices — GST bills with batch, expiry, HSN)
   ┌─────────────────────────────────────────┐
   │  WAREHOUSE — MAA Eswari Pharmaceuticals │
   │  Benachity, Durgapur-13                 │
   │  GSTIN: 19BKMPG6092H1ZO                │
   └─────────────────────┬───────────────────┘
                         │
                         ▼  (Sale invoices — with discounts, free goods, GST)
                ┌────────────────────┐
                │  RETAIL SHOPKEEPERS │
                │  (Cheap Medical     │
                │   Stores, etc.)     │
                └────────────────────┘
```

### Key Invoice Fields (from real bills)

| Field       | Example                | Purpose                          |
|-------------|------------------------|----------------------------------|
| Product     | AZITHRAL 500MG TAB     | Medicine name + strength         |
| Pack        | 10S, 30CAP, 60ML      | Pack size and form               |
| Batch       | 2613000703             | Manufacturer batch number        |
| Expiry      | 12/28, 6/28            | Month/Year expiry                |
| HSN         | 30041090, 30049069     | GST classification code          |
| Qty         | 36, 60, 20             | Ordered quantity (in packs)      |
| Free        | 0.00, 0.50, 1.00       | Free goods (promotional scheme)  |
| MRP         | ₹126.73, ₹92.42       | Maximum retail price per pack    |
| Rate        | ₹96.56, ₹70.42        | Selling rate to shopkeeper       |
| DIS1%       | 12.00, 14.00, 13.00   | Primary discount percentage      |
| DIS2%       | 0.00                   | Secondary discount percentage    |
| SGST        | 2.50%                  | State GST                        |
| CGST        | 2.50%                  | Central GST                      |
| Amount      | ₹3476.16, ₹880.10     | Line total after discounts + GST |

### Invoice Totals

| Component      | Bill A004448   | Bill A000538   |
|----------------|----------------|----------------|
| MRP Value      | ₹33,639.74     | ₹11,710.40     |
| Value of Goods | ₹25,631.63     | ₹8,894.75      |
| Discount       | ₹3,369.57      | ₹667.12        |
| GST (SGST+CGST)| ₹1,113.12     | ₹389.62        |
| Invoice Value  | ₹23,375.00     | ₹8,617.25      |

---

## 2. Core Modules

### 2.1 Authentication & Authorization

- JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC) with 5 roles
- Phone number + OTP login for shopkeepers and delivery boys
- Email + password login for admin roles
- Session management with Redis

### 2.2 User Management

- Super Admin creates Admins and Warehouse Staff
- Admin registers Shopkeepers and Delivery Boys
- Shopkeeper profile: shop name, address, GSTIN, phone, license number
- Delivery Boy profile: name, phone, vehicle type, assigned area

### 2.3 Inventory / Warehouse

- Add medicines with: name, composition, pack size, HSN code, manufacturer
- Track stock per batch: batch number, expiry date, MRP, purchase rate, quantity
- Low-stock alerts (configurable threshold per product)
- Expiry alerts (30/60/90 day warnings)
- Purchase entry: record incoming stock from distributors (maps to Bill 1)
- Stock adjustment: damage, returns, transfers

### 2.4 Product Catalog

- Shopkeepers browse available medicines
- Search by name, composition, manufacturer, category
- Show current pricing (rate, MRP, applicable discount schemes)
- Show available stock (without revealing exact warehouse numbers)
- Category/therapeutic classification (Antibiotics, Antacids, Pain, etc.)

### 2.5 Order Management

- Shopkeepers place bulk orders from catalog
- Order states: `DRAFT → PLACED → CONFIRMED → PICKING → PACKED → DISPATCHED → DELIVERED → CANCELLED`
- Admin reviews and confirms/rejects orders
- Warehouse staff picks and packs items
- Partial fulfillment support (if stock is insufficient)
- Order history with re-order capability

### 2.6 Invoice Generation

- Auto-generate GST invoice on order confirmation
- Calculate: line amount, discount (DIS1%, DIS2%), free goods, SGST, CGST
- HSN code mapping for GST compliance
- Invoice PDF generation
- Invoice numbering (sequential, financial year prefixed)
- Credit note support for returns

### 2.7 Delivery Management

- Admin assigns delivery boy to confirmed orders
- Delivery boy sees assigned orders with route info
- Status updates: `ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED → FAILED`
- Proof of delivery (signature / photo capture)
- Cash/payment collection tracking
- Delivery history and performance metrics

### 2.8 Payments & Ledger

- Track payment status per invoice: `PENDING → PARTIAL → PAID`
- Shopkeeper credit limit and outstanding balance
- Payment recording (cash, UPI, bank transfer)
- Ledger view: all transactions for a shopkeeper

### 2.9 Reports & Analytics (Admin)

- Daily/weekly/monthly sales reports
- Top-selling products
- Shopkeeper-wise sales
- Delivery boy performance
- Stock movement reports
- Expiry-nearing inventory
- Outstanding payments / collection reports
- GST reports (GSTR-1 data)

---

## 3. Non-Functional Requirements

| Aspect          | Requirement                                     |
|-----------------|------------------------------------------------|
| Performance     | < 200ms API response for catalog/order queries |
| Scalability     | Support 500+ concurrent shopkeeper sessions    |
| Security        | OWASP Top 10, encrypted passwords, RBAC        |
| Availability    | 99.5% uptime target                            |
| Data Retention  | 7 years for GST invoice data                   |
| Mobile          | Responsive design; future mobile app for delivery |

---

## 4. Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14+ (App Router), TypeScript |
| UI Library  | Tailwind CSS (if requested), or Vanilla CSS |
| State       | React Context + Apollo Client       |
| API         | GraphQL (Strawberry on backend)     |
| Backend     | FastAPI (Python 3.11+)              |
| GraphQL Lib | Strawberry GraphQL                  |
| ORM         | SQLAlchemy 2.0 (async)              |
| Migrations  | Alembic                             |
| Database    | PostgreSQL 15+                      |
| Cache       | Redis 7+                            |
| Auth        | JWT (PyJWT) + bcrypt                |
| PDF Gen     | WeasyPrint or ReportLab             |
| Testing     | pytest (backend), Jest (frontend)   |
| Container   | Docker + Docker Compose             |
