# SPRINTS.md — Sprint Planning Reference

> **Status:** Planning  
> **Last Updated:** 2026-06-09  
> **Version:** 0.2.0

---

## 1. Sprint Structure

Each sprint is **one week long**. This is short enough to stay focused and
catch problems early, but long enough to complete a meaningful unit of work.

A sprint has five components:

| Component | Description |
|-----------|-------------|
| **Objectives** | What this sprint produces — stated as outcomes, not tasks |
| **Learning goals** | The concepts you should understand by the end |
| **Tasks** | The concrete, ordered steps to execute |
| **Deliverables** | What can be demonstrated or verified when the sprint ends |
| **Definition of Done** | The checklist that must pass before the sprint is closed |

Sprints do not overlap. A sprint is not closed until its Definition of Done is fully met.
If tasks are not finished, they are carried forward — not abandoned.

---

## 2. Phase-to-Sprint Mapping

| Phase | Description | Sprints |
|-------|-------------|---------|
| Phase 0 | Documentation & Architecture | Pre-sprint (complete) |
| Phase 1 | Project Foundation | Sprint 1, Sprint 2 |
| Phase 2 | Households & Transactions | Sprint 3, Sprint 4, Sprint 5 |
| Phase 3 | Budgeting Engine | Sprint 6, Sprint 7 |
| Phase 4 | Reports & Savings Goals | Sprint 8, Sprint 9 |
| Phase 5 | AI Features | Sprint 10, Sprint 11 |
| Phase 6 | Polish & Production | Sprint 12, Sprint 13 |

This is a planning estimate. Sprint boundaries may shift as the project progresses.
What does not shift: phases are completed in order, and no phase begins before the
previous one is done.

---

## 3. Definition of Done — Global Rules

These rules apply to every sprint without exception:

- [ ] All tasks listed in the sprint are complete
- [ ] The application runs without errors (`npm run dev` starts cleanly)
- [ ] No TypeScript errors (`npm run type-check` passes)
- [ ] No secrets are committed to the repository (`.env.local` is in `.gitignore`)
- [ ] All new files follow the naming conventions in PROJECT.md
- [ ] ROADMAP.md task statuses are updated to reflect completed work
- [ ] A commit exists with a meaningful message describing what was built

---

## 4. Sprint Log

| Sprint | Phase | Status | Dates |
|--------|-------|--------|-------|
| Sprint 1 | Phase 1 — Foundation | 🔵 Ready to start | TBD |
| Sprint 2 | Phase 1 — Foundation | ⬜ Not started | TBD |
| Sprint 3 | Phase 2 — Households | ⬜ Not started | TBD |
| Sprint 4 | Phase 2 — Transactions | ⬜ Not started | TBD |
| Sprint 5 | Phase 2 — Validation & Auth | ⬜ Not started | TBD |
| Sprint 6 | Phase 3 — Budgeting | ⬜ Not started | TBD |
| Sprint 7 | Phase 3 — Budget UI | ⬜ Not started | TBD |
| Sprint 8 | Phase 4 — Reports | ⬜ Not started | TBD |
| Sprint 9 | Phase 4 — Goals | ⬜ Not started | TBD |
| Sprint 10 | Phase 5 — AI Analysis | ⬜ Not started | TBD |
| Sprint 11 | Phase 5 — Meal Planning | ⬜ Not started | TBD |
| Sprint 12 | Phase 6 — Polish | ⬜ Not started | TBD |
| Sprint 13 | Phase 6 — Deployment | ⬜ Not started | TBD |

---

## 5. Sprint 1 — Project Foundation

**Phase:** 1 — Foundation  
**Status:** 🔵 Ready to start  
**Goal:** A working, correctly configured project skeleton with database connectivity verified.

---

### What We Are Building

A bare Next.js project that is correctly wired together end-to-end:
repository → project files → TypeScript → Tailwind → Prisma → PostgreSQL.

No pages. No authentication. No business logic. No UI beyond the default Next.js
welcome screen. The output of this sprint is infrastructure, not features.

This matters because every sprint from here builds on this foundation.
A misconfigured TypeScript setup or a broken database connection will silently
corrupt work for weeks. Getting this right first, cleanly, is the professional approach.

