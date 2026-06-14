# API.md — API Design Reference

> **Status:** Planning  
> **Last Updated:** 2026-06-09  
> **Version:** 0.2.0

---

## 1. Design Philosophy

This application uses a **REST API** built on Next.js API Routes (App Router).
Every data operation the frontend performs goes through these routes.
No database queries happen directly in page components.

**Five principles that govern every route:**

1. **Authenticate first** — reject requests with no valid session before doing anything else
2. **Validate input** — every incoming request body is validated with Zod before touching the database
3. **Authorize explicitly** — after knowing *who* the caller is, confirm they are *allowed* to access the target resource (i.e. the requested `householdId` must match the caller's membership)
4. **Return consistently** — every response, success or error, uses the same JSON envelope
5. **Never leak internals** — error messages describe what went wrong for the user, not stack traces or database errors

---

## 2. Base URL

```
Development:   http://localhost:3000/api
Production:    https://your-app.vercel.app/api
```

All routes below are relative to `/api`.

---

## 3. Response Envelope

Every API response — success or failure — returns JSON in this exact shape:

```json
{
  "data": { ... } | null,
  "error": null | "Human-readable error message",
  "meta": { ... } | null
}
```

| Field | When populated | Purpose |
|-------|---------------|---------|
| `data` | On success | The requested or created resource |
| `error` | On failure | A plain-English description of what went wrong |
| `meta` | On list responses | Pagination or aggregate info (e.g. `{ "total": 42 }`) |

**Success example:**
```json
{
  "data": {
    "id": "a3f8...",
    "description": "Lidl weekly shop",
    "amount": 4750.00,
    "type": "EXPENSE"
  },
  "error": null,
  "meta": null
}
```

**List success example:**
```json
{
  "data": [ { ... }, { ... } ],
  "error": null,
  "meta": { "total": 14 }
}
```

**Error example:**
```json
{
  "data": null,
  "error": "Transaction not found.",
  "meta": null
}
```

---

## 4. HTTP Status Codes

| Code | Meaning | When used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST that creates a new resource |
| `400` | Bad Request | Validation failed — malformed input |
| `401` | Unauthorised | No valid session — not logged in |
| `403` | Forbidden | Logged in, but not allowed to access this resource |
| `404` | Not Found | The requested resource does not exist |
| `409` | Conflict | Duplicate record (e.g. budget already exists for this category/month) |
| `429` | Too Many Requests | Rate limit exceeded — client should wait before retrying |
| `500` | Internal Server Error | Unexpected server-side failure |

**Rule:** `401` means "you are not logged in". `403` means "you are logged in but this is not yours."
Never return a `404` when the real reason is `403` -- that leaks the existence of other users' data.

**On 429:** This code is most relevant for AI-powered endpoints (`/ai/analyze`, `/ai/meal-plan`),
which call the OpenAI API and carry a real cost per request. A per-household rate limit
is applied to prevent abuse. When a `429` is returned, the client should display a
message such as "Please wait a moment before generating another analysis" and not
automatically retry.

---

## 5. Authentication

All routes except `POST /auth/register` and the NextAuth routes require a valid session.
Sessions are managed by NextAuth and stored in an httpOnly cookie.

API routes call `getServerSession()` to retrieve the session:
- If no session → return `401`
- If session exists → `session.user.id` is the authenticated user's UUID

---

## 6. Household Scoping

Almost every resource (transactions, budgets, categories, goals, insights) belongs to
a household. Before returning or writing any household-scoped data, the API must confirm
the caller is a member of that household. This is the **authorization check**.

```
1. Get household_id from route params or request body
2. Query HouseholdMember WHERE user_id = session.user.id AND household_id = ?
3. If no record found → return 403 Forbidden
4. If found → proceed with the query
```

This check is not optional and is never skipped.

> **Implementation rule - no exceptions:**
> The mandatory order of operations for every household-scoped route is:
>
> 1. **Authenticate** - verify a valid session exists; reject with `401` if not
> 2. **Verify membership** - confirm the user belongs to the target household; reject with `403` if not
> 3. **Execute query** - only now may the database be queried for household data
> 4. **Return response** - using the standard envelope format
>
> No household data - not even a record count - should be queried before step 2
> succeeds. This rule applies without exception to: Transactions, Budgets,
> Categories, Savings Goals, Reports, and AI Features.
>
> Skipping or reordering these steps is a security vulnerability, not a shortcut.

---

## 7. Endpoint Reference

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/[...nextauth]` | NextAuth handler: login, logout, session |

**POST /auth/register**
```
Request body:  { name, email, password }
Response 201:  { data: { id, name, email }, error: null, meta: null }
Response 400:  Validation error (missing fields, invalid email, weak password)
Response 409:  Email already registered
```

---

### Households

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households` | List all households the current user belongs to |
| `POST` | `/households` | Create a new household |
| `GET` | `/households/[id]` | Get a single household by ID |
| `PATCH` | `/households/[id]` | Update household name or currency |

> **MVP note:** Member invitation endpoints are deferred to a post-MVP phase.
> When a household is created, one `HouseholdMember` record (`role: OWNER`) is
> created automatically for the creating user.

**POST /households**
```
Request body:  { name, currency? }
Response 201:  { data: { id, name, currency, createdAt }, error: null, meta: null }
```

---

### Categories

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households/[id]/categories` | List all categories for a household |
| `POST` | `/households/[id]/categories` | Create a new category |
| `PATCH` | `/categories/[id]` | Update a category name, icon, or colour |
| `DELETE` | `/categories/[id]` | Delete a category (blocked if transactions exist) |

**GET /households/[id]/categories**
```
Query params:  type? (INCOME | EXPENSE — filter by type)
Response 200:  { data: [ { id, name, icon, color, type, isDefault } ], error: null, meta: { total } }
```

---

### Transactions

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households/[id]/transactions` | List transactions with filters |
| `POST` | `/households/[id]/transactions` | Record a new transaction |
| `GET` | `/transactions/[id]` | Get a single transaction |
| `PATCH` | `/transactions/[id]` | Edit a transaction |
| `DELETE` | `/transactions/[id]` | Delete a transaction |

**GET /households/[id]/transactions**
```
Query params:  month (1–12), year, categoryId?, type? (INCOME | EXPENSE)
Response 200:  { data: [ Transaction ], error: null, meta: { total, totalIncome, totalExpenses } }
```

**POST /households/[id]/transactions**
```
Request body:  { categoryId, type, amount, description, date, notes? }
Response 201:  { data: Transaction, error: null, meta: null }
Response 400:  Validation error
Response 403:  User is not a member of this household
```

---

### Budgets

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households/[id]/budgets` | List budgets for a month with spent amounts |
| `POST` | `/households/[id]/budgets` | Set a category budget |
| `PATCH` | `/budgets/[id]` | Update a budget amount |
| `DELETE` | `/budgets/[id]` | Remove a budget for a category/month |

**GET /households/[id]/budgets**
```
Query params:  month (required), year (required)
Response 200:  {
                 data: [
                   {
                     id, categoryId, categoryName, amount,
                     spent,        ← calculated from transactions
                     remaining,    ← amount - spent
                     percentage    ← (spent / amount) * 100
                   }
                 ],
                 error: null,
                 meta: { totalBudgeted, totalSpent }
               }
```

**POST /households/[id]/budgets**
```
Request body:  { categoryId, amount, month, year }
Response 201:  { data: Budget, error: null, meta: null }
Response 409:  Budget already exists for this category/month
```

---

### Reports

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households/[id]/reports/monthly` | Monthly income vs. expenses summary |
| `GET` | `/households/[id]/reports/categories` | Spending breakdown by category for a period |

**GET /households/[id]/reports/monthly**
```
Query params:  months? (default: 6) — how many months of history to return
Response 200:  {
                 data: [
                   { month, year, totalIncome, totalExpenses, net }
                 ],
                 error: null,
                 meta: null
               }
```

**GET /households/[id]/reports/categories**
```
Query params:  month (required), year (required)
Response 200:  {
                 data: [
                   { categoryId, categoryName, color, totalSpent, percentage }
                 ],
                 error: null,
                 meta: { grandTotal }
               }
```

---

### Savings Goals

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/households/[id]/goals` | List savings goals |
| `POST` | `/households/[id]/goals` | Create a savings goal |
| `PATCH` | `/goals/[id]` | Update goal amount, saved amount, or status |
| `DELETE` | `/goals/[id]` | Delete a goal |

**GET /households/[id]/goals**
```
Query params:  status? (ACTIVE | COMPLETED | ARCHIVED — default: ACTIVE)
Response 200:  {
                 data: [
                   {
                     id, name, description, targetAmount, savedAmount,
                     deadline, status,
                     progressPercentage   ← (savedAmount / targetAmount) * 100
                   }
                 ],
                 error: null,
                 meta: { total }
               }
```

> **savedAmount - MVP behaviour:** `savedAmount` is stored directly in the database
> and updated manually by the user through the application. When a user makes progress
> toward a goal, they update the value themselves via `PATCH /goals/[id]`.
> There is no automatic calculation from transactions in the MVP.
>
> **savedAmount - future behaviour:** In a later version, savings progress may be
> calculated automatically from `Transaction` records assigned to a specific savings
> goal (via a `savingsGoalId` foreign key on `Transaction`). At that point,
> `savedAmount` would become a derived value rather than a stored one, consistent
> with how budget `spent` amounts are handled today. This automation is not part
> of the MVP.

---

### AI Features

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/households/[id]/ai/analyze` | Generate a budget analysis insight |
| `POST` | `/households/[id]/ai/meal-plan` | Generate a weekly meal plan |
| `GET` | `/households/[id]/ai/insights` | Retrieve stored AI insights |

**POST /households/[id]/ai/analyze**
```
Request body:  { month, year }
Process:       1. Fetch transactions and budgets for the given month
               2. Assemble context (totals, category breakdown, budget vs. spent)
               3. Call the configured OpenAI model with a structured prompt
               4. Save result to AIInsight table (type: BUDGET_ANALYSIS)
               5. Return result
Response 201:  { data: { id, type, content, generatedAt }, error: null, meta: null }
Response 429:  Rate limit — too many AI requests for this household
```

**POST /households/[id]/ai/meal-plan**
```
Request body:  { month?, year? }  ← optional context for seasonal awareness
Process:       1. Fetch household budget context
               2. Assemble seasonal ingredient guidance for the region and month
               3. Call the configured OpenAI model with a structured prompt
               4. Save result to AIInsight table (type: MEAL_PLAN)
               5. Return result
Response 201:  { data: { id, type, content, generatedAt }, error: null, meta: null }
```

**GET /households/[id]/ai/insights**
```
Query params:  type? (BUDGET_ANALYSIS | MEAL_PLAN), limit? (default: 5)
Response 200:  { data: [ AIInsight ], error: null, meta: { total } }
```

> **AI Insights scope - implementation note:**
> Generation endpoints (`POST /ai/analyze` and `POST /ai/meal-plan`) are core MVP
> features. Generated insights are always saved to the `AIInsight` table so results
> can be displayed without re-calling the OpenAI API.
>
> The retrieval and history endpoint (`GET /ai/insights`) is part of the MVP plan
> but may be simplified or postponed if implementation complexity outweighs its
> value during MVP delivery. At minimum, each generation endpoint returns the
> newly created insight in its response, so the UI can always display the latest
> result without a separate retrieval call. A full history view is the part that
> may be deferred.

---

## 8. Validation Rules

All input validation uses **Zod** schemas defined in `src/lib/validations.ts`.
The same schema is used for both client-side form validation and server-side API validation.

**Common rules:**
- `amount` — positive number, max 2 decimal places, max value 9,999,999,999.99
- `month` — integer 1–12
- `year` — integer 2000–2100
- `currency` — 3-character uppercase string (ISO 4217)
- `email` — valid email format, max 255 characters
- `password` — minimum 8 characters (additional rules TBD)
- `description` — non-empty string, max 255 characters
- `date` — valid ISO date string (YYYY-MM-DD), not more than 1 year in the future

---

## 9. Error Handling Conventions

**Validation errors (400)** return the Zod error details in the `error` field:
```json
{
  "data": null,
  "error": "amount: Must be a positive number. date: Required.",
  "meta": null
}
```

**Server errors (500)** return a generic message — never expose stack traces or
database error messages to the client:
```json
{
  "data": null,
  "error": "An unexpected error occurred. Please try again.",
  "meta": null
}
```

**Rule:** Log the full error server-side (console.error or a logging service).
Return only a safe, human-readable message to the client.

---

## 10. Route Naming Conventions

Routes follow a consistent pattern:

- Collection operations on a household resource:
  `GET|POST /households/[id]/transactions`
- Single resource operations:
  `GET|PATCH|DELETE /transactions/[id]`

This means `household_id` is always a route parameter for list/create operations,
and the resource's own `id` is used for read/update/delete operations.
This keeps routes clean and avoids redundant ID passing in request bodies.

---

## 11. Computed Fields

Several values returned by the API are **computed at request time** and are never
stored in the database. This is intentional - derived values stored in the database
go stale when their source data changes, causing inconsistency bugs that are hard
to trace.

**Rule: store source data only. Calculate derived values on every request.**

| Computed field | Endpoint | Calculation |
|----------------|----------|-------------|
| `spent` | `GET /budgets` | `SUM(transaction.amount)` for the category and month |
| `remaining` | `GET /budgets` | `budget.amount - spent` |
| `percentage` | `GET /budgets` | `(spent / budget.amount) * 100` |
| `net` | `GET /reports/monthly` | `totalIncome - totalExpenses` |
| `totalIncome` | `GET /reports/monthly` | `SUM` of INCOME transactions for the period |
| `totalExpenses` | `GET /reports/monthly` | `SUM` of EXPENSE transactions for the period |
| `percentage` | `GET /reports/categories` | `(categoryTotal / grandTotal) * 100` |
| `progressPercentage` | `GET /goals` | `(savedAmount / targetAmount) * 100` |

These fields appear in API responses but have no corresponding column in the database.
When implementing a route that returns computed fields, calculate them in the route
handler after the database query, before constructing the response object.

---

*This document is the authoritative reference for API design.
When routes are implemented, they must match this specification.
Any deviations are recorded in DECISIONS.md.*
