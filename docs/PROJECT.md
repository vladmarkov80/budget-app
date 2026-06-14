# PROJECT.md — Family Budgeting Application

> **Status:** Planning  
> **Last Updated:** 2026-06-09  
> **Version:** 0.3.0

---

## 1. Project Overview

A web-based family budgeting application built around **zero-based budgeting** principles.
Every household assigns every unit of income a purpose each month.
The application helps families track income and expenses, plan budgets by category,
set savings goals, and receive AI-driven financial insights and meal planning suggestions.

The application targets families and individuals in **Serbia and the broader Balkan region**,
with awareness of local grocery pricing, seasonal ingredients, and regional supermarket chains.

---

## 2. Goals

### Primary Goals
- Allow families to manage a shared household budget together
- Provide a clear picture of income vs. expenses each month
- Enforce zero-based budgeting: every income unit is allocated to a category
- Generate AI budget analysis based on the household's spending patterns
- Generate weekly meal plans based on seasonal, affordable local ingredients
- Deliver a mobile-responsive experience usable on phones without a native app

### Future Goals (Post-V1)
- Grocery price comparison and supermarket integrations
- Grocery cost optimisation features
- Multi-currency support (initial focus post-MVP: RSD — Serbian Dinar)

### Out of Scope (v1 — MVP)
- Native mobile app (React Native / Expo)
- Bank feed / open banking integration
- Multi-language support (English first)
- Cryptocurrency tracking
- Live grocery price feeds or supermarket API integrations
- Household member invitation flows and multi-user onboarding
- Recurring transaction automation

---

## 3. Users

| Role | Description |
|------|-------------|
| **Owner** | Creates the household, manages members and categories, full access |
| **Member** | Can add transactions and view budgets, cannot change household settings |

A single user account may belong to multiple households (e.g. personal + family).

> **MVP note:** For v1, household membership management (invitations, onboarding,
> member removal) is not implemented. The data model supports multiple members,
> but the invitation and onboarding flows are deferred to a post-MVP phase.
> In practice, a household in v1 is operated by a single user who created it.

---

## 4. Core Features

| # | Feature | Phase | MVP? | Status |
|---|---------|-------|------|--------|
| 1 | User registration and login | 1 | ✅ Yes | Not started |
| 2 | Household creation and ownership | 2 | ✅ Yes | Not started |
| 3 | Transaction tracking (income + expenses) | 2 | ✅ Yes | Not started |
| 4 | Budget categories and monthly limits | 3 | ✅ Yes | Not started |
| 5 | Over-budget warnings | 3 | ✅ Yes | Not started |
| 6 | Monthly reports and charts | 4 | ✅ Yes | Not started |
| 7 | Savings goals | 4 | ✅ Yes | Not started |
| 8 | AI budget analysis | 5 | ✅ Yes | Not started |
| 9 | AI meal planning | 5 | ✅ Yes | Not started |
| 10 | Household member invitations | Post-MVP | ❌ No | Deferred |
| 11 | Recurring transactions | Post-MVP | ❌ No | Deferred |
| 12 | Grocery price integration | Post-MVP | ❌ No | Deferred |

> **MVP household scope:** V1 supports household ownership and the membership data
> structures required for multi-user households. Invitation workflows, invite links,
> invite tokens, and advanced member management are deferred to a post-MVP release.

---

## 5. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | Full-stack in one project; pages + API routes |
| Language | TypeScript | Type safety; catches bugs at compile time |
| Styling | Tailwind CSS | Utility-first; fast to build, easy to maintain |
| Database | PostgreSQL | Relational data; strong for aggregations and reporting |
| ORM | Prisma | Type-safe database queries; auto-generated types |
| Auth | NextAuth.js | Session management; extensible to OAuth providers |
| Charts | Recharts | React-native charting; well-documented |
| AI | OpenAI API | Budget analysis and meal plan generation |
| Hosting | Vercel (app) + Supabase (DB) | Free tier available; PostgreSQL managed hosting |

---

## 6. AI Features — Scope Clarification

The application includes two distinct AI-powered features, both implemented in Phase 5.
Both are stored in the `AIInsight` table using a `type` field to distinguish them.

| Feature | AIInsight type | Description |
|---------|---------------|-------------|
| **Budget Analysis** | `BUDGET_ANALYSIS` | Reviews the household's spending patterns for a given month. Identifies over-budget categories and makes savings recommendations. |
| **Meal Planning** | `MEAL_PLAN` | Generates a weekly meal plan using seasonal, locally available ingredients. Provides estimated costs based on reference price data. |

> **Future consideration:** If meal planning grows significantly in scope — for example,
> adding structured ingredient lists, per-recipe cost breakdowns, or supermarket
> price linking — `MEAL_PLAN` content may be migrated to a dedicated `MealPlan` table.
> For MVP, storing meal plan output as text in `AIInsight` is sufficient.

---

## 7. Non-Functional Requirements

- **Security:** Passwords hashed with bcrypt. Sessions managed by NextAuth. No plain-text secrets in code.
- **Privacy:** Household data is isolated — users can only access data belonging to their own household.
- **Performance:** Report queries should respond in under 2 seconds for up to 5 years of data.
- **Maintainability:** Code should be readable by a junior developer without a guide.

---

## 8. Learning Objectives

This project is being built as a **learning exercise** alongside production-grade practices.
The developer is transitioning into software engineering from a medical background.

**Skills being developed:**
- Full-stack TypeScript development
- Relational database design
- REST API design and implementation
- Authentication and session management
- Data visualization
- AI API integration
- Version control with Git
- Professional documentation habits

---

## 9. MVP Definition

Version 1 is considered complete when all of the following are implemented and
deployed to production:

| Feature | Phase |
|---------|-------|
| User registration and login | Phase 1 |
| Household creation | Phase 2 |
| Household ownership model | Phase 2 |
| Budget categories (default and custom) | Phase 2 |
| Transaction tracking (income and expenses) | Phase 2 |
| Monthly budgets with progress tracking | Phase 3 |
| Over-budget warnings | Phase 3 |
| Monthly reports and charts | Phase 4 |
| Savings goals | Phase 4 |
| AI budget analysis | Phase 5 |
| AI meal planning | Phase 5 |
| Production deployment | Phase 6 |

The following are explicitly excluded from V1 and will not be considered blockers
for MVP completion:

| Excluded Feature | Reason |
|-----------------|--------|
| Grocery price integrations | External dependency; deferred post-MVP |
| Supermarket price comparison | Depends on grocery integration; deferred |
| Open banking / automatic transaction import | Regulatory complexity |
| Native mobile applications | Web-first approach; mobile uses same API later |
| Multi-currency support | Single currency (RSD) sufficient for MVP |
| Advanced invitation workflows | Single-owner households sufficient for MVP |
| Recurring transaction automation | Manual entry acceptable for MVP |

---

## 10. Project Conventions

- All code in **TypeScript** — no plain `.js` files in `src/`
- All API routes return JSON with consistent shape: `{ data, error, meta }`
- All database access goes through Prisma — no raw SQL unless necessary for reports
- Components are named in **PascalCase** (`TransactionForm.tsx`)
- Utility functions are named in **camelCase** (`formatCurrency.ts`)
- Branches: `main` (production), `dev` (active development), `feature/xxx` (individual features)
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`

---

*This document is maintained throughout the project. Update the feature table status,
version number, and MVP Definition checklist with each phase completion.*
