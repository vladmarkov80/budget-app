# LEARNING_JOURNAL.md — Vladimir's Dev Journey

> **Started:** 2026-06-08  
> **Last Updated:** 2026-06-16  
> **Project:** Family Budgeting Application  
> **Stack:** Next.js · TypeScript · Tailwind CSS · PostgreSQL · Prisma

---

## Handoff Note — For New Chat Session

This document is the primary handoff reference. Read "Current Status" and
"What Comes Next" at the bottom first — that is the immediate starting point.

**Working agreement to re-establish:**
- Claude acts as senior engineer and mentor — explains every decision, never generates large code blocks without explanation, builds incrementally
- Learning Mode format for every major task: What We Are Building, Why We Need It, What I Should Learn, Implementation Plan, Common Beginner Mistakes
- A task is only complete when Vladimir can explain what it does, why it exists, and how it fits the project — not just when the code runs
- Architecture first, code second
- Be direct when answers are wrong — explain the correct reasoning clearly

**Project repository:** `git@github.com:vladmarkov80/budget-app.git`  
**Local path:** `D:\budget-app`  
**Active branch:** `dev`  
**Database:** PostgreSQL 18, local, database name `budgetapp_dev`  
**Credentials:** stored in `D:\budget-app\.env.local` (not committed to Git)

---

This journal records what was built, what was learned, and what was understood
at each stage of the project. It is not a task list — it is a record of growth.

A task being in this journal means:
- It was completed
- It was understood well enough to explain in plain language

---

## Phase 0 — Documentation & Architecture
**Period:** 2026-06-08  
**Status:** ✅ Complete

### What Was Built
The complete project documentation suite before any application code was written.
Seven markdown documents that define the entire blueprint of the application.

### Documents Created

| Document | Purpose |
|----------|---------|
| `PROJECT.md` | Project overview, goals, tech stack, MVP definition |
| `ARCHITECTURE.md` | System design, folder structure, data access patterns |
| `DATABASE.md` | Full data model — all 8 tables with fields, types, constraints, indexes, examples |
| `API.md` | REST API design — all endpoints, request/response shapes, error conventions |
| `ROADMAP.md` | 6-phase development plan with tasks, deliverables, learning objectives |
| `DECISIONS.md` | Architecture Decision Records — why each major choice was made |
| `SPRINTS.md` | Sprint structure, phase-to-sprint mapping, Sprint 1 execution plan |

### Key Concepts Learned

**Documentation-first development**
Writing documentation before code forces clarity. If you cannot explain what you
are building in plain language, you do not understand it well enough to build it.
Every hour spent on documentation saves multiple hours of confused coding later.

**Database design — relational thinking**
A relational database organises data into tables that reference each other.
The key insight: data belongs to the right owner.
- Financial data (transactions, budgets, goals) belongs to a `Household`, not a `User`
- This makes the permission model simple: if you are a member of the household, you see its data
- A `HouseholdMember` junction table connects users to households (many-to-many relationship)

**Why UUIDs instead of integers for primary keys**
- Integers reveal information: user with `id=4` means only 3 others exist
- UUIDs reveal nothing: `a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90`
- UUIDs can be generated before inserting a row, which simplifies some workflows

**Why DECIMAL and not FLOAT for money**
Floating point numbers cannot represent most decimal fractions exactly.
`0.1 + 0.2 = 0.30000000000000004` in float arithmetic.
`DECIMAL(12,2)` is exact. Always use DECIMAL for financial data.

**Never store calculated fields**
Fields like "budget remaining" or "goal progress percentage" are never stored.
They are always calculated at query time from source data.
Stored calculated fields go stale when their source data changes — causing silent bugs.

**REST API design**
Every resource follows a predictable pattern:
- `GET /resource` — list
- `POST /resource` — create
- `PATCH /resource/[id]` — update
- `DELETE /resource/[id]` — delete