**Primary objectives of Sprint 1 — in priority order:**

1. Project setup — initialise the repository and Next.js application
2. Development environment setup — Node.js version, editor config, ESLint, Prettier
3. Tooling validation — confirm TypeScript compiles, Tailwind applies, `npm run dev` starts
4. Database connectivity verification — Prisma connects to PostgreSQL; at least one migration runs successfully

Sprint 1 is complete when the foundation works and is understood.
It is not complete when all eight application tables exist but the developer cannot
explain what a migration is or why `DATABASE_URL` must not be committed.

> **Learning priority note:**
> When a time conflict arises between completing a task and understanding it,
> choose understanding. It is always acceptable — and encouraged — to spend extra
> time on any of the following before moving forward:
>
> - **Git** — branching, commits, `.gitignore`, pushing to GitHub
> - **TypeScript** — what the compiler does, what `strict: true` enables
> - **PostgreSQL** — what a database is, how to connect to it, what a table looks like
> - **Prisma** — what the schema file is, how `migrate dev` works, what `generate` produces
> - **Environment variables** — what `.env.local` is for, why secrets must never be committed
>
> Future sprints assume this knowledge. Rushing through Sprint 1 creates debt that
> surfaces as confusion in every sprint that follows.

> **Completion standard — understanding over copy-paste:**
> A Sprint 1 task that was completed through copy-paste without comprehension is
> technically done but not educationally done.
>
> A task is only fully complete when you can answer all three of these questions
> about every tool or file it involved:
>
> 1. **What does it do?** — describe the tool or file in plain language
> 2. **Why does it exist?** — explain the problem it solves
> 3. **How does it fit into this project?** — connect it to the application being built
>
> If you cannot answer these for a task you have "completed", stop and revisit it
> before moving to the next one. This is not a slow approach — it is the only
> approach that makes future sprints faster rather than harder.

---

### Learning Goals

By the end of Sprint 1, you should be able to explain:

- What `package.json` is and what the key fields (`scripts`, `dependencies`, `devDependencies`) mean
- What `tsconfig.json` controls and why `strict: true` matters
- What Tailwind's `tailwind.config.ts` does and how the `content` array works
- What a Prisma schema is and how it maps to database tables
- What a database migration is — the difference between defining a schema and applying it
- What `DATABASE_URL` is and why it must never be committed to Git
- What `.gitignore` does and which files must always be in it
- What `npm run dev`, `npx prisma generate`, and `npx prisma migrate dev` each do

---

### Tasks

Tasks are listed in dependency order. Do not skip ahead.

#### Group A — Repository Setup

| # | Task | Notes |
|---|------|-------|
| A1 | Create a new GitHub repository named `budget-app` | Initialise with a README; set default branch to `main` |
| A2 | Clone the repository to your local machine | `git clone <url>` |
| A3 | Create a `dev` branch from `main` | All development work happens on `dev` or `feature/` branches |

#### Group B — Next.js Project Initialisation

| # | Task | Notes |
|---|------|-------|
| B1 | Run `create-next-app` inside the cloned repo | Use TypeScript: yes, Tailwind: yes, App Router: yes, `src/` directory: yes |
| B2 | Verify the project starts | `npm run dev` → open `http://localhost:3000` |
| B3 | Review and understand every generated file | See "What to read" below |
| B4 | Configure `tsconfig.json` | Confirm `strict: true` is set; understand what it does |
| B5 | Install and configure ESLint + Prettier | `.eslintrc.json` and `.prettierrc` |
| B6 | Add `.env.local` to `.gitignore` | Verify it is listed before creating any `.env` file |

**Files to read and understand after B1:**
```
package.json          ← scripts, dependencies
tsconfig.json         ← TypeScript compiler options
tailwind.config.ts    ← content paths, theme
next.config.ts        ← Next.js build configuration
src/app/layout.tsx    ← root layout component
src/app/page.tsx      ← the home page (this is what you see at localhost:3000)
```

#### Group C — Environment Configuration

