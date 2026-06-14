# ROADMAP.md — Family Budgeting Application

> **Status:** Planning  
> **Last Updated:** 2026-06-09  
> **Version:** 0.3.0  
> **Current Phase:** 0 — Pre-development

---

## How to Read This Document

Each phase is designed to be **independently demonstrable** — at the end of every phase,
you have working software you can show and use. Phases build on each other; never skip one.

**Status labels:**
- `Not started` — work has not begun
- `In progress` — currently being built
- `Complete` — built and tested
- `Deferred` — explicitly moved to a later phase; not forgotten, not abandoned

---

## Phase 0 — Documentation & Architecture
**Target:** Week 0 (current) | **Status:** In progress

The planning phase. No application code is written yet. The goal is to have a clear,
agreed blueprint before a single line of TypeScript is written.

| Task | Status |
|------|--------|
| Define project goals and scope | ✅ Complete |
| Design database schema | ✅ Complete |
| Design API routes | ✅ Complete |
| Define folder structure | ✅ Complete |
| Create PROJECT.md | ✅ Complete |
| Create ARCHITECTURE.md | ✅ Complete |
| Create ROADMAP.md | ✅ Complete |
| Create DECISIONS.md | ✅ Complete |
| Create DATABASE.md | ✅ Complete |
| Create API.md | ✅ Complete |
| Create SPRINTS.md | ✅ Complete |
| MVP scope review and document alignment | ✅ Complete |

**Learning objectives for this phase:**
- Understand the value of documentation-first development
- Read and understand a database schema as an entity-relationship model
- Understand REST API conventions (verbs, routes, response shapes)
- Understand how Next.js organises a full-stack project

---

## Phase 1 — Project Foundation
**Target:** Weeks 1–2 | **Status:** Not started

Standing up the project: repository, tooling, database connection, and schema.
At the end of this phase, nothing is visible in a browser — but the entire technical
foundation is in place and verified. Authentication comes in Sprint 2.

> This phase maps to **Sprint 1** (environment setup) and **Sprint 2** (authentication).
> See SPRINTS.md for the task-level breakdown.

| Task | Status |
|------|--------|
| Initialise Next.js project with TypeScript and Tailwind | ⬜ Not started |
| Configure ESLint and Prettier | ⬜ Not started |
| Initialise Git repository with branching strategy | ⬜ Not started |
| Set up PostgreSQL database (local + Supabase) | ⬜ Not started |
| Write Prisma schema (all tables) | ⬜ Not started |
| Run first database migration | ⬜ Not started |
| Write and run seed script with default categories | ⬜ Not started |
| Implement NextAuth with credentials provider | ⬜ Not started |
| Build registration page and API route | ⬜ Not started |
| Build login page | ⬜ Not started |
| Add authentication guard to dashboard layout | ⬜ Not started |

**Deliverable:** A running application where a user can register and log in.
No financial features yet — just identity and session.

**Learning objectives:**
- How to initialise a Next.js project and understand the generated files
- What a Prisma schema is and how to read it
- How database migrations work (schema change → migration file → apply to DB)
- How session-based authentication works
- Environment variables and why secrets must never be committed to Git

---

## Phase 2 — Household & Transactions (MVP Core)
**Target:** Weeks 3–5 | **Status:** Not started

The core data entry flow. A user creates a household and starts recording
income and expenses against categories.

> **MVP scope — household membership:**
> Household creation and ownership are fully supported. The `HouseholdMember`
> table is written in Phase 1, and a single owner record is created automatically
> when a household is created. This is sufficient for MVP.
>
> The following are **not part of this phase** and will not block MVP completion:
> - Invitation links and invitation tokens
> - Email-based member onboarding flows
> - Advanced member management UI (role changes, member removal)
>
> The data model already supports multiple members. Adding invitation workflows
> later requires only new API routes and UI — no schema changes.

| Task | Status |
|------|--------|
| Household creation page and API | ⬜ Not started |
| Auto-create owner HouseholdMember record on household creation | ⬜ Not started |
| Category management — view and edit default categories | ⬜ Not started |
| Category creation (custom categories) | ⬜ Not started |
| Transaction creation form (income and expense) | ⬜ Not started |
| Transaction list page with month filter | ⬜ Not started |
| Transaction edit and delete | ⬜ Not started |
| Input validation with Zod on all forms and API routes | ⬜ Not started |
| Authorization — all queries scoped to the user's household | ⬜ Not started |

**Deliverable:** A user can create a household and record income and expenses by category.

**Learning objectives:**
- Many-to-many relationships via junction tables (`HouseholdMember`)
- REST API design: CRUD operations, dynamic route parameters (`[id]`)
- Server-side and client-side form validation with Zod
- Authorization vs. authentication — knowing *who you are* vs. *what you can access*
- Scoping all database queries to a `household_id`