Every API response uses the same envelope shape:
```json
{ "data": { ... }, "error": null, "meta": null }
```

**The five-step data access pattern**
Every API route must follow this order — no exceptions:
1. Authenticate — is there a valid session?
2. Validate input — does the data match the expected shape?
3. Authorize — does this user have access to this household?
4. Query database — only now do we touch the database
5. Return response — always in the standard envelope format

**Architecture Decision Records (ADRs)**
Every major technical decision is documented with:
- What was decided
- What alternatives were considered
- Why this option was chosen
- What trade-offs were accepted

This answers "why did we do it this way?" months later when the reason is forgotten.

### MVP Scope Defined

**Included in Version 1:**
Authentication, Households, Categories, Transactions, Budgets,
Reports, Savings Goals, AI Budget Analysis, AI Meal Planning, Deployment.

**Explicitly excluded from Version 1:**
Grocery integrations, price comparison, open banking, mobile apps,
multi-currency, advanced invitation workflows, recurring transaction automation.

---

## Phase 1 — Project Foundation
**Period:** 2026-06-11  
**Status:** 🔵 In progress — Sprint 1

---

### Environment Setup
**Date:** 2026-06-11  
**Status:** ✅ Complete

#### What Was Installed

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v24.16.0 | Runs Next.js and all JavaScript tooling |
| npm | v11.13.0 | Package manager — installs project libraries |
| Git | v2.54.0 | Version control |
| VS Code | v1.104.1 | Code editor |
| PostgreSQL | v18 | Database |
| pgAdmin 4 | Latest | GUI for managing the database |

#### What Was Configured
- Git identity: `user.name = Vladimir`, `user.email = markovic.marker@gmail.com`
- Git default branch: `main`
- PowerShell execution policy: `RemoteSigned` (required to run npm scripts on Windows)
- SSH key generated and registered on GitHub (type: ed25519)
- GitHub account: `vladmarkov80`

#### Key Concepts Learned

**Why Node.js is installed first**
Everything else depends on it. Next.js runs on Node.js. npm comes bundled with it.
Without Node.js, no other tools in the stack can run.

**What npm is**
npm (Node Package Manager) installs and manages libraries. When you run
`npm install`, it reads `package.json` and downloads every dependency listed there
into a `node_modules` folder. This folder is never committed to Git — it can always
be recreated from `package.json`.

**SSH keys — how they work**
SSH uses a pair of cryptographic keys:
- Private key: stored on your machine only (`id_ed25519`) — never shared
- Public key: registered on GitHub (`id_ed25519.pub`) — safe to share
When you push code, GitHub checks if your private key matches the public key on file.
If they match, you are authenticated without a password.

**Why `.env.local` must never be committed**
Environment variables store secrets (database passwords, API keys).
If committed to Git, they are in the history permanently — even if deleted later.
The `.gitignore` file tells Git to ignore specific files. `.env.local` must always
be listed there before any secrets are added to it.

**PowerShell execution policy**
Windows blocks PowerShell scripts by default as a security measure.
`RemoteSigned` is the standard developer setting — allows locally run scripts
while still blocking unsigned scripts from the internet.

---

### Sprint 1 — Group A: Repository Setup
**Date:** 2026-06-11  
**Status:** ✅ Complete

#### What Was Built
- GitHub repository created: `vladmarkov80/budget-app`
- Repository cloned to `D:\Projects\budget-app`
- `dev` branch created and pushed to GitHub
- Project opened in VS Code

#### Key Concepts Learned

**What a Git repository is**
A repository is the container for your entire project — all files plus the complete
history of every change ever made. The history is what makes Git powerful, not
just the files themselves.

**Branch strategy**
```
main   ← production only — stable, working code
dev    ← active development — all work happens here
feature/xxx  ← individual features, branched from dev
```
Work flows: `feature/xxx` → merge into `dev` → merge into `main` for release.
Never work directly on `main`.

