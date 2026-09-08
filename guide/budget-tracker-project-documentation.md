# Budget Tracker — Project Documentation

A personal budgeting application that manages money on a daily basis,
giving users flexibility to save, underspend, overspend, and still
understand their financial position throughout a budget period. The app
records what users actually do rather than blocking poor decisions, and
continuously recalculates how remaining money should be managed.

This document consolidates everything decided so far: the data model, the
business rules, the technology stack, the API design, the mobile screens,
and the notification plan.

---

## 1. Core Data Model

Six core entities, each scoped under a user's budget:

```
User
 │ 1:N
 ▼
Budget
 ├── 1:N ── Category
 │            ├── 1:N ── Transaction
 │            └── 1:N ── FixedExpense
 ├── 1:N ── Transaction
 ├── 1:N ── FixedExpense
 └── 1:N ── Saving
```

**User** — id, name, email, password, createdAt, updatedAt

**Budget** — id, userId, name, income, startDate, endDate, createdAt, updatedAt
- Represents one budgeting period (e.g. "September Budget").
- The central entity connecting categories, transactions, fixed expenses,
  and savings.

**Saving** — id, budgetId, amount, type (`PLANNED` | `LEFTOVER`), description,
date, createdAt, updatedAt
- `PLANNED`: money set aside deliberately when planning the budget, before
  daily spending is calculated. Reduces the amount available for daily
  budgeting (Income − Planned Savings = Available Budget).
- `LEFTOVER`: money saved from underspending on a given day, when the user
  chooses "Save" instead of "Carry forward."

**Category** — id, budgetId, name, ownerType (`SYSTEM` | `USER`), createdAt,
updatedAt
- Unique per budget: `UNIQUE(budgetId, name)`. Same name can exist across
  different budgets.
- `SYSTEM` categories (Food, Transportation, Utilities, Data,
  Entertainment, Health, Shopping, Other) are auto-created when a budget is
  created.
- `USER` categories are custom, created by the user.

**FixedExpense** — id, budgetId, categoryId, name, amount, createdAt,
updatedAt
- Planned expenses (rent, school fees, electricity). Locked after budget
  creation — no edits or deletes, ever.
- Multiple fixed expenses can share a category.

**Transaction** — id, budgetId, categoryId, amount, description, date,
createdAt, updatedAt
- Represents real money spent. Immutable once its date has passed (see
  Rule 11 below).

---

## 2. Business Rules

### Users & Access
- A user can own multiple independent budgets.
- Two roles: `USER` and `ADMIN`. Admin role only matters for deleting
  SYSTEM categories — it has no other special access.
- A user cannot access another user's data, regardless of role.

### Budgets
- `endDate` must not be before `startDate`.
- **DECIDED:** Once a budget's end date passes, it becomes permanently
  read-only — no new transactions, savings, or fixed expenses, and nothing
  in it can be edited.

### Planned Savings
- Available for budgeting = Income − Planned Savings.

### Fixed Expenses
- Locked after budget creation. No update/delete endpoint exists for them
  at any layer, ever.

### Categories
- Category names unique within a budget.
- Deletion rules:
  1. `SYSTEM` categories cannot be deleted by a normal user — only an
     `ADMIN`.
  2. `USER` categories can be deleted by their owner only if unused (zero
     transactions, zero fixed expenses reference them).
  3. A category with any usage can never be deleted until that usage is
     removed.
- Financial records are never silently destroyed as a side effect of
  category deletion.

### Daily Budget Calculation
- Recommended daily spend = Remaining Available Budget ÷ Remaining Days.
- Recalculated continuously — but only ever looks forward. A day's
  recommendation, once passed, is never rewritten.
- Nothing about this calculation is stored — it's computed fresh every
  time from the permanent transaction/saving ledger. See Rule 11 for why
  this is safe to do.

