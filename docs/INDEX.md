# 📚 Pharmacy Fantasy — Master Documentation Index

> **Comprehensive Knowledge Base & Technical Blueprint for B2B Pharmaceutical Wholesale & Supply Chain Operations**

---

## 🗂️ Complete Documentation Directory

| Document | Category | Scope & Core Contents |
| :--- | :--- | :--- |
| **[PROJECT.md](file:///e:/chanchal/pharmacyfantasy/docs/PROJECT.md)** | **Domain & Business** | Operating model for West Bengal pharmaceutical wholesale, authentic bill structures (Rate, MRP, DIS1%, DIS2%, SGST 2.5%, CGST 2.5%), multi-tier logistics flow, and core module specifications. |
| **[ROLES.md](file:///e:/chanchal/pharmacyfantasy/docs/ROLES.md)** | **Security & RBAC** | Complete 5-role hierarchy (👑 Super Admin, 🛡️ Operations Admin, 📦 Warehouse Staff, 🛵 Delivery Boy, 🏪 Retail Shopkeeper), creation/assignment authority rules, and permission matrix. |
| **[DATABASE.md](file:///e:/chanchal/pharmacyfantasy/docs/DATABASE.md)** | **Data Architecture** | PostgreSQL relational schema, Mermaid ERD, table definitions for Orders, Invoices, Delivery Challans, Challan Returns, Credit Notes, and Advance Payments. |
| **[API.md](file:///e:/chanchal/pharmacyfantasy/docs/API.md)** | **API Contract** | Strawberry GraphQL API reference (`POST /graphql`), authentication headers, queries, mutations, and input types for all operational workflows. |
| **[backend.md](file:///e:/chanchal/pharmacyfantasy/docs/backend.md)** | **Backend Engineering** | FastAPI runtime, layered service architecture, FEFO automated batch allocation engine, statutory GST calculation algorithms, and pytest async test suite. |
| **[frontend.md](file:///e:/chanchal/pharmacyfantasy/docs/frontend.md)** | **Frontend Engineering** | Next.js 14 App Router architecture, pure CSS design token system (`globals.css`), Apollo Client caching, LinkedIn-style SideDrawers, and HTML5 canvas signature pad. |
| **[pages.md](file:///e:/chanchal/pharmacyfantasy/docs/pages.md)** | **Screen Inventory** | Detailed UX specification and component breakdown for all 13 application screens across public, authenticated, and role-specific workspace views. |
| **[DEPLOYMENT.md](file:///e:/chanchal/pharmacyfantasy/docs/DEPLOYMENT.md)** | **Operations & DevOps** | Production deployment manual, Docker Compose configuration, AWS EC2 provisioning, Nginx reverse proxy, SSL certbot, automated daily DB backups, and CI/CD troubleshooting. |
| **[TODO.md](file:///e:/chanchal/pharmacyfantasy/docs/TODO.md)** | **Roadmap & Checklist** | Phased, bite-sized implementation roadmap (Phases 1 to 8) with discrete checkboxes and verification criteria. |

---

## 🏛️ Role Authority Quick Reference

```
👑 Super Admin
  └── Full System Authority; Can assign & create ALL user types of roles.

🛡️ Operations Admin
  └── Operational Supervisor; Can assign & create ALL user types of roles EXCEPT Super Admin.

📦 Warehouse Staff
  └── Floor Manager; CRUD operations on stock, create new products, manage batches (FEFO),
      process orders, manage invoices, create & manage Delivery Challans, process Challan Returns,
      issue Invoice Returns (Credit Notes), and record Advance Payments.

🛵 Delivery Boy
  └── Field Courier; Checks assigned orders, takes cartons from warehouse bay, delivers to
      pharmacies, collects counter signatures, and uploads signed POD to server.

🏪 Retail Shopkeeper
  └── Community Pharmacist; Browses wholesale catalog with live trade pricing, places orders within
      credit limit, orders appear in real-time on warehouse picking queue, tracks delivery.
```

---

## ⚡ Quick Verification Commands

```bash
# 1. Run Backend Pytest Suite
uv run --with-requirements backend/requirements.txt pytest backend/tests

# 2. Run Frontend Typecheck & Production Build
cmd.exe /c "npm run build" --prefix frontend
```

---

## 🔮 Future Roadmap & Advanced Architecture Matrix

Each technical document in `docs/` contains a dedicated **Future Works & Implementation TODOs** chapter detailing specific domain innovations:

| Document | Future Scope Highlights |
| :--- | :--- |
| **[ROLES.md](file:///e:/chanchal/pharmacyfantasy/docs/ROLES.md#future-works--implementation-todos)** | Immutable role audit logging (`role_audit_logs`), instant Redis session revocation, 2FA/TOTP security, and temporary admin delegation. |
| **[PROJECT.md](file:///e:/chanchal/pharmacyfantasy/docs/PROJECT.md#future-works--implementation-todos)** | National NIC E-Way Bill integration (> ₹50,000 threshold), Schedule H1 antibiotic/narcotic statutory register, WhatsApp Business API dispatches, and dynamic UPI QR code receipts. |
| **[DATABASE.md](file:///e:/chanchal/pharmacyfantasy/docs/DATABASE.md#future-works--implementation-todos)** | PostgreSQL annual table partitioning by Financial Year (`FY26-27`), GIN trigram fuzzy search (`pg_trgm`), 7-year statutory cold archiving, and read-replica routing. |
| **[API.md](file:///e:/chanchal/pharmacyfantasy/docs/API.md#future-works--implementation-todos)** | Strawberry GraphQL Subscriptions via WebSockets & Redis Pub/Sub, DataLoader N+1 query elimination, Automatic Persisted Queries (APQ), and Tally Prime accounting export. |
| **[backend.md](file:///e:/chanchal/pharmacyfantasy/docs/backend.md#future-works--implementation-todos)** | Distributed Redis locks (`Redlock`) for high-concurrency FEFO batch allocation, asynchronous PDF worker queue (ARQ/Celery), and Prometheus `/metrics` telemetry. |
| **[frontend.md](file:///e:/chanchal/pharmacyfantasy/docs/frontend.md#future-works--implementation-todos)** | Offline-first Progressive Web App (PWA) with Background Sync, Web Bluetooth thermal receipt slip printing, audio order alert bells, and bilingual English/Bengali (বাংলা) localization. |
| **[pages.md](file:///e:/chanchal/pharmacyfantasy/docs/pages.md#future-works--implementation-todos)** | Web camera barcode/QR scanner component for stock cartons, interactive Leaflet courier route map, drag-and-drop floor Kanban board, and bulk purchase bill CSV parser. |
| **[DEPLOYMENT.md](file:///e:/chanchal/pharmacyfantasy/docs/DEPLOYMENT.md#future-works--implementation-todos)** | Blue/Green zero-downtime container rollouts, automated git merge conflict sanitization in CI, S3/MinIO off-site disaster backups, and Cloudflare edge WAF geo-fencing. |
| **[TODO.md](file:///e:/chanchal/pharmacyfantasy/docs/TODO.md)** | Master implementation roadmap structured across Immediate Core Phases (1-8) and Advanced Scaling Phases (9-14). |

