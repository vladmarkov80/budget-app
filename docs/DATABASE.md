# DATABASE.md — Data Model Reference

> **Status:** Planning
> **Last Updated:** 2026-06-08
> **Version:** 0.1.0

---

## How to Read This Document

Each table is documented with:
- **Purpose** — why this table exists and what real-world concept it represents
- **Fields** — every column with its type, nullability, and meaning
- **Relationships** — how this table connects to others
- **Constraints** — rules the database enforces automatically
- **Indexes** — which columns are indexed and why
- **Example record** — a concrete row to make it tangible

### Data Type Conventions

| Symbol | Meaning |
|--------|---------|
| `PK` | Primary Key — uniquely identifies each row |
| `FK` | Foreign Key — references a row in another table |
| `UNIQUE` | No two rows may share this value |
| `NOT NULL` | The column must always have a value |
| `DEFAULT` | Value applied automatically if none is provided |
| `?` after type | The column is nullable (optional) |

### On UUIDs vs. Auto-Increment IDs

All primary keys in this application use **UUID** (Universally Unique Identifier),
not auto-incrementing integers (1, 2, 3...).

**Why UUIDs?**
- Integers reveal information: a user with `id=4` tells an attacker there are only 3
  other users. A UUID reveals nothing.
- UUIDs can be generated on the client or server before the row is inserted, which
  simplifies some workflows.
- IDs never collide if you later merge data from two databases.

**Trade-off:** UUIDs are larger (36 characters vs. a small integer) and slightly slower
to index. At the scale of a family budgeting app, this is completely irrelevant.

**UUID example:** `a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90`

---

## Table Index

