# 🤖 Pharmacy Fantasy — Root Agent Playbook

> **Repository Master Directive for Autonomous Coding Agents & AI Assistants**  
> *Target System:* Pharmacy Fantasy B2B Pharmaceutical Distribution Platform

---

## 1. System Mission & Identity

You are working on **Pharmacy Fantasy**, an enterprise-grade B2B pharmaceutical wholesale and supply-chain platform purpose-built for the Indian pharmaceutical market (West Bengal jurisdiction).

The core business flow operates as:
$$\text{Distributor / C\&F Agency} \xrightarrow{\text{Purchase Entry}} \text{Warehouse} \xrightarrow{\text{Bulk Sales / FEFO}} \text{Retail Shopkeepers}$$

Key business imperatives:

- **Zero-Tolerance Financial Inaccuracy**: GST (CGST + SGST) calculations, line-item discounts (DIS1%, DIS2%), round-offs, and free goods ratios must strictly comply with statutory norms.
- **Inventory FEFO Integrity**: First-Expiry-First-Out batch selection. Expired or unverified batches must never be dispatchable.
- **Role-Based Isolation**: Super Admin, Admin, Warehouse Staff, Delivery Boy, and Shopkeeper views and mutations must enforce strict server-side authorization.

---

## 2. Directory Map & Scopes of Influence

```
pharmacyfantasy/
├── AGENT.md                 # 📍 You are here — master repository playbook
├── DESIGN.md                # System design & architecture blueprint
├── STYLE.md                 # Universal coding standards & style guide
├── TODO.md                  # Master prioritized roadmap & backlog
├── README.md                # Project overview & quick start
├── docker-compose.yml       # Local Postgres 15 & Redis 7 stack
├── docs/                    # Regulatory, database & domain specifications
│   ├── PROJECT.md           # Business domain specification & real bill breakdowns
│   ├── DATABASE.md          # PostgreSQL relational schema & indexes
│   ├── API.md               # GraphQL schema & type contracts
│   └── ROLES.md             # Role-based capability matrix
├── backend/                 # FastAPI + Strawberry GraphQL + SQLAlchemy (Python 3.11+)
│   ├── AGENT.md             # Backend-specific agent instructions
│   ├── DESIGN.md            # Backend design & service architecture
│   ├── STYLE.md             # Python & GraphQL style guide
│   └── TODO.md              # Backend backlog & test tasks
└── frontend/                # Next.js 14 App Router + Apollo Client (TypeScript)
    ├── AGENT.md             # Frontend-specific agent instructions
    ├── DESIGN.md            # Frontend UI/UX & component architecture
    ├── STYLE.md             # CSS design tokens & React conventions
    └── TODO.md              # Frontend backlog & UI tasks
```

---

## 3. Core Operational Rules for Agents

### Rule 1: Think Before Coding (Karpathy Guidelines)

1. **Never guess domain behavior**: Refer to [docs/PROJECT.md](file:///e:/chanchal/pharmacyfantasy/docs/PROJECT.md) for pharmaceutical distribution rules (batch formats, MRP vs Rate, free goods).
2. **Surface Tradeoffs**: If modifying financial or inventory data models, highlight backwards-compatibility risks and database migration impact before altering tables.
3. **Surgical Diffs**: Modify only the code directly related to the user prompt. Do not reformat unrelated files or refactor working endpoints without authorization.

### Rule 2: Ponytail Principles (Lazy Senior Dev)

1. Stop at the lowest applicable rung:
   - Can this be handled by native SQL constraints (`CHECK`, `UNIQUE`)? Use them.
   - Does SQLAlchemy or Pydantic already provide validation? Use standard features.
   - Does HTML5 or vanilla CSS natively solve the UI requirement (`<dialog>`, `:user-invalid`, `field-sizing`)? Avoid heavy JS npm packages.
2. Mark intentional deferrals or shortcuts with a clear `// ponytail: [rationale]` comment including a ceiling and upgrade path.

### Rule 3: Verification Before Completion

Never declare a task complete without running concrete verification:

- **Backend changes**: Run pytest on relevant test suites or execute python sanity checks (`python -m pytest backend/tests/`).
- **Database changes**: Verify Alembic migration generation and run `alembic upgrade head`.
- **Frontend changes**: Validate Next.js compile integrity (`npm run build` or typecheck).

---

## 4. Local Environment Orchestration

### Infrastructure

```powershell
# Start PostgreSQL & Redis
docker-compose up -d postgres redis

# Check container status
docker-compose ps
```

### Backend Commands (from `./backend`)

```powershell
# Activate Virtual Environment (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.scripts.seed_superadmin
python -m app.scripts.seed_demo_data

# Start local server
uvicorn app.main:app --reload --port 8000
```

### Frontend Commands (from `./frontend`)

```powershell
# Install npm dependencies
npm install

# Start development server
npm run dev
```

---

## 5. Agent Verification Checklist

Before reporting completion on any issue:

- [ ] **Data Model Guard**: Did you generate an Alembic migration if modifying SQLAlchemy models in `backend/app/db/models.py`?
- [ ] **GraphQL Alignment**: Are Strawberry types in `backend/app/graphql/types.py` synchronized with frontend queries in `frontend/src/lib/graphql-queries.ts`?
- [ ] **Financial Integrity**: Are GST calculations using `Decimal` or precise numeric types with `ROUND_HALF_UP`?
- [ ] **Authorization Check**: Is the endpoint or resolver gated by role requirements (`deps.get_current_user`)?
- [ ] **Zero Console Errors**: Does the frontend render cleanly without unhandled Apollo Client exceptions or missing key props?
