# 📋 Pharmacy Fantasy — Project Specification & Business Architecture

> **B2B Wholesale Pharmaceutical Distribution & Supply Chain Operating System**  
> Operating Jurisdiction: West Bengal, India | Central Hub: Durgapur-13

---

## 1. Business Context & Operating Model

**Pharmacy Fantasy** digitizes and automates the multi-tier pharmaceutical distribution supply chain in West Bengal, India. It bridges the critical operational gap between C&F agencies/primary distributors and community retail pharmacies.

```
┌───────────────────────────────────────────────────────────┐
│        PRIMARY DISTRIBUTORS / PHARMA MANUFACTURERS        │
│        (e.g., MAA Medical Agency, Alembic, Intas)        │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼ Inbound Purchase Invoices (Batch, Exp, HSN, Trade Disc)
┌───────────────────────────────────────────────────────────┐
│              CENTRAL WAREHOUSE & WHOLESALE HUB            │
│              MAA Eswari Pharmaceuticals                   │
│              Benachity, Durgapur - 713213                 │
│              GSTIN: 19BKMPG6092H1ZO | D.L.: 20B/21B       │
│                                                           │
│  [Stock Batches] ── [FEFO Engine] ── [Delivery Challans]  │
│  [GST Invoices]  ── [Returns Mgt] ── [Advance Receipts]  │
└──────────────┬─────────────────────────────┬──────────────┘
               │                             │
    Delivery Challan & Invoices   Digital Signature & POD Upload
               │                             │
               ▼                             ▼
┌─────────────────────────────┐ ┌───────────────────────────┐
│      🛵 DELIVERY FLEET      │ │    🏪 RETAIL SHOPKEEPERS   │
│   (Two-Wheeler / Van Runs)  │─┼▶│  Cheap Medical Stores   │
│   - Route Inspection        │ │ │  Gupta Pharmacy         │
│   - Bay Carton Pickup       │ │ │  - Live Catalog Orders  │
│   - Shop Counter Delivery   │ │ │  - Credit Limit Ledger  │
│   - Digital Signature POD   │ │ │  - Invoice Downloads    │
└─────────────────────────────┘ └───────────────────────────┘
```

---

## 2. Statutory Invoice Breakdown (From Live Field Invoices)

The platform adheres strictly to authentic Indian pharmaceutical wholesale billings (modeled directly on real invoices issued in Durgapur, West Bengal).

### Key Line-Item Architecture

| Parameter | Field Code | Real Invoice Example | Technical & Statutory Significance |
| :--- | :--- | :--- | :--- |
| **Product** | `product_name` | `AZITHRAL 500MG TAB` | Trade brand name + dosage form. |
| **Pack Size** | `pack_size` | `10S`, `15S`, `60ML`, `30CAP` | Commercial strip/bottle size units. |
| **Batch No** | `batch_number` | `2613000703` | Unique manufacturer lot number for traceability. |
| **Expiry** | `expiry_date` | `12/28` (Dec 2028) | Formatted as MM/YY; governs First-Expiry-First-Out. |
| **HSN Code** | `hsn_code` | `30041090`, `30049069` | Harmonized System of Nomenclature code for GST. |
| **Quantity** | `quantity` | `36`, `60`, `20` | Full pack count ordered and dispatched. |
| **Free Goods** | `free_quantity`| `3`, `4`, `1` | Promotional manufacturer bonus packs (billed at ₹0.00). |
| **MRP** | `mrp` | `₹126.73`, `₹92.42` | Maximum Retail Price permitted on shelf. |
| **Rate** | `purchase_rate`| `₹96.56`, `₹70.42` | Trade selling rate per pack before discounts. |
| **DIS 1 %** | `discount1_pct`| `12.00%`, `14.00%` | Primary distributor trade discount percentage. |
| **DIS 2 %** | `discount2_pct`| `0.00%` to `3.00%` | Secondary cash/special scheme discount. |
| **Taxable** | `taxable_value`| `₹3,059.02` | $\text{Qty} \times \text{Rate} - \text{Trade Discounts}$. |
| **SGST** | `sgst_rate` | `2.50%` | West Bengal State Goods & Services Tax. |
| **CGST** | `cgst_rate` | `2.50%` | Central Goods & Services Tax. |
| **Line Total** | `line_total` | `₹3,211.97` | $\text{Taxable Value} + \text{SGST} + \text{CGST}$. |

---

## 3. End-to-End Core Modules

### 3.1 Role Governance & Delegation
- **👑 Super Admin**: Full sovereignty. Can assign, modify, and create all 5 roles (`SUPER_ADMIN`, `ADMIN`, `WAREHOUSE`, `DELIVERY`, `SHOPKEEPER`).
- **🛡️ Operations Admin**: Day-to-day administrative director. Can create and assign all user types **except** Super Admin. Can onboard staff, adjust shopkeeper credit limits, and monitor live revenue.