| # | Task | Notes |
|---|------|-------|
| C1 | Create `.env.local` in the project root | This file is never committed |
| C2 | Create `.env.example` in the project root | This file is committed — it contains no real values |
| C3 | Add `DATABASE_URL` placeholder to `.env.example` | `DATABASE_URL="postgresql://user:password@host:5432/dbname"` |

#### Group D — PostgreSQL & Prisma Setup

| # | Task | Notes |
|---|------|-------|
| D1 | Create a local PostgreSQL database | Name it `budgetapp_dev`; use pgAdmin or the `psql` CLI |
| D2 | Add the real `DATABASE_URL` to `.env.local` | Point it at `budgetapp_dev` |
| D3 | Install Prisma | `npm install prisma --save-dev` and `npm install @prisma/client` |
| D4 | Initialise Prisma | `npx prisma init` — this creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env` |
| D5 | Move `DATABASE_URL` from `.env` to `.env.local` | Prisma creates `.env` by default; we use `.env.local` for Next.js compatibility |
| D6 | Write the Prisma schema | See schema approach note below — choose Option A or Option B |
| D7 | Run the first migration | `npx prisma migrate dev --name init` |
| D8 | Verify migration in the database | Open pgAdmin or `psql` and confirm your migrated tables exist |
| D9 | Run `npx prisma generate` | Generates the TypeScript client types |
| D10 | Create `src/lib/prisma.ts` | The singleton Prisma client (pattern explained below) |
| D11 | Write and run the seed script | `prisma/seed.ts` — minimum: insert a test record to verify the workflow (see seed note below) |

#### Schema Approach — Option A or Option B (D6 guidance)

Before writing D6, choose one of the following approaches. Both are valid.
The recommended path for a first project is Option A.

**Option A — Minimal schema first (recommended for learning)**

Start with a single simple table to verify the entire workflow end-to-end before
adding complexity. A good starting point is just the `User` table, which has no
foreign keys and no ENUMs.

Once the following are confirmed working:
- `prisma migrate dev` runs without errors
- The table appears in pgAdmin and Prisma Studio
- `prisma generate` completes and the TypeScript client resolves the type

...then expand the schema one or two tables at a time, running a migration after
each addition. This approach makes it immediately obvious which change caused any
error that appears.

**Option B — Full schema immediately**

Translate all eight tables from DATABASE.md into `schema.prisma` in one pass,
then run a single migration.

This is faster if it works, but harder to debug if something goes wrong — a schema
error involving an ENUM or a circular foreign key can be difficult to trace when
eight tables were added simultaneously.

> **Recommendation:** Use Option A if this is your first time working with Prisma
> or database migrations. Use Option B if you are comfortable reading Prisma schema
> syntax and want to match DATABASE.md in a single step.
>
> Whichever option you choose, the full schema must be complete before Sprint 2 begins.
> Option A spreads the work across the sprint; Option B does it all at once.

#### Group E — Verification

| # | Task | Notes |
|---|------|-------|
| E1 | Run `npm run type-check` | Must complete with zero errors |
| E2 | Confirm `prisma studio` opens | `npx prisma studio` → browser opens showing your migrated tables |
| E3 | Confirm seed data is visible in Prisma Studio | Run `npx prisma db seed` → at least one record is visible in each seeded table |
| E4 | Commit all work | Message: `chore: initialise project with Next.js, Prisma, and PostgreSQL` |
| E5 | Push to `dev` branch on GitHub | Confirm the repository looks correct on GitHub |

---

### The Prisma Singleton Pattern (D10 explained)

This is one of the most important patterns in the project. Before writing `prisma.ts`,
understand why it exists.

**The problem:** Next.js hot-reloads modules in development. Every time you save a file,
modules re-execute. If `new PrismaClient()` was called inside each API route file,
every hot-reload would create a new database connection. PostgreSQL has a connection
limit (typically 100). You would exhaust it within minutes of development.

**The solution:** Create one PrismaClient instance and reuse it everywhere.
In development, store it on the Node.js `global` object so hot-reloads find the
existing instance instead of creating a new one.

```
src/lib/prisma.ts will contain:
  - One PrismaClient instance
  - A guard that reuses the global instance in development
  - A default export used by every API route
