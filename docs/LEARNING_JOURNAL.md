LEARNING_JOURNAL.md — Vladimir's Dev Journey

Started: 2026-06-08
Last Updated: 2026-06-11
Project: Family Budgeting Application
Stack: Next.js · TypeScript · Tailwind CSS · PostgreSQL · Prisma

Purpose of This Journal

This journal records what was built, what was learned, and what was understood
at each stage of the project. It is not a task list — it is a record of growth.

A task being in this journal means:

It was completed
It was understood well enough to explain in plain language

Phase 0 — Documentation & Architecture

Period: 2026-06-08
Status: ✅ Complete

What Was Built

The complete project documentation suite before any application code was written.
Seven markdown documents that define the entire blueprint of the application.

Documents Created

DocumentPurposePROJECT.mdProject overview, goals, tech stack, MVP definitionARCHITECTURE.mdSystem design, folder structure, data access patternsDATABASE.mdFull data model — all 8 tables with fields, types, constraints, indexes, examplesAPI.mdREST API design — all endpoints, request/response shapes, error conventionsROADMAP.md6-phase development plan with tasks, deliverables, learning objectivesDECISIONS.mdArchitecture Decision Records — why each major choice was madeSPRINTS.mdSprint structure, phase-to-sprint mapping, Sprint 1 execution plan

Key Concepts Learned

Documentation-first development
Writing documentation before code forces clarity. If you cannot explain what you
are building in plain language, you do not understand it well enough to build it.
Every hour spent on documentation saves multiple hours of confused coding later.

Database design — relational thinking
A relational database organises data into tables that reference each other.
The key insight: data belongs to the right owner.

Financial data (transactions, budgets, goals) belongs to a Household, not a User
This makes the permission model simple: if you are a member of the household, you see its data
A HouseholdMember junction table connects users to households (many-to-many relationship)

Why UUIDs instead of integers for primary keys

Integers reveal information: user with id=4 means only 3 others exist
UUIDs reveal nothing: a3f8c21d-7b4e-4c9a-b0d2-1e5f8a3c6d90
UUIDs can be generated before inserting a row, which simplifies some workflows

Why DECIMAL and not FLOAT for money
Floating point numbers cannot represent most decimal fractions exactly.
0.1 + 0.2 = 0.30000000000000004 in float arithmetic.
DECIMAL(12,2) is exact. Always use DECIMAL for financial data.

Never store calculated fields
Fields like "budget remaining" or "goal progress percentage" are never stored.
They are always calculated at query time from source data.
Stored calculated fields go stale when their source data changes — causing silent bugs.

REST API design
Every resource follows a predictable pattern:

GET /resource — list
POST /resource — create
PATCH /resource/[id] — update
DELETE /resource/[id] — delete

Every API response uses the same envelope shape:

json{ "data": { ... }, "error": null, "meta": null }

The five-step data access pattern
Every API route must follow this order — no exceptions:

Authenticate — is there a valid session?
Validate input — does the data match the expected shape?
Authorize — does this user have access to this household?
Query database — only now do we touch the database
Return response — always in the standard envelope format

Architecture Decision Records (ADRs)
Every major technical decision is documented with:

What was decided
What alternatives were considered
Why this option was chosen
What trade-offs were accepted

This answers "why did we do it this way?" months later when the reason is forgotten.

MVP Scope Defined

Included in Version 1:
Authentication, Households, Categories, Transactions, Budgets,
Reports, Savings Goals, AI Budget Analysis, AI Meal Planning, Deployment.

Explicitly excluded from Version 1:
Grocery integrations, price comparison, open banking, mobile apps,
multi-currency, advanced invitation workflows, recurring transaction automation.

Phase 1 — Project Foundation

Period: 2026-06-11
Status: 🔵 In progress — Sprint 1

Environment Setup

Date: 2026-06-11
Status: ✅ Complete

What Was Installed

ToolVersionPurposeNode.jsv24.16.0Runs Next.js and all JavaScript toolingnpmv11.13.0Package manager — installs project librariesGitv2.54.0Version controlVS Codev1.104.1Code editorPostgreSQLv18DatabasepgAdmin 4LatestGUI for managing the database

What Was Configured

Git identity: user.name = Vladimir, user.email = markovic.marker@gmail.com
Git default branch: main
PowerShell execution policy: RemoteSigned (required to run npm scripts on Windows)
SSH key generated and registered on GitHub (type: ed25519)
GitHub account: vladmarkov80

Key Concepts Learned

Why Node.js is installed first
Everything else depends on it. Next.js runs on Node.js. npm comes bundled with it.
Without Node.js, no other tools in the stack can run.

What npm is
npm (Node Package Manager) installs and manages libraries. When you run
npm install, it reads package.json and downloads every dependency listed there
into a node_modules folder. This folder is never committed to Git — it can always
be recreated from package.json.

SSH keys — how they work
SSH uses a pair of cryptographic keys:

Private key: stored on your machine only (id_ed25519) — never shared
Public key: registered on GitHub (id_ed25519.pub) — safe to share
When you push code, GitHub checks if your private key matches the public key on file.
If they match, you are authenticated without a password.

Why .env.local must never be committed
Environment variables store secrets (database passwords, API keys).
If committed to Git, they are in the history permanently — even if deleted later.
The .gitignore file tells Git to ignore specific files. .env.local must always
be listed there before any secrets are added to it.