**Why code is pushed to GitHub**
1. Collaboration — other developers always have the same version
2. Safety net — if your laptop dies, the code survives on GitHub
3. Deployment — Vercel pulls directly from GitHub to deploy

**Windows drive navigation in Command Prompt**
Changing drives in Windows requires typing the drive letter first:
```
D:          ← switches to D drive
cd Projects ← then navigate normally
```
Simply typing `cd D:\Projects` from C: drive does not work.

---

### Sprint 1 — Group B: Next.js Initialisation
**Date:** 2026-06-11  
**Status:** ✅ Complete

#### What Was Built
- Next.js 14 project created with `create-next-app`
- TypeScript, Tailwind CSS, ESLint, App Router all configured
- Application verified running at `http://localhost:3000`

#### Choices Made During Setup

| Option | Choice | Reason |
|--------|--------|--------|
| TypeScript | Yes | Type safety — catches bugs at compile time |
| ESLint | Yes | Code quality checker — enforces consistent style |
| Tailwind CSS | Yes | Utility-first CSS framework |
| `src/` directory | Yes | Keeps source code separate from config files |
| App Router | Yes | Modern Next.js routing — required for our architecture |
| Turbopack | No | Still experimental — standard webpack is more stable |
| Import alias | `@/*` | Allows `import x from '@/lib/utils'` instead of `../../lib/utils` |

#### Key Concepts Learned

**What `package.json` is**
The project's identity card and instruction manual. It records:
- The project name and version
- Every library the project depends on (`dependencies`)
- Every library only needed during development (`devDependencies`)
- Scripts you can run (`npm run dev`, `npm run build`, etc.)
When someone clones the repo, `package.json` tells npm exactly what to install.

**dependencies vs devDependencies**
- `dependencies`: packages needed for the app to run in production (React, Next.js)
- `devDependencies`: packages only needed during development (TypeScript, ESLint, Tailwind build tools)
Only `dependencies` are installed on the production server.

**What `strict: true` does in tsconfig.json**
Forces TypeScript to be thorough rather than lenient. Without it, TypeScript allows
vague code — variables that could be a string or null without handling both cases.
With `strict: true`, you must handle every possibility explicitly.
This prevents an entire category of runtime crashes.

**What the `content` array does in tailwind.config.ts**
Tailwind scans your files and generates only the CSS classes you actually used.
The `content` array tells Tailwind which files to scan.
If a file is not listed, Tailwind will not generate CSS for classes inside it.
Result: instead of shipping every possible CSS class (megabytes), only what the
project actually uses is shipped (kilobytes).

**What `layout.tsx` is**
The root shell that wraps every page in the application.
Think of it as the picture frame — every page is a painting inside it.
It sets the HTML document structure, loads fonts, applies global CSS.
Later, the sidebar and header will live here.

**How Next.js App Router routing works**
The file location is the URL — no separate router configuration needed:
```
src/app/page.tsx                    → /
src/app/transactions/page.tsx       → /transactions
src/app/budgets/page.tsx            → /budgets
src/app/(dashboard)/overview/page.tsx → /overview
```
Every `page.tsx` file is a route. The folder name becomes the URL segment.
Route groups (folders in parentheses) organise files without affecting the URL.

---

### Sprint 1 — Group D: PostgreSQL & Prisma Setup
**Date:** 2026-06-14  
**Status:** ✅ Complete

#### What Was Built
- PostgreSQL database `budgetapp_dev` created via pgAdmin
- Prisma installed (`prisma` as devDependency, `@prisma/client` as dependency)
- Prisma initialised with `npx prisma init --datasource-provider postgresql`
- `dotenv` installed; `prisma.config.ts` reconfigured to load `.env.local` (single source of truth for secrets)
- Placeholder `.env` deleted; `.env` added to `.gitignore` as defense in depth
- First migration run: `User` table created via `npx prisma migrate dev --name init`
- Prisma Client generated manually via `npx prisma generate`
- Verified in pgAdmin: `User` and `_prisma_migrations` tables exist in `budgetapp_dev`