### Underspending
- If actual spend < recommended, the difference is "leftover."
- User is asked: **Save it** (recorded as `Saving`, type `LEFTOVER`) or
  **Carry it forward** (added to the next day's allowance only — never
  accumulates across more than one day, and nothing is persisted for this
  choice).

### Overspending
- Always allowed. The transaction is recorded in full, and the daily
  recommendation recalculates for all *remaining* days only. The passed
  day's original recommendation is never rewritten.

### Historical Immutability — DECIDED (strict)
- **No transaction or saving dated in the past can ever be added, edited,
  or deleted.** Only today can be created or changed. No backdating,
  no editing yesterday's entries — even to fix a mistake.
- This is what makes "history" reliable without a history table: every
  day's recommendation is a pure function of (planned money − transactions
  dated before that day) ÷ (days remaining as of that day). Since past
  transactions are frozen, that function returns the same answer forever.

### Multi-Client Access — DECIDED
- **Mobile app**: primary client, talks to the backend API.
- **Backend**: single source of truth, authenticates users, serves the
  mobile app.
- **Website**: purely informational — explains what the app does and links
  to download it. No backend calls, no account creation, no password
  reset from the website.

### Sessions — DECIDED (kept simple)
- Basic login/logout only for v1. No multi-device session visibility or
  remote logout. Deferrable addition, not a blocker.

### Guiding Principle
- The system always distinguishes what was *planned* (income, savings,
  fixed expenses, target daily spend) from what *actually happened* (real
  transactions, underspending, overspending, spending beyond budget). The
  app's job is to inform and adapt, never to block.

---