---

## Phase 3 — Budgeting Engine
**Target:** Weeks 6–8 | **Status:** Not started

The zero-based budgeting core. Each category gets a monthly spending limit.
The application calculates how much has been spent and how much remains.

| Task | Status |
|------|--------|
| Budget creation and edit per category per month | ⬜ Not started |
| Monthly budget summary API (limit vs. spent vs. remaining) | ⬜ Not started |
| Budget progress page with per-category progress bars | ⬜ Not started |
| Over-budget visual warnings | ⬜ Not started |
| Zero-based allocation check: total budgeted vs. total income | ⬜ Not started |

**Deliverable:** A user can set monthly category budgets and see live progress against them.

**Learning objectives:**
- Aggregation queries: `SUM` of transactions grouped by category and month
- Derived data: calculating "remaining" from stored limit and queried spent total
- UI state patterns for over/under budget conditions
- Month and year scoping in database queries

---

## Phase 4 — Reports & Savings Goals
**Target:** Weeks 9–11 | **Status:** Not started

Visibility into financial trends over time. Monthly income vs. expense summaries,
category breakdowns with charts, and savings goal tracking.

| Task | Status |
|------|--------|
| Monthly income vs. expenses bar chart | ⬜ Not started |
| Category spending donut chart | ⬜ Not started |
| Monthly report API | ⬜ Not started |
| Savings goal creation and editing | ⬜ Not started |
| Savings goal progress display | ⬜ Not started |
| Dashboard overview page with summary cards | ⬜ Not started |
| Last 6 months spending trend line | ⬜ Not started |

**Deliverable:** A reports page with charts and a working savings goals tracker.

**Learning objectives:**
- Recharts fundamentals: bar charts, line charts, donut charts
- Aggregating transaction data across multiple months
- Designing a dashboard layout with summary cards
- The difference between stored data and derived display data

---

## Phase 5 — AI Features
**Target:** Weeks 12–14 | **Status:** Not started

AI-powered budget analysis and meal planning. The application assembles the
household's financial context and sends it to the configured OpenAI model. Results are
stored in the `AIInsight` table and displayed to the user.

**Two AI features are in scope for MVP:**

| Feature | Description |
|---------|-------------|
| Budget Analysis | Reviews spending patterns for the selected month. Identifies over-budget categories. Makes specific savings recommendations. |
| Meal Planning | Generates a weekly meal plan using seasonal, locally available Serbian ingredients. Provides estimated cost based on reference price data. |

| Task | Status |
|------|--------|
| OpenAI API integration and environment setup | ⬜ Not started |
| Budget analysis prompt design and testing | ⬜ Not started |
| Budget analysis API route (`POST /api/ai/analyze`) | ⬜ Not started |
| Budget analysis result UI | ⬜ Not started |
| Meal plan prompt design (seasonal ingredients, Serbian region) | ⬜ Not started |
| Meal plan generator API route (`POST /api/ai/meal-plan`) | ⬜ Not started |
| Meal plan display UI | ⬜ Not started |
| `AIInsight` storage and history retrieval | ⬜ Not started |
| Cost controls: token limits and per-household rate limiting | ⬜ Not started |

**Deliverable:** An AI page that generates and displays budget analysis and a weekly meal plan.
Both results are stored in `AIInsight` and retrievable without re-calling the API.

**Learning objectives:**
- Calling an external API from a Next.js server route
- Prompt engineering: structuring financial context for an LLM
- Token cost awareness and basic rate limiting
- Storing and re-displaying AI-generated content from the database

---

## Phase 6 — Polish & Production
**Target:** Weeks 15–17 | **Status:** Not started

Production-quality finishing: error handling, loading states, mobile layout,
performance review, and deployment. This phase brings the MVP to a shippable,
production-ready state. Grocery integrations, price comparison, and supermarket
data are not part of this phase and are not part of the MVP.

| Task | Status |
|------|--------|
| Consistent error handling across all API routes | ⬜ Not started |
| User-facing error messages (no raw error objects in the UI) | ⬜ Not started |
| Loading states and skeleton screens throughout | ⬜ Not started |
| Full mobile responsive layout pass | ⬜ Not started |
| Performance review: slow queries, bundle size | ⬜ Not started |
| Email notifications for over-budget alerts | ⬜ Not started |
| Deployment to Vercel + Supabase | ⬜ Not started |
| Environment variable audit for production | ⬜ Not started |
| Post-deployment smoke test | ⬜ Not started |

**Deliverable:** A deployed, production-ready MVP application accessible via a public URL.

