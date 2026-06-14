# ARCHITECTURE.md — Family Budgeting Application

> **Status:** Planning  
> **Last Updated:** 2026-06-09  
> **Version:** 0.2.0

---

## 1. System Overview

The application is a **monolithic full-stack web application** built on Next.js.
"Monolithic" here means the frontend, backend API, and database access all live in
one codebase and are deployed together. This is the right choice for this stage —
microservices add complexity without benefit at small scale.

```
Browser (React UI)
      ↕  HTTP / fetch
Next.js Server (API Routes + SSR)
      ↕  Prisma ORM
PostgreSQL Database
```

The Next.js server handles two responsibilities:
1. **Rendering pages** — it serves the React UI (either server-rendered or client-rendered)
2. **API routes** — it acts as a REST API server for all data operations

---

## 2. Folder Structure

```
budgetapp/
│
├── prisma/
│   ├── schema.prisma          ← Database schema (single source of truth for DB structure)
│   ├── migrations/            ← Auto-generated migration history
│   └── seed.ts                ← Script to populate default categories and test data
│
├── src/
│   ├── app/                   ← Next.js App Router root
│   │   │
│   │   ├── (auth)/            ← Route group: unauthenticated pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/       ← Route group: authenticated pages (protected)
│   │   │   ├── layout.tsx     ← Shared sidebar navigation for all dashboard pages
│   │   │   ├── overview/
│   │   │   │   └── page.tsx   ← Main dashboard: totals, recent transactions, budget health
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx   ← Full transaction list with filters
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx   ← Monthly budget setup and progress
│   │   │   ├── goals/
│   │   │   │   └── page.tsx   ← Savings goals tracker
│   │   │   ├── reports/
│   │   │   │   └── page.tsx   ← Charts: monthly trends, category breakdown
│   │   │   └── ai/
│   │   │       └── page.tsx   ← AI insights and meal planner
│   │   │
│   │   └── api/               ← REST API routes (server-only code)
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   └── [...nextauth]/route.ts
│   │       ├── households/
│   │       │   ├── route.ts          ← GET list, POST create
│   │       │   ├── [id]/route.ts     ← GET, PATCH, DELETE by id
│   │       │   ├── [id]/members/route.ts   ← Future feature (not part of MVP)
│   │       │   └── invite/route.ts         ← Future feature (not part of MVP)
│   │       ├── transactions/
│   │       │   ├── route.ts          ← GET list, POST create
│   │       │   └── [id]/route.ts     ← PATCH, DELETE
│   │       ├── budgets/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── goals/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── reports/
│   │       │   ├── monthly/route.ts
│   │       │   └── categories/route.ts
│   │       └── ai/
│   │           ├── analyze/route.ts
│   │           ├── meal-plan/route.ts
│   │           └── insights/route.ts
│   │
│   ├── components/
│   │   ├── ui/                ← Primitive, reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Select.tsx
│   │   ├── charts/            ← Recharts wrappers with consistent styling
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   ├── CategoryPieChart.tsx
│   │   │   └── TrendLineChart.tsx
│   │   ├── forms/             ← Feature-specific form components
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── BudgetForm.tsx
│   │   │   └── GoalForm.tsx
│   │   └── layout/            ← Page structure components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── PageWrapper.tsx
│   │
│   ├── lib/                   ← Shared server-side utilities
│   │   ├── prisma.ts          ← Single Prisma client instance (important — see note below)
│   │   ├── auth.ts            ← NextAuth configuration
│   │   ├── validations.ts     ← Zod schemas for all API input validation
│   │   └── utils.ts           ← Shared helpers (date formatting, currency, etc.)
│   │
│   └── types/
│       └── index.ts           ← Shared TypeScript interfaces and enums
│
├── public/                    ← Static assets (logo, icons, fonts)
├── .env.local                 ← Local secrets (never committed to git)
├── .env.example               ← Template showing required env variables (committed)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Key Architectural Decisions

### 3.1 Route Groups — `(auth)` and `(dashboard)`

Next.js route groups (folders in parentheses) let us organize pages without affecting URLs.
`(auth)/login/page.tsx` becomes the route `/login`, not `/auth/login`.

The `(dashboard)` group has a shared `layout.tsx` that wraps every page inside it with the
sidebar and header. This means we write the navigation once and it appears everywhere.

The `(dashboard)/layout.tsx` is also where we will add **authentication guards** —
if a user is not logged in, they get redirected to `/login` from any dashboard page.

### 3.2 The Single Prisma Client

`src/lib/prisma.ts` exports one shared Prisma client instance.
**Every API route imports Prisma from this file, never directly.**

Why: Next.js in development mode hot-reloads modules. If each file created its own Prisma
client, you would rapidly exhaust the PostgreSQL connection pool.
The shared singleton pattern prevents this.

### 3.3 API Response Shape

Every API route returns JSON in this consistent shape:

```typescript
// Success
{ "data": { ... }, "error": null, "meta": { "total": 42 } }

