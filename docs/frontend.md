# ⚛️ Frontend Architecture & Component Engineering Guide

> **Pharmacy Fantasy — Next.js 14 App Router, Pure CSS Design System & Apollo Client**

---

## 1. Architectural Philosophy

The Pharmacy Fantasy frontend is engineered for high performance, accessibility, and zero-dependency aesthetic richness:
- **Zero Tailwind / Pure Semantic CSS**: All design tokens (colors, gradients, typography, spacing, elevations) are declared natively in [`frontend/src/app/globals.css`](file:///e:/chanchal/pharmacyfantasy/frontend/src/app/globals.css).
- **Responsive Dual-Axis Tables**: Custom `.table-scroll-container` supports horizontal and vertical scrolling with sticky column headers (`.table-header-sticky`).
- **LinkedIn-Style SideDrawers**: Replaces disruptive modal popups with smooth sliding right-side panels ([`SideDrawer`](file:///e:/chanchal/pharmacyfantasy/frontend/src/components/ui/side-drawer.tsx)).
- **Role-Aware Navigation & Guarding**: Contextual navigation per role with automatic redirect and route shielding via [`AuthGuard`](file:///e:/chanchal/pharmacyfantasy/frontend/src/components/auth-guard.tsx).
- **Mobile Courier Experience**: Built-in HTML5 digital signature pad and camera capture for proof-of-delivery (POD) uploads.

---

## 2. Directory Structure & Code Organization

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root HTML wrapper & ApolloProvider setup
│   │   ├── globals.css             # Complete design token system & theme tokens
│   │   ├── page.tsx                # Enterprise marketing landing & portal entrance
│   │   ├── login/                  # Universal multi-role login (Email or Phone)
│   │   ├── register/               # Self-service registration (Retailer & Delivery)
│   │   ├── forgot-password/        # Password reset request flow
│   │   └── dashboard/
│   │       ├── layout.tsx          # Collapsible enterprise dashboard shell
│   │       ├── page.tsx            # Real-time metrics overview & activity feeds
│   │       ├── products/           # Master catalog & SKU management
│   │       ├── inventory/          # Warehouse rack batches & FEFO alerts
│   │       ├── orders/             # Wholesale order queue, picking & packing
│   │       ├── deliveries/         # Courier runs, bay pickup, signature pad POD
│   │       ├── invoices/           # GST invoices, Challans, Returns & Advances
│   │       ├── shopkeepers/        # Retail pharmacy profiles & credit ceilings
│   │       ├── users/              # RBAC user management & role assignment
│   │       └── reports/            # Sales analytics & GSTR-1 tax data
│   ├── components/
│   │   ├── auth-guard.tsx          # JWT session verification & role router
│   │   ├── navbar.tsx              # Top app bar, search bar, active user badge
│   │   ├── sidebar.tsx             # Collapsible, role-partitioned navigation
│   │   ├── theme-toggle.tsx        # High-contrast Dark/Light theme switch
│   │   └── ui/
│   │       ├── side-drawer.tsx     # LinkedIn-style right slide-out panel
│   │       └── stat-card.tsx       # KPI overview widget with delta badges
│   ├── lib/
│   │   ├── apollo-client.ts        # Apollo Client instance with auth link
│   │   ├── auth.ts                 # Role metadata, token persistence & nav definitions
│   │   ├── graphql-queries.ts      # Tagged gql queries & mutations
│   │   └── logger.ts               # Production-safe browser logging wrapper
│   └── types/
│       └── index.ts                # Shared TypeScript models & role enums
├── package.json                    # Dependencies & Next.js scripts
└── tsconfig.json
```

---

## 3. Design System & CSS Token Architecture

### 3.1 Color Tokens & Theme Engine
Tokens in `globals.css` support automatic light/dark switching via `data-theme` attribute:
```css
:root {
  /* Brand Palette (Emerald & Slate) */
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;

  /* Surfaces & Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;

  /* Text Typography */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
}

[data-theme="dark"] {
  --bg-primary: #0b1120;
  --bg-secondary: #0f172a;
  --bg-card: #1e293b;
  --border-color: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
}
```

### 3.2 Responsive Dual-Axis Tables
Ensures deep inventory tables with 12+ columns never break screen layouts:
```css
.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.table-header-sticky th {
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

---

## 4. Key Interactive Components

### 4.1 LinkedIn-Style SideDrawer (`components/ui/side-drawer.tsx`)
Replaces standard modal dialogues for complex forms:
- Slides in from the right edge with smooth bezier easing.
- Backdrop blur overlays background table.
- Accessible dismissal via Esc key, backdrop click, or close button.
- Used across:
  - **New Wholesale Order Drawer**
  - **Inward Stock Batch Ingestion Drawer**
  - **Delivery Challan Creator Drawer**
  - **Invoice Return (Credit Note) Drawer**
  - **Advance Payment Record Drawer**

### 4.2 Courier Digital Signature Pad
Integrated into `/dashboard/deliveries` for delivery boys:
- Uses an HTML5 `<canvas>` element capturing `pointerdown`, `pointermove`, and `pointerup` events.
- Captures the Retail Shopkeeper's counter signature.
- Converts drawn vectors to a high-resolution Base64 PNG data URL (`canvas.toDataURL("image/png")`).
- Directly submits data to the `updateDeliveryStatus` GraphQL mutation to verify delivery.

---

## 5. Apollo Client & Network Strategy

Configured in [`frontend/src/lib/apollo-client.ts`](file:///e:/chanchal/pharmacyfantasy/frontend/src/lib/apollo-client.ts):
- Attaches the JWT Bearer token dynamically on every outbound GraphQL request:
  ```typescript
  const authLink = setContext((_, { headers }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
  ```
- **Fetch Policies**:
  - Live queues (`orders`, `stockBatches`, `myDeliveries`) use `network-only` to guarantee fresh data.
  - Catalogs and static lists use `cache-first` with manual refetch triggers.

---

## 6. Typechecking & Build Verification

```bash
cmd.exe /c "npm run build"
```
Ensures 100% TypeScript type validity across all 16 pages and components.

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase F.1: Offline Support & PWA for Couriers
- [ ] **F.1.1 Progressive Web App (PWA) Service Worker**:
  - Add `next-pwa` or custom Service Worker caching static assets and delivery run details.
  - Allow Delivery Boys to view delivery addresses and capture customer signatures even in basement medical shops or areas with zero cellular coverage.
  - Automatically sync queued signatures and status updates when network connectivity is restored (Background Sync API).
- [ ] **F.1.2 Push Notifications via Web Push**:
  - Deliver native OS push notifications to couriers when new deliveries are assigned, and to warehouse staff when urgent orders are placed.

### 📋 Phase F.2: Hardware Integration & Warehouse Bay Printing
- [ ] **F.2.1 Web Bluetooth Thermal Printer Support**:
  - Integrate Web Bluetooth API to pair directly with portable thermal label/receipt printers (e.g., TVS, Zebra, TSC).
  - Print 2-inch and 3-inch Delivery Challans, carton shipping labels, and picking slips directly from the browser without print driver dialogs.
- [ ] **F.2.2 Audio Chimes for Incoming Orders**:
  - Implement a pleasant Web Audio alert ("Order Bell") that sounds on the warehouse terminal whenever a retail pharmacy places a new wholesale order.

### 📋 Phase F.3: Localization & Accessibility
- [ ] **F.3.1 Bilingual Support (English & Bengali - বাংলা)**:
  - Add lightweight i18n support allowing retail shopkeepers and warehouse workers to switch the interface between English and Bengali.
- [ ] **F.3.2 Screen Reader & Keyboard Navigation Auditing**:
  - Verify full WCAG 2.1 AA compliance across all SideDrawers and dual-axis tables with full keyboard focus trapping.