1. [User](#1-user)
2. [Household](#2-household)
3. [HouseholdMember](#3-householdmember)
4. [Category](#4-category)
5. [Transaction](#5-transaction)
6. [Budget](#6-budget)
7. [SavingsGoal](#7-savingsgoal)
8. [AIInsight](#8-aiinsight)
9. [Entity Relationship Overview](#9-entity-relationship-overview)
10. [Design Decisions & Notes](#10-design-decisions--notes)

---

## 1. User

### Purpose

Stores the identity and credentials of every person who has registered with the
application. A user is an individual human — not a family, not a household.
One person, one record.

This table is intentionally minimal. It stores only what is needed for authentication.
All financial data belongs to the `Household`, not to the `User` directly.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier for the user |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier. Case-insensitive in practice. |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash of the password. Never the plain password. |
| `name` | VARCHAR(100) | NOT NULL | Display name shown in the UI |
| `avatar_url` | TEXT | NULL | Optional profile picture URL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the account was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last time any field changed |

**Note on `password_hash`:** The application never stores the user's actual password.
bcrypt takes the plain password and produces a one-way hash. At login, we hash the
submitted password again and compare. Even if the database is compromised, the
attacker cannot recover passwords from hashes.

**Note on `TIMESTAMPTZ`:** This stores the timestamp *with timezone* (UTC).
Always store timestamps in UTC and convert to local time in the UI.

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `HouseholdMember` | One-to-many | One user can be a member of multiple households |
| `Transaction` | One-to-many | Tracks which user recorded each transaction |

### Constraints

- `email` must be unique across the entire table — no two accounts share an email.
- `password_hash` is never returned to the client in any API response.
- Deleting a user must be handled carefully — their transactions remain in the household
  for other members to see (soft-delete or reassignment strategy, deferred to v2).

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `users_pkey` | `id` | Primary (auto) | Row lookup by ID |
| `users_email_idx` | `email` | Unique | Login lookup — runs on every login attempt |

### Example Record

```
id:            a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90
email:         vladimir@example.com
password_hash: $2b$12$KIXzR5h1f3mN8pQwLvT4uO9sY7dG2jB6nE0cA1xZqWmP4oU8rVk
name:          Vladimir
avatar_url:    null
created_at:    2026-01-15 09:23:44+00
updated_at:    2026-01-15 09:23:44+00
```

---

## 2. Household

### Purpose

Represents a family or budgeting unit. All financial data — transactions, budgets,
categories, goals — belongs to a household, not to an individual user.

This is the **central organisational unit** of the application. When a user logs in,
they are always operating within the context of a specific household.

A single user can belong to multiple households. For example:
- "Marković Family" — shared with spouse
- "Vladimir Personal" — individual tracking

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Display name, e.g. "Marković Family Budget" |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'RSD' | ISO 4217 currency code |
| `created_by` | UUID | FK → User.id, NOT NULL | The user who created this household |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Note on `currency`:** We store the ISO 4217 three-letter code (RSD, EUR, USD).
This allows the UI to format amounts correctly and display the right symbol.
For v1 we support a single currency per household. Multi-currency is a v2 concern.

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `HouseholdMember` | One-to-many | A household has one or more members |
| `Category` | One-to-many | All categories belong to a household |
| `Transaction` | One-to-many | All transactions belong to a household |
| `Budget` | One-to-many | All budgets belong to a household |
| `SavingsGoal` | One-to-many | All goals belong to a household |
| `AIInsight` | One-to-many | All AI analyses belong to a household |
| `User` (via `created_by`) | Many-to-one | Reference to the creating user |

### Constraints

- `created_by` must reference a valid `User.id`.
- `currency` should be validated in application code against a known list of ISO codes.
- A household cannot be deleted if it has transactions (enforce in application logic,
  not just database — show the user a confirmation warning).

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `households_pkey` | `id` | Primary (auto) | Row lookup by ID |
| `households_created_by_idx` | `created_by` | Standard | Finding all households a user created |

### Example Record

```
id:          c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
name:        Marković Family Budget
currency:    RSD
created_by:  a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90
created_at:  2026-01-15 09:30:00+00
updated_at:  2026-01-15 09:30:00+00
```

---

## 3. HouseholdMember

### Purpose

The **junction table** that connects `User` and `Household`. It exists because the
relationship between users and households is **many-to-many**: one user can belong
to many households, and one household can have many users.

This table also carries the `role` field — it is not just a connection, it defines
*what kind of* member the user is.

**Why a junction table and not a direct relationship?**
If a user could only ever belong to one household, we could put `household_id` directly
on the `User` table. But since a user can belong to multiple households, we need a
separate row per user-household pair. That is exactly what a junction table is.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier for this membership |
| `user_id` | UUID | FK → User.id, NOT NULL | The member |
| `household_id` | UUID | FK → Household.id, NOT NULL | The household |
| `role` | ENUM | NOT NULL, DEFAULT 'MEMBER' | Either `OWNER` or `MEMBER` |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When this membership was created |

**The `role` ENUM values:**

| Value | Permissions |
|-------|------------|
| `OWNER` | Full access: edit household settings, manage members, manage categories, all financial data |
| `MEMBER` | Can add and edit their own transactions, view all household data, cannot change settings |

**Important:** Every household must always have at least one `OWNER`. The application
must prevent the last owner from leaving or being removed.

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `User` | Many-to-one | The user this membership belongs to |
| `Household` | Many-to-one | The household this membership belongs to |

### Constraints

- The combination of `(user_id, household_id)` must be **unique** — a user cannot
  be a member of the same household twice.
- `role` is an ENUM — only the defined values are accepted. The database rejects anything else.
- Deleting a `User` should cascade-delete their `HouseholdMember` records.
- Deleting a `Household` should cascade-delete all its `HouseholdMember` records.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `hm_pkey` | `id` | Primary (auto) | Row lookup |
| `hm_user_household_idx` | `(user_id, household_id)` | Unique | Prevent duplicate memberships; fast lookup |
| `hm_household_idx` | `household_id` | Standard | Listing all members of a household |
| `hm_user_idx` | `user_id` | Standard | Listing all households a user belongs to |

### Example Records

```
--- Household owner ---
id:           e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b
user_id:      a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90   ← Vladimir
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
role:         OWNER
joined_at:    2026-01-15 09:30:00+00

--- Household member (spouse) ---
id:           f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c
user_id:      b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e   ← Ana
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
role:         MEMBER
joined_at:    2026-01-15 10:05:00+00
```

---

## 4. Category

### Purpose

Categories are the labels that organise transactions and budgets. Every transaction
is assigned to one category. Every budget is set for one category.

Examples of categories: Groceries, Rent, Utilities, Dining Out, Healthcare,
Clothing, Entertainment, Savings Transfer.

Categories belong to a **household**, not to an individual user. All members of a
household share the same category list.

The application ships with a set of **default categories** (created by the seed script
when a new household is set up). Households can add, rename, or remove categories.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `household_id` | UUID | FK → Household.id, NOT NULL | Which household owns this category |
| `name` | VARCHAR(50) | NOT NULL | Display name, e.g. "Groceries" |
| `icon` | VARCHAR(50) | NOT NULL, DEFAULT 'tag' | Icon name from the icon library (e.g. 'shopping-cart') |
| `color` | VARCHAR(7) | NOT NULL, DEFAULT '#6B7280' | Hex color code for UI display |
| `type` | ENUM | NOT NULL, DEFAULT 'EXPENSE' | `INCOME` or `EXPENSE` — which transaction type this is for |
| `is_default` | BOOLEAN | NOT NULL, DEFAULT false | Whether this was created by the seed script |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | Controls display order in the UI |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Note on `type`:** Categories are typed — an "Income" category (e.g. Salary, Freelance)
is separate from an "Expense" category (e.g. Groceries, Rent). This prevents
nonsensical combinations like a "Salary" budget or a "Groceries" income entry.

**Note on `color`:** Stored as a 7-character hex string including the `#` prefix.
Example: `#10B981` (green). Used to color-code category chips and chart segments.

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `Household` | Many-to-one | The household this category belongs to |
| `Transaction` | One-to-many | Transactions tagged with this category |
| `Budget` | One-to-many | Monthly budgets set for this category |

### Constraints

- `(household_id, name)` must be unique — no duplicate category names within a household.
- Categories with existing transactions should not be hard-deleted. Mark as archived instead
  (an `archived_at` timestamp column can be added in v2).
- `color` must be a valid 7-character hex string — validated in application code.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `categories_pkey` | `id` | Primary (auto) | Row lookup |
| `categories_household_idx` | `household_id` | Standard | Fetching all categories for a household |
| `categories_household_name_idx` | `(household_id, name)` | Unique | Prevent duplicate names per household |

### Default Categories (seeded)

**Expense categories:** Groceries, Rent / Mortgage, Utilities, Transport,
Dining Out, Healthcare, Clothing, Entertainment, Education, Personal Care,
Household Supplies, Insurance, Savings Transfer, Other Expenses.

**Income categories:** Salary, Freelance Income, Other Income.

### Example Record

```
id:           d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
name:         Groceries
icon:         shopping-cart
color:        #10B981
type:         EXPENSE
is_default:   true
sort_order:   1
created_at:   2026-01-15 09:30:01+00
```

---

## 5. Transaction

### Purpose

The core financial record. Every time money moves — earned or spent — a transaction
is recorded. This is the most frequently written and read table in the application.

A transaction is always one of two types:
- **INCOME** — money received (salary, freelance payment, gift)
- **EXPENSE** — money spent (groceries, rent, coffee)

All reports, budget calculations, and AI analysis are derived from this table.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `household_id` | UUID | FK → Household.id, NOT NULL | Which household this belongs to |
| `category_id` | UUID | FK → Category.id, NOT NULL | What category this is tagged with |
| `created_by` | UUID | FK → User.id, NOT NULL | Which user entered this transaction |
| `type` | ENUM | NOT NULL | `INCOME` or `EXPENSE` |
| `amount` | DECIMAL(12, 2) | NOT NULL | The monetary value. Always positive. |
| `description` | VARCHAR(255) | NOT NULL | What this transaction was for |
| `date` | DATE | NOT NULL | The date the transaction occurred (not entered) |
| `notes` | TEXT | NULL | Optional longer note or memo |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the record was last edited |

**Note on `amount`:** Amounts are always stored as **positive numbers**.
The `type` field (INCOME or EXPENSE) provides the sign. Never store negative amounts.
This prevents confusion like: is `-500` an expense of 500 or a correction to an income?

**Note on `DECIMAL(12, 2)`:**
- `12` is the total number of digits
- `2` is the digits after the decimal point
- This allows values up to `9,999,999,999.99` — more than enough
- **Never use FLOAT for money.** Floating point arithmetic introduces rounding errors.
  `0.1 + 0.2 = 0.30000000000000004` in float math. DECIMAL is exact.

**Note on `date` vs `created_at`:** These are different fields on purpose.
`date` is when the expense *happened* — the user may enter yesterday's grocery receipt today.
`created_at` is when the *database row* was created. Reports use `date`, not `created_at`.

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `Household` | Many-to-one | The household this transaction belongs to |
| `Category` | Many-to-one | The category this transaction is tagged with |
| `User` | Many-to-one | The user who entered this transaction |

### Constraints

- `amount` must be greater than 0. A zero-amount transaction is meaningless.
- `date` cannot be more than 1 year in the future (validate in application code).
- `type` must match the `type` of the assigned `category`
  (e.g. you cannot tag an INCOME transaction with an EXPENSE category).
  This is enforced in application code, not at the database level.
- Deleting a category that has transactions is not allowed without reassignment.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `transactions_pkey` | `id` | Primary (auto) | Row lookup |
| `transactions_household_date_idx` | `(household_id, date)` | Standard | Monthly report queries — most common query pattern |
| `transactions_household_category_idx` | `(household_id, category_id)` | Standard | Category breakdown queries |
| `transactions_created_by_idx` | `created_by` | Standard | Finding transactions by a specific user |

**Why these indexes?** The two most common queries will be:
1. "Give me all transactions for this household in March 2026" → uses `household_id + date`
2. "Give me total spending per category this month" → uses `household_id + category_id`

These indexes make those queries fast even with years of data.

### Example Records

```
--- Expense ---
id:           b5c6d7e8-f9a0-1b2c-3d4e-5f6a7b8c9d0e
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
category_id:  d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a   ← Groceries
created_by:   a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90
type:         EXPENSE
amount:       4750.00
description:  Lidl weekly shop
date:         2026-06-05
notes:        null
created_at:   2026-06-06 08:15:00+00
updated_at:   2026-06-06 08:15:00+00

--- Income ---
id:           c6d7e8f9-a0b1-2c3d-4e5f-6a7b8c9d0e1f
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
category_id:  e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b   ← Salary
created_by:   a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90
type:         INCOME
amount:       120000.00
description:  June salary
date:         2026-06-01
notes:        null
created_at:   2026-06-01 14:00:00+00
updated_at:   2026-06-01 14:00:00+00
```

---

## 6. Budget

### Purpose

Defines how much a household plans to spend in a given category for a given month.
This is the zero-based budgeting core: before the month starts, every category gets
an allocation. The application then tracks actual spending against that allocation.

A `Budget` record is the **plan**. A `Transaction` is the **reality**.
The gap between them is what the reports show.

A budget is always scoped to a specific month and year — it is not a rolling or annual limit.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `household_id` | UUID | FK → Household.id, NOT NULL | Which household this budget belongs to |
| `category_id` | UUID | FK → Category.id, NOT NULL | Which category this budget covers |
| `amount` | DECIMAL(12, 2) | NOT NULL | The planned spending limit for this category |
| `month` | SMALLINT | NOT NULL | Calendar month: 1 (January) through 12 (December) |
| `year` | SMALLINT | NOT NULL | Calendar year: e.g. 2026 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Note on `month` and `year` as integers:** An alternative is to store a single
`DATE` field (e.g. `2026-03-01` to represent March 2026). Integers are used here
because:
1. The first-of-month convention is implicit, not natural
2. Querying `WHERE month = 3 AND year = 2026` reads more clearly than
   `WHERE period = '2026-03-01'`
3. It prevents ambiguity about whether the date represents the start or end of the period

**Note on `amount`:** A budget of 0 is permitted — it means the household explicitly
decided to spend nothing in this category this month. This is different from no budget
record existing (which means the category was not budgeted at all).

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `Household` | Many-to-one | The household this budget belongs to |
| `Category` | Many-to-one | The category being budgeted |

### Constraints

- `(household_id, category_id, month, year)` must be **unique** — only one budget
  record per category per month per household.
- `amount` must be >= 0.
- `month` must be between 1 and 12.
- `year` must be a reasonable value (e.g. 2020–2100) — validated in application code.
- A budget should only be set for EXPENSE categories. Income categories do not have
  budgets — income forecasting is a v2 feature.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `budgets_pkey` | `id` | Primary (auto) | Row lookup |
| `budgets_household_period_idx` | `(household_id, year, month)` | Standard | Fetching all budgets for a given month |
| `budgets_unique_idx` | `(household_id, category_id, month, year)` | Unique | Prevent duplicate budgets |

### How Budget vs. Spent Is Calculated

The `Budget` table stores only the planned amount. The actual spent amount is
**not stored** — it is calculated at query time:

```
spent = SUM of Transaction.amount
        WHERE household_id = ?
        AND category_id = ?
        AND type = 'EXPENSE'
        AND MONTH(date) = ?
        AND YEAR(date) = ?

remaining = budget.amount - spent
percentage = (spent / budget.amount) * 100
```

This is correct. Storing `spent` in the budget row would create a **derived field** —
data that can be calculated from other data. Derived fields cause bugs: they go out
of sync when source data changes. Always calculate, never store.

### Example Record

```
id:           f7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c
household_id: c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
category_id:  d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a   ← Groceries
amount:       20000.00
month:        6
year:         2026
created_at:   2026-05-30 19:00:00+00
updated_at:   2026-05-30 19:00:00+00
```

*Interpretation: In June 2026, the Marković household planned to spend 20,000 RSD on groceries.*

---

## 7. SavingsGoal

### Purpose

Represents a financial target a household is working toward. Examples:
- Emergency fund (3 months of expenses)
- Vacation to Greece
- New laptop
- Car down payment

Goals have a target amount, a current saved amount, and an optional deadline.
The application tracks progress and can surface goals in the AI analysis.

Unlike budgets (which reset monthly), a savings goal persists until it is completed
or deleted.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `household_id` | UUID | FK → Household.id, NOT NULL | Which household owns this goal |
| `name` | VARCHAR(100) | NOT NULL | Display name, e.g. "Greece Vacation" |
| `description` | TEXT | NULL | Optional longer description |
| `target_amount` | DECIMAL(12, 2) | NOT NULL | The total amount to reach |
| `saved_amount` | DECIMAL(12, 2) | NOT NULL, DEFAULT 0.00 | How much has been saved so far |
| `deadline` | DATE | NULL | Optional target completion date |
| `status` | ENUM | NOT NULL, DEFAULT 'ACTIVE' | `ACTIVE`, `COMPLETED`, or `ARCHIVED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Note on `saved_amount`:** Unlike `Budget` where spent is calculated from transactions,
`saved_amount` is stored directly here. Why the difference?

Savings contributions are not always transaction-based. A user might manually update
how much they've set aside. In v2, we can link a "Savings Transfer" transaction to
auto-increment this value, but for v1 manual updates keep it simple.

**Note on `status`:**
- `ACTIVE` — in progress
- `COMPLETED` — target reached; kept for historical reference
- `ARCHIVED` — abandoned; hidden from the main view but not deleted

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `Household` | Many-to-one | The household this goal belongs to |

### Constraints

- `target_amount` must be greater than 0.
- `saved_amount` must be >= 0 and should not exceed `target_amount` (warn in UI, don't block).
- `deadline` if set, should be in the future (warn if setting a past deadline).
- Status transitions: `ACTIVE → COMPLETED`, `ACTIVE → ARCHIVED`. Not reversible in v1.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `goals_pkey` | `id` | Primary (auto) | Row lookup |
| `goals_household_idx` | `household_id` | Standard | Fetching all goals for a household |
| `goals_household_status_idx` | `(household_id, status)` | Standard | Fetching only active goals |

### Example Record

```
id:            a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d
household_id:  c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
name:          Greece Vacation
description:   Two weeks in Crete, August 2027
target_amount: 250000.00
saved_amount:  47500.00
deadline:      2027-07-01
status:        ACTIVE
created_at:    2026-02-01 10:00:00+00
updated_at:    2026-06-01 09:30:00+00
```

*Interpretation: The household is saving for a Greece vacation. Target: 250,000 RSD.
Saved so far: 47,500 RSD (19%). Deadline: 1 July 2027.*

---

## 8. AIInsight

### Purpose

Stores AI-generated content produced for a household. Every time the AI analysis
or meal planner is run, the output is saved here. This serves two purposes:

1. **Display** — show the most recent insight without calling the AI API again
2. **History** — allow the household to review past analyses

AI API calls cost money. Storing results means we only regenerate when the user
explicitly requests it, not on every page load.

### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Unique identifier |
| `household_id` | UUID | FK → Household.id, NOT NULL | Which household this insight belongs to |
| `type` | ENUM | NOT NULL | `BUDGET_ANALYSIS`, `MEAL_PLAN`, or `SAVINGS_ADVICE` |
| `content` | TEXT | NOT NULL | The full AI-generated text |
| `context_snapshot` | JSONB | NULL | The data that was sent to the AI (for debugging) |
| `model_used` | VARCHAR(50) | NOT NULL | Which AI model generated this (e.g. 'gpt-4o') |
| `period_month` | SMALLINT | NULL | If analysis was for a specific month |
| `period_year` | SMALLINT | NULL | If analysis was for a specific year |
| `generated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the AI produced this |

**Note on `context_snapshot`:** This stores the data we *sent* to the AI as JSONB
(JSON stored in the database with indexing support). This is invaluable for debugging:
if the AI gives a strange response, you can see exactly what context it received.
It is also the privacy audit trail — you can verify what financial data was sent.

**Note on `JSONB` vs `TEXT`:** PostgreSQL's `JSONB` type stores JSON in a binary
format that supports indexing and querying. `TEXT` just stores a string.
Since we only read the snapshot back (never query inside it), `TEXT` would technically
work, but `JSONB` communicates intent: this column holds structured data.

**Note on `type` ENUM values:**
- `BUDGET_ANALYSIS` — a review of the household's spending patterns for a given month
- `MEAL_PLAN` — a weekly meal plan with recipes and estimated costs
- `SAVINGS_ADVICE` — targeted advice based on savings goals progress

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| `Household` | Many-to-one | The household this insight belongs to |

### Constraints

- `content` must not be empty.
- `period_month` and `period_year` must both be set or both be null — they are paired.
- Old insights are not deleted automatically — up to the user to clear history.
  Consider a retention policy (e.g. keep last 12 insights per type) in v2.

### Indexes

| Index | Column(s) | Type | Reason |
|-------|-----------|------|--------|
| `insights_pkey` | `id` | Primary (auto) | Row lookup |
| `insights_household_type_idx` | `(household_id, type)` | Standard | Fetching latest insight of a given type |
| `insights_household_generated_idx` | `(household_id, generated_at DESC)` | Standard | Showing insight history in chronological order |

### Example Record

```
id:               b0c1d2e3-f4a5-6b7c-8d9e-0f1a2b3c4d5e
household_id:     c7d2e1f0-4a3b-4c8d-9e0f-1a2b3c4d5e6f
type:             BUDGET_ANALYSIS
content:          "In May 2026, your household spent 87% of its total budget.
                   Your Groceries category was 12% over the 20,000 RSD limit at
                   22,380 RSD. Dining Out was under budget by 3,200 RSD. Your
                   largest area of opportunity is Dining Out consolidation with
                   meal planning — estimated monthly saving of 4,000–6,000 RSD..."
context_snapshot: {"month":5,"year":2026,"totalIncome":120000,
                   "totalExpenses":104300,"categories":[...]}
model_used:       gpt-4o
period_month:     5
period_year:      2026
generated_at:     2026-06-01 10:15:00+00
```

---

## 9. Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   User ──────────────< HouseholdMember >──────────── Household      │
│     │                   (role: OWNER                    │           │
│     │                         MEMBER)                   │           │
│     │                                         ┌─────────┴──────┐   │
│     │                                         │                │   │
│     │                                      Category         Budget  │
│     │                                         │     (one per        │
│     │                                         │      category       │
│     └──────────────────────────────> Transaction  per month)        │
│          (created_by)                   │                           │
│                                         │ (tagged with)             │
│                                         └──────── Category          │
│                                                                     │
│                                      SavingsGoal                    │
│                                      AIInsight                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

All financial tables (Category, Transaction, Budget,
SavingsGoal, AIInsight) belong to Household.
```

### Relationship Summary Table

| From | To | Type | Via |
|------|----|------|-----|
| User | Household | Many-to-many | HouseholdMember |
| Household | Category | One-to-many | household_id |
| Household | Transaction | One-to-many | household_id |
| Household | Budget | One-to-many | household_id |
| Household | SavingsGoal | One-to-many | household_id |
| Household | AIInsight | One-to-many | household_id |
| Category | Transaction | One-to-many | category_id |
| Category | Budget | One-to-many | category_id |
| User | Transaction | One-to-many | created_by |

---

## 10. Design Decisions & Notes

### Why all amounts are positive
Storing negative amounts to represent expenses leads to constant sign confusion:
is `-4750` an expense, a correction, or an error? Instead, the `type` field on
`Transaction` (INCOME or EXPENSE) carries the sign semantics. All arithmetic is done
by the application, not by relying on positive/negative conventions.

### Why not store calculated fields
Fields like "amount spent this month" or "budget remaining" or "goal progress percentage"
are **never stored**. They are always calculated at query time from source data.
Storing calculated fields causes synchronisation bugs: if a transaction is edited or
deleted, any stored totals become stale. Calculate, never cache in the database.

### Why DECIMAL and not FLOAT for money
Floating-point numbers (FLOAT, DOUBLE) cannot represent most decimal fractions exactly.
`0.1` in binary float is actually `0.1000000000000000055511151231257827021181583404541015625`.
For financial data, these tiny errors compound and produce incorrect totals.
`DECIMAL(12, 2)` stores exact decimal values. Always use DECIMAL for money.

### Why separate `date` and `created_at` on Transaction
A user enters a grocery receipt on Sunday that they paid for on Friday.
The transaction `date` is Friday. The `created_at` is Sunday.
Reports must use `date` — otherwise, entering last week's expenses distorts this week's totals.
`created_at` is for auditing: when was this record entered into the system.

### On soft deletes
This schema uses hard deletes (rows are permanently removed). For a v1 application
with a small user base this is acceptable. In v2, consider adding `deleted_at TIMESTAMPTZ NULL`
to `Transaction` and `Category` — a soft-delete pattern that keeps the row but hides
it from queries. This enables undo operations and audit trails.

---

*This document is the authoritative reference for the database model.
When the Prisma schema is written, it must match this document exactly.
Any deviations are recorded as decisions in DECISIONS.md.*