#### Full Schema Built — All 8 Tables (2026-06-16)

| Table | Migration Name | Status |
|-------|---------------|--------|
| User | init | ✅ Migrated |
| Household | add_household | ✅ Migrated |
| HouseholdMember | add_household_member | ✅ Migrated |
| Category | add_category | ✅ Migrated |
| Transaction | add_transaction | ✅ Migrated |
| Budget | add_budget | ✅ Migrated |
| SavingsGoal | add_savings_goal | ✅ Migrated |
| AIInsight | add_ai_insight | ✅ Migrated |

All tables verified in both pgAdmin and Prisma Studio (`localhost:5555`).

#### Key Concepts Learned

**Prisma 7 changed the config workflow**
Older Prisma versions read `DATABASE_URL` automatically from `.env`. Prisma 7 introduced
`prisma.config.ts`, which uses the `dotenv` library to load env files — and `dotenv`
defaults to reading `.env`, not `.env.local`. We explicitly pointed it at `.env.local`
with `dotenv.config({ path: ".env.local" })` so there is one single source of truth
for secrets, matching Next.js's own convention.

**Prisma 7 generates a different kind of client**
Instead of generating into `node_modules/@prisma/client` (old behaviour), Prisma 7
writes readable TypeScript source files into `src/generated/prisma/`. This folder
is gitignored — it is fully regenerable from `schema.prisma` via `npx prisma generate`,
so it does not belong in Git. Always import from `src/generated/prisma/client`, not
from the folder root.