## 3. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile app | React Native | Cross-platform |
| Website | React (JS) | Informational only — explains app features, links to download |
| Backend | Node.js / Express | REST API |
| Database | PostgreSQL | Raw SQL, no ORM — deliberate choice to learn SQL syntax directly |
| Hosting | Render | Backend (Node service) + database (Render's native managed Postgres) on one platform, free tier |
| Mobile framework detail | Expo (managed workflow) | Simplifies push notifications — no Firebase/native cert setup needed |

**Why these choices:**
- PostgreSQL over MySQL/SQL Server: the data model is strictly relational
  with real constraints (unique names per budget, restricted deletes on
  in-use categories, exact decimal money math) that a relational database
  enforces natively. Postgres was chosen over MySQL specifically because
  Render offers it as a fully managed, free-tier database on the same
  platform as the backend — avoiding a second external service, which
  matters given the project has no hosting budget. The learning goal was
  "understand SQL syntax" generally, not MySQL specifically, so this loses
  nothing on that front — Postgres and MySQL share the same core SQL.
- No ORM: deliberate, so raw SQL is written and understood directly rather
  than abstracted away.
- Render over Railway: prior familiarity with Render.

---

## 4. API Design

### Auth
```
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login           { email, password } → access + refresh token
POST   /api/auth/refresh         { refreshToken }
POST   /api/auth/logout          { refreshToken }
```

### Budgets
```
POST   /api/budgets                Create a budget (auto-generates SYSTEM categories)
GET    /api/budgets                List the user's budgets
GET    /api/budgets/:id            Get one budget
PUT    /api/budgets/:id            Update name/income/dates — only before endDate passes
```

### Categories
```
POST   /api/budgets/:budgetId/categories    Create a USER category
GET    /api/budgets/:budgetId/categories    List categories for a budget
DELETE /api/categories/:id                  Delete (server enforces USER-owned + unused)
```

### Fixed Expenses
```
POST   /api/budgets/:budgetId/fixed-expenses    Create (only before budget locks)
GET    /api/budgets/:budgetId/fixed-expenses    List
```
No update/delete endpoints exist — matches the locking rule.

### Transactions
```
POST   /api/budgets/:budgetId/transactions      Create (date is always today)
GET    /api/budgets/:budgetId/transactions      List, filterable by ?date= or ?categoryId=
GET    /api/transactions/:id                    Get one
```
No update/delete endpoints — matches the strict immutability rule.

### Savings
```
POST   /api/budgets/:budgetId/savings           Create — { amount, type, description }
GET    /api/budgets/:budgetId/savings           List
```

### Daily Summary (fully computed, nothing persisted)
```
GET    /api/budgets/:budgetId/daily-summary?date=YYYY-MM-DD
```
Returns: recommended spend for that date, actual spend, leftover/overspend,
remaining days, remaining budget.

### Notifications (see Section 6)
```
GET    /api/budgets/:budgetId/notifications/preferences
PUT    /api/budgets/:budgetId/notifications/preferences
```

---

## 5. Low-Level Tooling

| Concern | Choice | Why |
|---|---|---|
| Password hashing | `bcryptjs` | Pure JS — avoids native compile issues on Render's free build environment |
| Token generation | `jsonwebtoken` | Standard, well-documented JWT library for access tokens |
| Refresh tokens | `crypto.randomBytes` (built-in) | No extra library needed; stored hashed in `refresh_tokens` |
| Mobile state management | React Context API + `useReducer` | No extra library — sufficient for this app's size; revisit only if it becomes clunky |
| Background jobs (daily reminder, underspend check) | External scheduler (e.g. cron-job.org) hitting an internal endpoint | Render's free web service spins down after 15 min idle — an in-app scheduler like `node-cron` won't reliably fire; an external ping both wakes the service and triggers the check |
| Push notifications | Expo push notification service | Matches the Expo (managed) choice for React Native — no Firebase project or native push certs required |

## 6. Backend Project Structure

```
src/
  config/           db connection, env loading
  middleware/        auth (JWT check), error handler
  routes/             one file per resource (budgets.js, categories.js, ...)
  controllers/         request/response handling, calls services
  services/             business logic (daily calc, deletion checks, notification scheduling)
  db/
    queries/            raw SQL queries, grouped by resource
  app.js
  server.js
```
Business rules live in `services/`; raw SQL lives in `db/queries/` — kept
separate so the rules stay readable independent of the SQL itself.

---

## 7. Notifications (v1 scope — DECIDED)

Two notification types chosen for v1, kept intentionally minimal:

1. **Daily reminder of today's recommended spend** — a scheduled
   notification (e.g. each morning) that calls the daily-summary
   calculation and surfaces the number to the user before they start
   spending.
2. **Reminder to decide save-or-carry-forward on underspend** — triggered
   when the daily-summary calculation detects an underspend that the user
   hasn't yet acted on, prompting the choice from Rule 9.

**Explicitly deferred (not in v1):**
- Alerts when a transaction pushes the user over the daily recommendation.
- Alerts when a budget period is about to end.

Both deferred items can be added later without restructuring anything —
they'd read from the same daily-summary calculation already built for the
two v1 notifications.

Notifications are purely informational — they read from existing
calculations and never write to or influence the financial data itself.

---

## 8. Mobile Screens (React Native, v1)

**Auth**
- Splash/loading
- Login
- Register

**Core**
- Budget list
- Create budget (name, income, start/end date, planned savings)
- Budget dashboard (daily summary: recommended spend, spent so far,
  leftover/overspend, remaining days)
- Add transaction (amount, category, optional description — date always
  today)
- Transaction history (filterable by category/date)
- Categories list (with add-custom-category action)
- Fixed expenses list (view-only after creation)
- Add fixed expenses (only during/after budget creation, before lock)
- Savings list (PLANNED and LEFTOVER entries)
- Underspend prompt (Save vs. Carry Forward)

**Settings**
- Profile / logout
- Notification preferences

---

## 9. Open Items / Future Considerations

- Website account creation/password reset was explicitly decided against
  for v1 — app-only.
- Session management (viewing/revoking active devices) deferred, not
  required for correctness.
- Two notification types deferred (over-recommendation alert, budget-ending
  alert) — easy additions once v1 is stable.