// Error
{ "data": null, "error": "Transaction not found", "meta": null }
```

This means the frontend can always rely on the same structure. No surprises.

### 3.4 Server-Side vs. Client-Side Components

Next.js App Router distinguishes between:
- **Server Components** (default) — rendered on the server; can access the database directly
- **Client Components** (`"use client"` directive) — rendered in the browser; needed for interactivity

Our rule: **pages fetch data on the server; interactive pieces (forms, charts, modals) are client components.**

---

## 4. Database Schema

> See DATABASE.md for full field definitions and indexes.

### Entity Relationship Summary

```
User ──────< HouseholdMember >────── Household
                                          │
                    ┌─────────────────────┼──────────────────┐
                    │                     │                  │
                 Category             Transaction         SavingsGoal
                    │                     │
                 Budget              (belongs to Category)
```

### Domain Ownership

| Domain | Tables |
|--------|--------|
| Auth | `User` |
| Household | `Household`, `HouseholdMember` |
| Finance | `Transaction`, `Category` |
| Budgeting | `Budget` |
| Goals | `SavingsGoal` |
| AI | `AIInsight` |

---

## 5. Authentication Flow

```
User submits login form
        ↓
NextAuth credentials provider
        ↓
Check User table (email + bcrypt password compare)
        ↓
Create session (JWT stored in httpOnly cookie)
        ↓
Session available via useSession() (client) or getServerSession() (server)
        ↓
All API routes call getServerSession() to identify the caller
```

The session contains: `user.id`, `user.email`, `user.name`.
The `user.id` is used in every API route to scope queries to the correct household.

---

## 6. Data Access Pattern

API routes follow this pattern without exception:

```
1. Authenticate     → reject if no session
2. Validate input   → reject if schema fails (Zod)
3. Authorize        → reject if user doesn't belong to the target household
4. Query database   → Prisma
5. Return response  → consistent JSON shape
```

Steps 1–3 happen **before** any database query. This is the correct order.

---

## 7. AI Integration Architecture

```
Client (AI page)
      ↓  POST /api/ai/analyze
API Route
      ↓  Fetch last 3 months of transactions + budgets from DB
      ↓  Format as structured context
Configured OpenAI model
      ↓  Return analysis text
API Route
      ↓  Save to AIInsight table
      ↓  Return to client
```

The AI never has direct database access. The API route is always the intermediary —
it shapes what context the model receives, which controls cost and privacy.

---

## 8. Environment Variables

```bash
# .env.example — copy to .env.local and fill in

# Database
DATABASE_URL="postgresql://user:password@host:5432/budgetapp"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."
```

**Rule:** Never hardcode secrets. Never commit `.env.local`. The `.env.example` file
is safe to commit because it contains no real values.

---

*This document is updated whenever a significant structural decision is made.
See DECISIONS.md for the reasoning behind major choices.*