### 3.2 Product SKU Master & Catalog
- Warehouse Staff and Admins maintain the SKU master:
  - Brand name, active chemical composition, manufacturer, pack size, category, HSN code, and default GST rates.
- Retail Shopkeepers browse the live catalog with search by brand, composition, or therapeutic category.
- Trade rates and bonus schemes are rendered dynamically.

### 3.3 Warehouse Stock & Inward Ingestion
- Inward Purchase Invoices from primary distributors (e.g., *MAA Medical Agency*) are logged by Warehouse Staff.
- Incoming stock updates or creates `StockBatch` records tracking batch number, expiry date, purchase rate, MRP, and quantity available.
- Warehouse staff perform CRUD operations on physical stock: audits, write-offs of damaged goods, and stock level reconciliations.
- Real-time early warning badges:
  - 🔴 **Critical Red**: Expiring within 30 days.
  - 🟡 **Warning Amber**: Expiring within 60 days.
  - 🔵 **Advisory Blue**: Expiring within 90 days.
  - 📦 **Low Stock**: Batches below re-order threshold (< 100 packs).

### 3.4 Retail Ordering & Real-Time Warehouse Queue
- Retail Shopkeepers place bulk wholesale orders directly through their portal.
- **Credit Limit Policy**: The system verifies:
  $$\text{Outstanding Balance} + \text{Order Net Total} \le \text{Credit Limit}$$
- When submitted, the order is created in `PLACED` status.
- **Real-Time Warehouse Sync**: The order instantly surfaces on the Warehouse Staff's picking screen with live audio/visual notification.

### 3.5 FEFO Batch Allocation & Packing
- Warehouse Staff review placed orders and trigger the automated **FEFO (First-Expiry-First-Out)** algorithm:
  - Selects valid batches with $\text{expiry} > \text{today}$ sorted by $\text{expiry\_date ASC}$.
  - Automatically reserves stock from the earliest valid lot.
  - Generates warehouse picking slips organized by bay location.
- Order transitions: `PLACED` ➔ `CONFIRMED` ➔ `PICKING` ➔ `PACKED`.

### 3.6 Delivery Challans (Dispatch Documentation)
- In pharmaceutical distribution, shipments often leave the bay under a **Delivery Challan** (`DC-YYYYMMDD-XXXX`) before or alongside formal invoicing.
- Warehouse Staff generate and print the delivery challan specifying:
  - Transporter / Delivery Boy name, vehicle number, carton count, destination pharmacy address, and batch breakdown.
- Accompanies the field courier during transit.

### 3.7 Delivery Boy Logistics & Digital Signature POD
- Delivery Boy inspects assigned trips on mobile (`/dashboard/deliveries`).
- Marks physical carton pickup from warehouse bay (`ASSIGNED` ➔ `PICKED_UP` ➔ `IN_TRANSIT`).
- Navigates to retail shop counter and hands over stock.
- Captures the **Retail Shopkeeper's digital signature** on an interactive screen canvas (or captures a photo of the counter stamp).
- Uploads the signed Proof of Delivery (POD) to the server.
- The delivery status changes to `DELIVERED`, and the order status is closed.

### 3.8 Statutory GST Tax Invoicing
- Warehouse Staff generate official GST invoices (`INV-YYYYMMDD-XXXX`) on order confirmation or dispatch.
- Formats statutory headers:
  - Seller: *MAA Eswari Pharmaceuticals, Benachity, Durgapur-13*, GSTIN, Drug License numbers (20B/21B).
  - Buyer: Shop Name, Address, GSTIN, Drug License number.
- Itemized tax breakdown with standard rounding to the nearest Rupee.
- Printable, standard-compliant HTML/PDF invoice generation.

### 3.9 Returns Management (Challan Return vs. Invoice Return)
- **Challan Return**:
  - Initiated when items are rejected at the loading bay or at counter handover prior to invoice finalization.
  - Automatically updates remaining dispatch quantities and restores rejected units to warehouse stock.
- **Invoice Return (Sales Return / Credit Note)**:
  - Initiated when medicines are returned post-invoicing (e.g., expiry breakages, manufacturer recalls, or damaged goods).
  - Generates a statutory Credit Note (`CRN-YYYYMMDD-XXXX`).
  - Reverses taxable values and SGST/CGST calculations.
  - Automatically credits the shopkeeper's outstanding ledger balance.
  - Quarantines returned stock into damaged/salvage inventory.

### 3.10 Advance Payments & Ledger Management
- Retailers frequently provide advance payments to secure seasonal discounts or increase credit headroom.
- Warehouse Staff or Operations Admin record **Advance Payment Receipts** (`ADV-YYYYMMDD-XXXX`) via Cash, UPI, Cheque, or Bank Transfer.
- Automatically credited to `ShopkeeperProfile.outstanding_balance` (reducing debt or providing positive credit balance).
- Complete financial ledger tracks every debit (Invoice) and credit (Payment, Advance, Credit Note).