```

Every API route will import Prisma like this:
```typescript
import prisma from '@/lib/prisma'
```

Never `new PrismaClient()` anywhere else in the codebase.

---

### Seed Script Expectations (D11 guidance)

The purpose of the Sprint 1 seed script is to verify one thing:
**Prisma can successfully insert records into the database.**

This is an infrastructure check, not a data population exercise.

**Minimum acceptable seed content:**
- One test `User` record (or whichever table(s) your chosen schema approach includes)
- One test `Household` record
- Two or three `Category` records with different names

**What this verifies:**
- The `prisma/seed.ts` file executes without TypeScript errors
- The `npx prisma db seed` command runs successfully
- Inserted records are visible in Prisma Studio
- Foreign key relationships resolve correctly (if applicable to the tables seeded)

The seed script will be expanded with full default category data in a later sprint
when the complete schema is in place. For Sprint 1, demonstrating the workflow
matters more than populating production-quality data.

---

### Deliverables

At the end of Sprint 1, the following must all be true:

1. The repository exists on GitHub with a `main` and `dev` branch
2. `npm run dev` starts the application without errors
3. The browser shows the default Next.js page at `http://localhost:3000`
4. `npm run type-check` passes with zero errors
5. `npx prisma studio` opens and shows the migrated schema tables
6. The seed script runs successfully and at least one record is visible per seeded table
7. `.env.local` exists locally but does not appear in the GitHub repository
8. `.env.example` is committed and contains placeholder values only
9. You can explain every file in the "Files to read" list in your own words

---

### Definition of Done — Sprint 1

- [ ] GitHub repository created with `main` and `dev` branches
- [ ] `npm run dev` starts without errors
- [ ] `npm run type-check` passes (zero TypeScript errors)
- [ ] At least one successful Prisma migration has run (tables visible in Prisma Studio or pgAdmin)
- [ ] Seed script runs without errors and inserts at least one visible record
- [ ] `prisma.ts` singleton exists at `src/lib/prisma.ts`
- [ ] `.env.local` is in `.gitignore` and not visible on GitHub
- [ ] `.env.example` is committed with placeholder values
- [ ] You can explain what each generated config file does (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`)
- [ ] You can explain the Prisma migration workflow: schema change → migrate dev → generate
- [ ] Sprint 1 tasks in ROADMAP.md updated to ✅ Complete
- [ ] Final commit pushed to `dev` branch

---

### Common Beginner Mistakes

**1. Committing `.env.local` to Git**
This is the most consequential mistake in this sprint. If a database password or API key
is committed, it is in the Git history permanently — even if you delete the file later.
Check `.gitignore` before your first `git add`. Run `git status` and confirm `.env.local`
does not appear in the list of staged files.

**2. Running migrations against the wrong database**
`DATABASE_URL` controls which database Prisma connects to. If it points at a production
database and you run `migrate dev`, you modify production. Always confirm your
`DATABASE_URL` before running any migration command.

**3. Skipping `npx prisma generate` after schema changes**
The Prisma client TypeScript types are generated from the schema. If you change
`schema.prisma` and do not run `generate`, your code uses stale types. The rule:
any time `schema.prisma` changes, run `generate` immediately after.

**4. Creating multiple `PrismaClient` instances**
If you write `new PrismaClient()` in an API route instead of importing from `src/lib/prisma.ts`,
you bypass the singleton and leak connections. Always import the shared instance.

**5. Using the wrong Node.js version**
Next.js 14 requires Node.js 18.17 or later. Check with `node --version` before starting.
If you have an older version, install a version manager like `nvm`.

**6. Misreading the `create-next-app` prompts**
The CLI asks several questions. The choices for this project:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias (`@/*`): **Yes** (default `@/*` is correct)

Choosing "No" for TypeScript or App Router requires significant rework.

**7. Editing generated migration files**
Prisma generates migration SQL files in `prisma/migrations/`. These are a historical
record — never edit them by hand. If the schema needs to change, edit `schema.prisma`
and run `migrate dev` again to generate a new migration.

---

*Sprint 1 tasks in ROADMAP.md are updated as work progresses.
When Sprint 1 Definition of Done is fully met, update the Sprint Log above
and begin Sprint 2 planning.*
