# DECISIONS.md — Architecture Decision Records

> **Last Updated:** 2026-06-09

---

## What Is This Document?

Every significant technical decision made during this project is recorded here.
For each decision, we record:
- **What** was decided
- **Why** it was chosen over the alternatives
- **What we accept** by making this choice (trade-offs)
- **When** the decision was made

This document answers the question: *"Why did we do it this way?"*
It will save hours of confusion when revisiting the project months from now.

---

## ADR-001 — Use Next.js Instead of a Separate Frontend/Backend

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Use Next.js as a full-stack framework — it serves both the React UI and the REST API
from a single codebase and a single deployment.

### Alternatives Considered
| Option | Description |
|--------|-------------|
| React (Vite) + Express | Separate frontend and backend repos; standard industry pattern |
| React Native + Node.js | Original plan; mobile-first approach |
| Next.js (chosen) | One repo, one deploy; API routes built in |

### Reasoning
At the learning stage, managing two separate repositories, two dev servers, two deployments,
and CORS configuration adds complexity without educational value. Next.js allows focus on
features and concepts rather than infrastructure plumbing.

When the application is mature, a separate React Native frontend can be added — it would
consume the same API routes without any backend changes.

### Trade-offs Accepted
- Next.js API routes are less powerful than a dedicated Express/Fastify server for complex cases
- Tighter coupling between UI and API (acceptable at this scale)
- Harder to split into microservices later (not a goal for v1)

---

## ADR-002 — Use PostgreSQL Instead of SQLite or MongoDB

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Use PostgreSQL as the database.

### Alternatives Considered
| Option | Notes |
|--------|-------|
| SQLite | Zero-setup; good for prototypes; not suitable for multi-user hosted apps |
| MongoDB | Document model; poor fit for relational financial data |
| PostgreSQL (chosen) | Relational, mature, excellent aggregation support, free managed hosting on Supabase |

### Reasoning
Budgeting data is fundamentally relational: users belong to households, transactions
belong to categories, budgets are scoped to households and months.
SQL is the natural language for reporting queries like "sum all expenses by category for March".

SQLite is excellent for local development but cannot be easily shared or hosted.
MongoDB's document model would require denormalising data that is naturally relational.

### Trade-offs Accepted
- Requires a running PostgreSQL server (solved with Supabase free tier)
- Slightly more setup than SQLite for local development
- Migrations required for schema changes (this is actually a benefit — intentional)

---

## ADR-003 — Use Prisma as the ORM

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Use Prisma as the database ORM (Object-Relational Mapper).

### Alternatives Considered
| Option | Notes |
|--------|-------|
| Raw SQL (pg library) | Maximum control; verbose; no type safety |
| Drizzle ORM | Newer; more lightweight; less beginner tooling |
| Prisma (chosen) | Mature; excellent TypeScript integration; great learning resources |

### Reasoning
Prisma generates TypeScript types directly from the schema. This means the editor
autocompletes database fields, and TypeScript catches mismatches at compile time —
not at runtime in production. For a developer learning TypeScript and databases
simultaneously, this feedback loop is invaluable.

Prisma Studio (a built-in GUI for viewing database data) is also useful for learning
and debugging without needing to write SQL queries manually.

### Trade-offs Accepted
- Prisma adds a build step (type generation)
- Some advanced SQL patterns are awkward to express in Prisma's query API
- Raw SQL queries will be needed for complex monthly report aggregations

---

## ADR-004 — Use NextAuth.js for Authentication

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Use NextAuth.js for session management and authentication.

### Alternatives Considered
| Option | Notes |
|--------|-------|
| Custom JWT implementation | Full control; high risk of security mistakes |
| Clerk / Auth0 | Managed auth service; excellent DX; adds cost and vendor dependency |
| Lucia Auth | Lightweight; less opinionated; less documentation |
| NextAuth.js (chosen) | Purpose-built for Next.js; well-documented; extensible |

### Reasoning
Authentication is one of the highest-risk areas in any application.
Rolling a custom implementation means managing password hashing, token rotation,
session invalidation, and CSRF protection correctly — all areas where subtle mistakes
create serious vulnerabilities.

NextAuth handles this correctly out of the box and is easily extended to add
Google or Apple login later without changing the rest of the codebase.