---

## 4. State Machines

### 4.1 Order Lifecycle
```
[DRAFT]
   │
   ▼ (Shopkeeper places order; Credit check passed)
[PLACED] ───────▶ (Instantly appears in Warehouse Queue)
   │
   ▼ (Warehouse triggers FEFO allocation & confirms)
[CONFIRMED]
   │
   ▼ (Warehouse picks items from racks)
[PICKING]
   │
   ▼ (Cartons packed & sealed; Delivery Challan generated)
[PACKED]
   │
   ▼ (Assigned to Delivery Boy & leaves bay)
[DISPATCHED / IN_TRANSIT]
   │
   ▼ (Delivered at counter & Shopkeeper signature uploaded)
[DELIVERED]
```
*(Pre-dispatch orders can transition to `CANCELLED`, automatically reversing allocated batch stock).*

### 4.2 Delivery Run Lifecycle
```
[ASSIGNED] ──▶ [PICKED_UP] ──▶ [IN_TRANSIT] ──▶ [DELIVERED]
                                    │
                                    └──▶ [FAILED] (Shop closed / Refused)
```

---

## 5. Technology Stack & Architecture

| Layer | Component | Specification |
| :--- | :--- | :--- |
| **Frontend** | Framework | Next.js 14+ (App Router), TypeScript, Strict Typing |
| | Styling | Pure CSS Tokens (`globals.css`), Zero Tailwind, Responsive Scroll Containers |
| | State & API | Apollo Client GraphQL, React Context, Optimistic UI |
| | Mobile Delivery | HTML5 Canvas Signature Pad, Web Camera Photo Capture |
| **Backend** | Framework | FastAPI (Python 3.12+), ASGI Async |
| | GraphQL | Strawberry GraphQL (Code-First), DataLoaders |
| | ORM & DB | SQLAlchemy 2.0 (Async), Asyncpg driver, PostgreSQL 15+ (SQLite in local dev) |
| | Authentication | JWT (PyJWT) + Bcrypt, Role Context Middleware |
| | Task Queue | Redis 7+ Cache & Session Store |
| **Quality** | Testing | Pytest (Asyncio), Next.js typecheck (`next build`) |
| | Process Control | Uvicorn / Gunicorn Workers, Systemd / Docker Compose |

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase P.1: Statutory Compliance & Government Integrations
- [ ] **P.1.1 Automated E-Way Bill Generation**:
  - Integrate with the National Informatics Centre (NIC) E-Way Bill API or GSP partner (ClearTax/Masters India).
  - Automatically generate E-Way Bills for wholesale dispatches where `grand_total > ₹50,000` (mandated by West Bengal Commercial Taxes).
  - Embed the E-Way Bill Number and QR code directly onto the Delivery Challan and Tax Invoice headers.
- [ ] **P.1.2 Schedule H1 & Controlled Substance Register**:
  - Flag prescription-only Schedule H, H1, and Narcotic drugs (e.g., Codeine syrups, Alprazolam) in the product master.
  - Automatically maintain a statutory Schedule H1 Register recording: Prescriber details, Retailer Drug License, Date, Batch, and Quantity supplied.

### 📋 Phase P.2: Commercial Scheme Engine & Distributor Replenishment
- [ ] **P.2.1 Advanced Scheme & Bonus Goods Engine**:
  - Support complex promotional schemes defined by pharma manufacturers (e.g., "Buy 10 Get 1 Free", "Buy 50 Get 6 Free + 2% Cash Discount").
  - Auto-calculate bonus free quantities at cart and picking stages without manual warehouse intervention.
- [ ] **P.2.2 Automated Re-Order Suggestion Engine**:
  - Compute stock velocity (Daily Average Consumption) per SKU over 30/60 days.
  - Suggest replenishment purchase orders to primary distributors (e.g. *MAA Medical Agency*) when batch stock drops below re-order points.

### 📋 Phase P.3: Omnichannel Communication & Retailer Engagement
- [ ] **P.3.1 WhatsApp Business API Integration**:
  - Automatically send transactional WhatsApp messages to the Retail Shopkeeper when:
    1. Order is confirmed with batch allocations.
    2. Delivery Boy picks up carton with expected delivery ETA.
    3. Final Tax Invoice PDF and Delivery Challan are issued.
- [ ] **P.3.2 Payment Gateway & Dynamic UPI QR Code**:
  - Print dynamic UPI payment QR codes on invoices and Delivery Boy screens enabling instant counter settlement via PhonePe, Google Pay, or Paytm directly credited to warehouse bank accounts.