**Prisma 7 requires a database adapter**
Prisma 7 no longer connects to the database automatically from a connection string.
You must install `@prisma/adapter-pg` and pass an adapter instance into `PrismaClient`:
```typescript
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

**Anatomy of a Prisma model**
```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
}
```
- `model User` → creates a table named `User`
- `@id` → marks the primary key
- `@default(uuid())` → auto-generates a UUID value for new rows
- `@unique` → database-enforced uniqueness constraint
- `String?` (with `?`) → optional / nullable column
- `@default(now())` → sets the value automatically on creation
- `@updatedAt` → updates the value automatically on every change

**Foreign keys and relations — two fields working together**
When a table needs to reference another table, two fields are always required:

1. A scalar field — the actual database column storing the ID:
   `createdById String`

2. A relation field — no database column; a TypeScript navigation shortcut:
   `createdBy User @relation(fields: [createdById], references: [id])`

The database stores only the UUID in `createdById`. When your code accesses
`household.createdBy`, Prisma runs a SQL JOIN behind the scenes and returns
the full User object. Without the relation field, you would only have a raw
UUID string — useless on its own.

**Reverse relations are required on both sides**
Prisma requires both sides of every relation to be declared. If `Household`
has a `createdBy User` relation, then `User` must have a `households Household[]`
field. This field has no database column — it is purely a TypeScript navigation hint.
Prisma will refuse to run if either side is missing.

**Junction tables — solving many-to-many relationships**
A database column can only hold one value. You cannot store multiple household IDs
in a single `userId` column. A junction table solves this by turning one
many-to-many relationship into two one-to-many relationships.

`HouseholdMember` is our junction table:
```
User ──────< HouseholdMember >────── Household
```
Each row represents one membership. One user, one household, one role.
A user can appear many times (once per household) — but never twice in the same household.

**Composite unique constraints**
`@@unique([userId, householdId])` means the *combination* of both values must be unique.
This is different from `@unique` on `userId` alone, which would limit a user to one
household ever. The composite constraint allows:
- User A → Household X ✅
- User A → Household Y ✅
- User A → Household X again ❌ (blocked)

**Self-referencing relations**
A table can reference itself. `Category` has a `parentId` that points to another
row in the same `Category` table — enabling subcategories like Food → Groceries.
Self-referencing relations require a name label so Prisma knows which direction is which:
```prisma
parent   Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
children Category[] @relation("CategoryChildren")
```

**Enums — enforced value lists**
An enum defines a fixed set of allowed values. The database rejects anything else.
```prisma
enum Role {
  OWNER
  MEMBER
}
```
Used for: `Role` (OWNER/MEMBER), `TransactionType` (INCOME/EXPENSE), `AIInsightType`
(BUDGET_ANALYSIS/MEAL_PLAN). Enums prevent typos and invalid data at the database level.

**Why `amount` uses Decimal, not Float**
`Float` cannot represent most decimal fractions exactly.
`0.1 + 0.2 = 0.30000000000000004` in float arithmetic — a silent, dangerous bug in
financial software. `Decimal @db.Decimal(12, 2)` is exact: up to 12 digits total,
always 2 after the decimal point. Always use Decimal for money.

**Never store calculated fields**
Fields like "budget remaining" or "goal progress percentage" are never stored in
the database. They are calculated at query time from source data.
Stored calculated fields go stale the moment their source data changes — causing
silent bugs where the displayed value no longer matches reality.

**`date` vs `createdAt` on Transaction**
These are two different things:
- `date` — when the money actually moved (e.g. Tuesday)
- `createdAt` — when the record was entered into the app (e.g. Thursday)
You might enter last Tuesday's grocery run on Thursday. Always store both.

**The Prisma singleton pattern**
`src/lib/prisma.ts` exports one shared Prisma client instance. Every API route
imports from this file — never creates its own client directly.

Why: Next.js in development hot-reloads modules. Each hot reload would create a new
database connection. The singleton stores the instance on `globalThis` so it survives
hot reloads and the connection pool is never exhausted.

**`npx` vs `npm`**
`npm` manages packages (install, uninstall, run scripts).
`npx` runs a tool — either one installed locally in the project, or downloads it
temporarily. Prisma CLI commands always use `npx prisma ...`.

**Seed scripts**
A seed script populates the database with initial data. Run with `npx prisma db seed`.
Used to create test users, households, and default categories so development can
proceed without manually entering data. Never commit real passwords or personal data
in a seed script — use placeholder values.

#### Mistakes Made and Lessons Learned

| Mistake | What Happened | Fix | Lesson |
|---------|--------------|-----|--------|
| Cloned repo to wrong drive | `cd D:\Projects` did not switch drives — cloned to C: instead | Deleted clone, switched with `D:` first, cloned again | On Windows, switching drives requires typing the drive letter (`D:`) before using `cd` |
| PowerShell blocked npx | Execution policy prevented running npm scripts | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` | Windows security setting — standard fix for developers |
| README conflict on init | `create-next-app` refused to run because README.md existed | Deleted README.md first, then ran the command | `create-next-app` requires an empty directory |
| Manually moved project to new folder, lost `.git` | Moved files via Explorer; `.git` folder (hidden) was left behind | Moved the orphaned `.git` folder with `Move-Item` | Never move a Git repo manually via file explorer — hidden `.git` folders get left behind |
| `Rename-Item` / `Remove-Item` not recognized | Commands are PowerShell-only; terminal had switched to Command Prompt | Used cmd equivalents: `ren`, `rmdir /s /q`, `del` | PowerShell and Command Prompt have different command sets |
| `create-next-app` refused due to existing `.env` files | `.env.local` and `.env.example` were already in the target folder | Temporarily moved both files, ran installer, moved back | `create-next-app` requires an empty directory |
| Prisma generate not run after adding models | Seed script failed because `src/generated/prisma/client` was out of date | Run `npx prisma generate` after every schema change | Always regenerate the client after modifying `schema.prisma` |
| Wrong import path for generated client | Importing from folder root instead of `client.ts` | Changed import to `../src/generated/prisma/client` | Prisma 7 requires importing from `client.ts` directly, not the folder |
| `&&` command chaining fails on Windows | `cd prisma && ts-node seed.ts` does not work in PowerShell or cmd | Used `tsx` runner from project root instead | Windows does not support `&&` chaining in all shell contexts — use `tsx` |
| CSS warnings for `@tailwind` in VS Code | VS Code does not understand Tailwind directives by default | Install "Tailwind CSS IntelliSense" extension | These are editor warnings only — the app runs correctly regardless |