### Trade-offs Accepted
- NextAuth's configuration has a learning curve
- The library is opinionated about session structure
- v5 (Auth.js) is a significant API change from v4 — we use v4 for stability

---

## ADR-005 — Household as the Central Data Boundary

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
All financial data (transactions, budgets, goals, categories) belongs to a **household**,
not to an individual user.

### Reasoning
A family budgeting app must allow multiple members to see and contribute to the same data.
If data belonged to a user, sharing would require complex permission systems.

By making the household the owner of all financial data, the permission model becomes simple:
if you are a member of the household, you can see its data.
The `HouseholdMember` table and its `role` field handle the owner/member distinction.

### Consequences
- Every API query must be scoped to a `householdId`
- Users who belong to multiple households (e.g. personal + family) see separate data sets
- A user's `HouseholdMember` record is checked on every sensitive API call (authorization)

### Trade-offs Accepted
- Individual-only tracking is not a first-class feature (a single-person household works fine)
- Household deletion is a destructive operation — all financial data is lost

---

## ADR-006 — Web Application First, Mobile App Later

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Build a responsive web application first. A React Native mobile app is deferred to post-v1.

### Context
The original project concept called for React Native + Expo. This was reconsidered.

### Reasoning
A web app has several advantages at this stage:
- No app store review process — instant deployment
- Shareable via URL — no install required for early users
- Faster development iteration (hot reload, browser dev tools)
- AI and reporting features are better suited to larger screens
- The Next.js API will be consumed by the mobile app later without changes

Tailwind's responsive utilities (`sm:`, `md:`, `lg:`) will ensure the app is usable on
mobile browsers from the start.

### Trade-offs Accepted
- No offline support (web apps require a network connection)
- No push notifications in v1
- Mobile browser UX is inferior to a native app for frequent data entry

---

## ADR-007 — Zod for Input Validation

**Date:** 2026-06-08  
**Status:** Accepted

### Decision
Use Zod for validating all API input on the server and all form input on the client.

### Reasoning
Zod schemas define the shape of valid data once and work in both environments.
The same `transactionSchema` can validate a form field in the browser and the API
request body on the server. TypeScript types are inferred from the schema — no duplication.

**Rule:** Never trust data arriving at an API route, even from your own frontend.
Always validate with Zod before touching the database.

### Trade-offs Accepted
- One more library to learn
- Validation logic is explicit and somewhat verbose (this is a feature, not a bug)

---

## ADR-008 — Use OpenAI for Budget Analysis and Meal Planning

**Date:** 2026-06-09  
**Status:** Accepted

### Decision
Use the OpenAI API to power the two AI features in the MVP: budget analysis and
meal plan generation. The specific model is configured via environment variable
and is not hardcoded in the application.

### Alternatives Considered
| Option | Notes |
|--------|-------|
| Anthropic Claude API | Strong reasoning; excellent instruction following; would be a valid alternative |
| Google Gemini API | Competitive capability; less established ecosystem at time of decision |
| Local / open-source LLM | No API cost; requires self-hosted infrastructure; impractical for MVP |
| OpenAI API (chosen) | Reliable; well-documented; widely used in tutorials and community resources |

### Reasoning
AI features are a core differentiator of this application — not an optional add-on.
The project is designed as both a budgeting application and an AI integration
learning exercise, so the quality of the AI development experience matters.

OpenAI provides reliable APIs with strong documentation and a large body of
community examples, which reduces the learning overhead when implementing the
prompt design and API integration for the first time.

Two important constraints shaped this decision:

1. **AI outputs are advisory only.** Budget analysis and meal plans are displayed
   as suggestions. The AI never writes to the database or modifies financial data.
   This limits the risk of incorrect outputs.

2. **The model is not hardcoded.** All API calls reference the model name from an
   environment variable (`OPENAI_MODEL`). If a newer or cheaper model becomes
   preferable, it can be changed without touching application code.

### Trade-offs Accepted
- Ongoing API cost per AI request — mitigated by per-household rate limiting
- Dependency on an external service — if OpenAI is unavailable, AI features are unavailable
- AI responses may be imperfect and require user judgment — mitigated by framing all outputs as suggestions
- Token limits require careful context assembly — financial data sent to the model must be summarised, not raw

---

*New decisions are added to this document as they are made throughout the project.
Revisited or reversed decisions are updated with a new status and a note explaining the change.*