**Learning objectives:**
- Error handling patterns in full-stack applications
- Responsive CSS with Tailwind breakpoint utilities
- Transactional email for notifications
- Production deployment workflow with Vercel and Supabase
- Environment configuration differences between development and production

---

## MVP Scope

This section defines the agreed boundaries of Version 1. It exists to prevent
scope creep and to give a single, unambiguous reference for what is and is not
being built.

### Included in Version 1

| Feature | Phase |
|---------|-------|
| User registration and login | Phase 1 |
| Household creation and ownership | Phase 2 |
| Budget categories (default + custom) | Phase 2 |
| Transaction tracking (income and expenses) | Phase 2 |
| Monthly budgets with progress tracking | Phase 3 |
| Over-budget warnings | Phase 3 |
| Monthly reports and charts | Phase 4 |
| Savings goals | Phase 4 |
| AI budget analysis | Phase 5 |
| AI meal planning | Phase 5 |
| Deployment to production | Phase 6 |

### Not Included in Version 1

| Feature | Reason |
|---------|--------|
| Grocery price integrations | External dependency; maintenance burden; deferred to post-MVP |
| Supermarket price comparison | Depends on grocery integration; deferred |
| Open banking / automatic transaction import | Regulatory complexity; out of scope |
| Native mobile application | Web-first approach; mobile app uses same API later |
| Multi-currency support | Single currency (RSD) is sufficient for MVP |
| Advanced invitation workflows | Single-owner households are sufficient for MVP |
| Recurring transaction automation | Manual entry is acceptable for MVP |
| Multi-language / Cyrillic support | English-first for MVP |

---

## Future Considerations (Post-MVP)

These features are **not forgotten** — they are explicitly planned for after the
MVP is stable and in use. Each is documented here so the architecture is designed
to accommodate them without requiring a rebuild.

### Household Member Management

Invitation flows, email-based onboarding, and the member management UI deferred
from the MVP scope.

| Feature | Notes |
|---------|-------|
| Email invitation link generation | Requires a transactional email service (e.g. Resend) |
| Invitation acceptance flow | Token-based link; creates `HouseholdMember` record |
| Member management page | Owner can view members, change roles, remove members |
| Last-owner guard | Prevent the sole owner from leaving a household |

> The `HouseholdMember` table is already in the schema. Adding this feature
> requires new API routes and UI — no database redesign needed.

### Recurring Transactions

Fixed expenses and income that repeat on a schedule. Examples:

- Rent (monthly, fixed amount)
- Internet bill (monthly, fixed amount)
- Netflix subscription (monthly, fixed amount)
- Gym membership (monthly, fixed amount)
- Insurance premium (monthly or annual)
- Salary (monthly, fixed amount)

In v1, users enter these manually each month. In a future version, a
`RecurringTransaction` entity (or similar) would define the schedule and
amount, and a background job would generate the actual `Transaction` records
automatically on the scheduled date.

> **Design note:** No `RecurringTransaction` table is introduced now. When this
> feature is designed, it will link to `Category` and `Household`, and will
> generate child `Transaction` records. The current `Transaction` table may gain
> a nullable `recurring_source_id` foreign key at that time.

### Grocery Intelligence

Live grocery price data from Serbian supermarkets for use in meal plan cost
estimation, shopping list optimisation, and price comparison.

> **Why deferred:** External scraping introduces maintenance burden and potential
> legal and terms-of-service considerations. For MVP, grocery price assumptions
> used in meal planning are manually maintained reference values. The AI meal
> planning feature is fully functional without live pricing data.

| Feature | Notes |
|---------|-------|
| Grocery price source research | Identify available APIs or scrapable sources for Serbian supermarkets (Lidl, Maxi, Univerexport, etc.) |
| Supermarket API or scraping integration | Scheduled background job to fetch and store prices |
| Price comparison engine | Compare same item across supermarkets |
| Meal plan cost calculation | Automatically price meal plan ingredients from live data |
| Shopping optimisation recommendations | Suggest lowest-cost store for a given shopping list |

### Further Future Considerations

- **Native mobile app** — React Native + Expo, consuming the existing API without changes
- **Open banking integration** — automatic transaction import from Serbian banks
- **Multi-language support** — Serbian language and Cyrillic script
- **CSV import/export** — transaction history portability
- **Shared expense splitting** — for flatmates or group travel
- **MealPlan dedicated table** — if meal planning grows to require structured ingredient lists, per-recipe cost breakdowns, or shopping list generation, the `MEAL_PLAN` content currently stored as text in `AIInsight` would migrate to a dedicated `MealPlan` table

---

*This document is updated at the start and end of each phase.
Task statuses are updated as work progresses within a phase.*