---

## Current Status

**Project location:** `D:\budget-app`  
**Branch:** `dev`  
**Last commit:** `feat: complete database schema, migrations, prisma singleton, and seed script`  
**Database:** All 8 tables migrated and verified. Seed data present (Vladimir / Markov Family / 5 categories).  
**Prisma Studio:** Accessible at `localhost:5555` via `npx prisma studio`

### What Has Been Committed

| Commit | Description |
|--------|-------------|
| `ebafa48` | Initial commit (main) |
| `2bbe97f` | chore: initialise Next.js project with TypeScript, Tailwind, and App Router |
| `dffe17d` | feat: configure Prisma with PostgreSQL and add User model |
| `fb73e4e` | feat: complete database schema, migrations, prisma singleton, and seed script |

---

## What Comes Next

**Pick up here next session:** Sprint 1, Group E — Verification tasks, then Sprint 2.

**Group E tasks (short — complete these first):**
- Run `npm run type-check` (or `npx tsc --noEmit`) and confirm zero TypeScript errors
- Confirm Prisma Studio shows all 8 tables with seed data
- Confirm dev server still runs at `localhost:3000`
- Push any remaining uncommitted changes

**Then Sprint 2 — Authentication:**
This is the first feature sprint. We will implement:
- User registration (POST /api/auth/register)
- NextAuth.js login with credentials provider
- Session management (JWT in httpOnly cookie)
- Protected route middleware — redirect unauthenticated users to /login
- Login and register pages (UI)

Authentication must be complete before any other feature — every API route
depends on knowing who the caller is.

**VS Code housekeeping (do before Sprint 2):**
Install the "Tailwind CSS IntelliSense" extension to eliminate the CSS `@tailwind`
warnings in the editor. Search for it in the Extensions panel (Ctrl+Shift+X).

---

## Vocabulary Reference

| Term | Plain English Definition |
|------|--------------------------|
| Repository | Container for a project — all files plus their complete change history |
| Branch | A parallel version of the code — changes stay isolated until merged |
| Commit | A saved snapshot of changes with a descriptive message |
| Push | Upload local commits to GitHub |
| Clone | Download a GitHub repository to your local machine |
| Migration | A recorded change to the database schema — applied in order |
| ORM | Object-Relational Mapper — lets you query the database using TypeScript instead of SQL |
| Schema | The definition of what tables and fields exist in the database |
| Seed | A script that populates the database with initial data |
| Environment variable | A configuration value stored outside the code (e.g. passwords, API keys) |
| Junction table | A table that connects two other tables in a many-to-many relationship |
| UUID | Universally Unique Identifier — a random ID that reveals nothing about the data |
| REST API | A set of URL endpoints that a frontend calls to read and write data |
| Middleware | Code that runs between a request arriving and the route handler responding |
| Type safety | The guarantee that a variable holds the type of data you expect |
| Foreign key | A column that stores the ID of a row in another table — creates a link between tables |
| Relation | A Prisma-only field (no database column) that lets code navigate between linked models |
| Scalar field | A real database column — stores an actual value (string, number, date) |
| Composite unique | A uniqueness constraint across multiple columns together, not individually |
| Enum | A fixed list of allowed values enforced at the database level |
| Singleton | A pattern ensuring only one instance of something exists — used for the Prisma client |
| Adapter | A connector between Prisma and the specific database driver (e.g. `@prisma/adapter-pg`) |
| Self-referencing relation | A table row that points to another row in the same table (e.g. Category parent/child) |

---

*This journal is updated after every completed task or learning milestone.
The goal is not just to record what was done — but to record what was understood.*
