# ⚛️ Pharmacy Fantasy — Frontend Agent Playbook

> **Operational Guidelines for Frontend Engineers & AI Subagents**  
> *Stack:* Next.js 14+ (App Router) · React · TypeScript · Apollo Client · Vanilla CSS Design Tokens

---

## 1. Directory Structure & App Router Map

```
frontend/
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # Strict TypeScript configuration
├── next.config.js           # Next.js bundler & environment settings
└── src/
    ├── app/                 # Next.js App Router root
    │   ├── layout.tsx       # Root layout wrapping ApolloProvider
    │   ├── page.tsx         # Authentication & Landing Portal
    │   ├── globals.css      # Core design tokens, CSS variables, utility classes
    │   └── dashboard/       # Protected multi-role dashboard routes
    │       ├── layout.tsx   # Dashboard layout with Sidebar navigation
    │       ├── page.tsx     # Executive Overview & Stats
    │       ├── inventory/   # Warehouse stock & batch management
    │       ├── orders/      # Bulk order processing & status updates
    │       ├── invoices/    # GST tax invoices & PDF view
    │       ├── deliveries/  # Courier assignment & tracking
    │       ├── products/    # Master product & SKU catalog
    │       ├── shopkeepers/ # Retail client management & balances
    │       ├── reports/     # GST & sales summary reports
    │       └── users/       # Multi-role access control
    ├── components/          # Shared reusable UI components
    │   ├── providers.tsx    # Apollo Client context wrapper
    │   └── sidebar.tsx      # Role-aware navigation sidebar
    ├── hooks/               # Custom React hooks (useAuth, etc.)
    ├── lib/                 # Apollo client instance & GraphQL queries/mutations
    └── types/               # TypeScript interface definitions
```

---

## 2. Essential Commands

### Development Setup
```powershell
# From ./frontend
npm install

# Start development server on http://localhost:3000
npm run dev

# Check TypeScript compiler & production build
npm run build

# Run linter
npm run lint
```

---

## 3. Core Frontend Rules for Agents

### Rule 1: Next.js App Router Conventions
- Pages that interact with hooks, Apollo queries, or localStorage must start with `"use client";`.
- Layout components should remain lightweight and manage shared UI shells (e.g. `dashboard/layout.tsx` rendering `<Sidebar />`).
- Navigation between routes must use `next/link` (`<Link href="/dashboard/orders">`) rather than raw `<a>` tags.

### Rule 2: Apollo Client & Offline Demo Fallback
- All queries and mutations are centralized in `src/lib/graphql-queries.ts`.
- When backend is offline or unreachable during demos, pages gracefully fall back to local simulated data so reviewers can inspect UI workflows without an active PostgreSQL instance.
- Avoid unhandled Apollo network exceptions: use `errorPolicy: "all"` or `errorPolicy: "ignore"` where appropriate.

### Rule 3: Component Decomposition
- Do not build monolithic 500+ line page files.
- Refactor repetitive UI patterns into `src/components/`:
  - `StatCard` for numeric metrics
  - `StatusBadge` for order and delivery status chips
  - `Modal` for dialogs using modern `<dialog>` element
  - `DataTable` for paginated tabular data with search and sorting.