PowerShell execution policy
Windows blocks PowerShell scripts by default as a security measure.
RemoteSigned is the standard developer setting — allows locally run scripts
while still blocking unsigned scripts from the internet.

Sprint 1 — Group A: Repository Setup

Date: 2026-06-11
Status: ✅ Complete

What Was Built

GitHub repository created: vladmarkov80/budget-app
Repository cloned to D:\Projects\budget-app
dev branch created and pushed to GitHub
Project opened in VS Code

Key Concepts Learned

What a Git repository is
A repository is the container for your entire project — all files plus the complete
history of every change ever made. The history is what makes Git powerful, not
just the files themselves.

Branch strategy

main ← production only — stable, working code
dev ← active development — all work happens here
feature/xxx ← individual features, branched from dev

Work flows: feature/xxx → merge into dev → merge into main for release.
Never work directly on main.

Why code is pushed to GitHub

Collaboration — other developers always have the same version
Safety net — if your laptop dies, the code survives on GitHub
Deployment — Vercel pulls directly from GitHub to deploy

Windows drive navigation in Command Prompt
Changing drives in Windows requires typing the drive letter first:

D: ← switches to D drive
cd Projects ← then navigate normally

Simply typing cd D:\Projects from C: drive does not work.

Sprint 1 — Group B: Next.js Initialisation

Date: 2026-06-11
Status: 🔵 In progress

What Was Built

Next.js 14 project created with create-next-app
TypeScript, Tailwind CSS, ESLint, App Router all configured
Application verified running at http://localhost:3000

Choices Made During Setup

OptionChoiceReasonTypeScriptYesType safety — catches bugs at compile timeESLintYesCode quality checker — enforces consistent styleTailwind CSSYesUtility-first CSS frameworksrc/ directoryYesKeeps source code separate from config filesApp RouterYesModern Next.js routing — required for our architectureTurbopackNoStill experimental — standard webpack is more stableImport alias@/\*Allows import x from '@/lib/utils' instead of ../../lib/utils

Key Concepts Learned

What package.json is
The project's identity card and instruction manual. It records:

The project name and version
Every library the project depends on (dependencies)
Every library only needed during development (devDependencies)
Scripts you can run (npm run dev, npm run build, etc.)
When someone clones the repo, package.json tells npm exactly what to install.

dependencies vs devDependencies

dependencies: packages needed for the app to run in production (React, Next.js)
devDependencies: packages only needed during development (TypeScript, ESLint, Tailwind build tools)
Only dependencies are installed on the production server.

What strict: true does in tsconfig.json
Forces TypeScript to be thorough rather than lenient. Without it, TypeScript allows
vague code — variables that could be a string or null without handling both cases.
With strict: true, you must handle every possibility explicitly.
This prevents an entire category of runtime crashes.

What the content array does in tailwind.config.ts
Tailwind scans your files and generates only the CSS classes you actually used.
The content array tells Tailwind which files to scan.
If a file is not listed, Tailwind will not generate CSS for classes inside it.
Result: instead of shipping every possible CSS class (megabytes), only what the
project actually uses is shipped (kilobytes).

What layout.tsx is
The root shell that wraps every page in the application.
Think of it as the picture frame — every page is a painting inside it.
It sets the HTML document structure, loads fonts, applies global CSS.
Later, the sidebar and header will live here.

How Next.js App Router routing works
The file location is the URL — no separate router configuration needed:

src/app/page.tsx → /
src/app/transactions/page.tsx → /transactions
src/app/budgets/page.tsx → /budgets
src/app/(dashboard)/overview/page.tsx → /overview

Every page.tsx file is a route. The folder name becomes the URL segment.
Route groups (folders in parentheses) organise files without affecting the URL.

Mistakes Made and Fixed

MistakeWhat HappenedFixLessonCloned repo to wrong drivecd D:\Projects did not switch drives — cloned to C: insteadDeleted clone, switched with D: first, cloned againOn Windows, switching drives requires typing the drive letter (D:) before using cdPowerShell blocked npxExecution policy prevented running npm scriptsSet-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSignedWindows security setting — standard fix for developersREADME conflict on initcreate-next-app refused to run because README.md existedDeleted README.md first, then ran the commandcreate-next-app requires an empty directory

Vocabulary Reference

TermPlain English DefinitionRepositoryContainer for a project — all files plus their complete change historyBranchA parallel version of the code — changes stay isolated until mergedCommitA saved snapshot of changes with a descriptive messagePushUpload local commits to GitHubCloneDownload a GitHub repository to your local machineMigrationA recorded change to the database schema — applied in orderORMObject-Relational Mapper — lets you query the database using TypeScript instead of SQLSchemaThe definition of what tables and fields exist in the databaseSeedA script that populates the database with initial dataEnvironment variableA configuration value stored outside the code (e.g. passwords, API keys)Junction tableA table that connects two other tables in a many-to-many relationshipUUIDUniversally Unique Identifier — a random ID that reveals nothing about the dataREST APIA set of URL endpoints that a frontend calls to read and write dataMiddlewareCode that runs between a request arriving and the route handler respondingType safetyThe guarantee that a variable holds the type of data you expect

What Comes Next

Currently in progress: Sprint 1, Group B — Task B4 (configuring .gitignore and .env.local)

Remaining Sprint 1 tasks:

B4: Configure .gitignore and create .env.local
B5: Install and configure ESLint + Prettier
B6: Verify .env.local is gitignored
Group C: Environment configuration
Group D: PostgreSQL and Prisma setup
Group E: Verification and first commit
