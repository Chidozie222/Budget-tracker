# Budget Tracker — Build Roadmap

A step-by-step breakdown of the whole project into small, single-session
goals. Each item is sized to be realistically finishable in one sitting
(roughly an hour or two), with an explanation of what it achieves and why
it comes at that point in the sequence. Work through them in order — each
one is built to unblock the next.

Check items off as you go. If a session runs long, it's fine to split one
further — the sizing here is a starting point, not a rule.

---

## Phase 0 — Environment Setup

**Goal of this phase:** get every account and tool in place before writing
a single line of app code, so nothing later gets interrupted by a signup
or configuration step.

- [ ] **Session 1: Create accounts.** Sign up for Render, and create a
  GitHub repository for the backend. *Why first:* everything downstream —
  deployment, the database — depends on these existing.
- [ ] **Session 2: Provision the Postgres database on Render.** Get the
  connection string, and confirm you can connect to it from your local
  machine using a client (e.g. `psql` or a GUI tool like TablePlus/DBeaver).
  *Why:* confirms the database itself works before any app code touches
  it — isolates database problems from code problems.
- [ ] **Session 3: Scaffold the Express project.** `npm init`, install
  `express` and `pg` (the Postgres driver, no ORM), set up the folder
  structure from the documentation (`routes/`, `controllers/`,
  `services/`, `db/queries/`), and get a bare `GET /health` endpoint
  returning `200 OK`, deployed to Render. *Why:* proves the full chain —
  local code → GitHub → Render deploy — works before real logic exists.

---

## Phase 1 — Database Tables

**Goal of this phase:** write and run the actual `CREATE TABLE` statements
by hand, one entity at a time, so you learn the syntax as you go rather
than all at once.

- [ ] **Session 4: `users` table.** Write and run the `CREATE TABLE`
  statement for users (id, name, email, password, timestamps). *Why
  first:* every other table eventually references a user, directly or
  indirectly through budgets.
- [ ] **Session 5: `budgets` table.** Create it with its foreign key to
  `users`. Practice inserting a couple of test rows manually via SQL.
  *Why:* this is your first foreign key — a good checkpoint for
  understanding relationships before adding more tables.
- [ ] **Session 6: `categories` table.** Create it with the foreign key to
  `budgets` and the `UNIQUE(budget_id, name)` constraint. Test the
  constraint by trying to insert a duplicate and seeing it fail. *Why:*
  seeing a constraint actually reject bad data is the clearest way to
  understand why we specify constraints at all.
- [ ] **Session 7: `fixed_expenses` and `transactions` tables.** Both
  reference `budgets` and `categories`. Build both in one session since
  they're structurally similar. *Why grouped:* repetition reinforces the
  foreign-key pattern from Session 6 without introducing new concepts.
- [ ] **Session 8: `savings` table.** Create it, including the `type` enum
  (`PLANNED`/`LEFTOVER`). *Why last in this phase:* it's the simplest
  remaining table, a good note to end the schema phase on.

---

## Phase 2 — Auth

**Goal of this phase:** get registration and login fully working, since
almost nothing else can be tested realistically without a logged-in user.

- [ ] **Session 9: Register endpoint.** Hash passwords (e.g. with
  `bcrypt`), insert into `users`, return a success response. Test with a
  tool like Postman or Insomnia. *Why:* the first real endpoint —
  confirms request → controller → SQL insert → response all connect.
- [ ] **Session 10: Login endpoint + JWT.** Verify password, issue an
  access token. *Why:* unlocks the ability to test every other endpoint
  as an authenticated user from here on.
- [ ] **Session 11: Auth middleware + refresh/logout.** Write the
  middleware that checks the JWT on protected routes, then add
  `/refresh` and `/logout`. *Why:* this middleware gets reused on every
  future endpoint — worth its own session to get right.

---

## Phase 3 — Budgets & Categories

**Goal of this phase:** let a logged-in user create a budget and see the
auto-generated SYSTEM categories appear.

- [ ] **Session 12: Create budget endpoint.** On creation, also
  auto-insert the SYSTEM categories (Food, Transportation, etc.) as a
  side effect in the same request. *Why bundled:* this is the first place
  business logic (not just a plain insert) enters your code — a good
  single-session concept to isolate.
- [ ] **Session 13: List/get budget endpoints.** Straightforward reads,
  scoped to the logged-in user only. *Why:* reinforces the "a user can
  only see their own data" rule with real code.
- [ ] **Session 14: Category create/list/delete endpoints.** Delete must
  check ownership + usage (no transactions or fixed expenses attached)
  before allowing it. *Why last:* the delete-with-checks logic is the
  most complex part of categories — better tackled once create/list feel
  easy.

---

## Phase 4 — Fixed Expenses & Transactions

**Goal of this phase:** get real financial data flowing into the ledger.

- [ ] **Session 15: Fixed expense create/list endpoints.** No update or
  delete — deliberately absent. *Why simple:* reinforces that "locked"
  sometimes means "just don't build the endpoint," not extra code.
- [ ] **Session 16: Transaction create endpoint.** Enforce that `date`
  is always today — reject anything else at the API level. *Why
  enforced here:* this is where Rule 11 (no backdating) actually gets
  implemented, not just documented.
- [ ] **Session 17: Transaction list endpoint**, with filtering by
  `?date=` and `?categoryId=`. *Why its own session:* query filtering
  with optional parameters is a distinct SQL skill from a plain `SELECT *`.

---

## Phase 5 — The Daily Calculation

**Goal of this phase:** this is the heart of the app — everything before
this phase was setup for this.

- [ ] **Session 18: Write the daily-summary calculation as a plain
  function first**, outside of any endpoint — feed it fake numbers and
  confirm the math matches the worked examples from earlier (available
  budget ÷ remaining days, etc.). *Why isolate it:* debugging math is
  much easier without an HTTP request in the way.
- [ ] **Session 19: Wire the function to real data** — pull actual sums
  from `transactions` and `savings` via SQL, feed them into the function
  from Session 18, and expose it as `GET /daily-summary`. *Why split from
  18:* keeps "is the math right" separate from "is the SQL right."
- [ ] **Session 20: Savings create endpoint**, and the frontend-facing
  logic for the Save-vs-Carry-Forward choice (carry-forward needs no
  storage — it just gets read by tomorrow's calculation call). *Why
  here:* only makes sense once the daily-summary calculation it depends
  on already exists.

---

## Phase 6 — Notifications

**Goal of this phase:** the two v1 notification types, both of which
lean on the calculation you just finished.

- [ ] **Session 21: Notification preferences endpoints** (get/update).
  *Why first:* simple CRUD, a gentle re-entry point after the harder
  calculation work in Phase 5.
- [ ] **Session 22: Daily reminder job.** A scheduled task (e.g. a simple
  cron-style job) that calls the daily-summary logic each morning per
  budget and sends the reminder. *Why:* your first taste of background
  jobs, distinct from request/response endpoints.
- [ ] **Session 23: Underspend-decision reminder.** Triggered when a
  daily-summary check finds an unresolved underspend. *Why last:* reuses
  the Session 22 scheduling pattern, so it should go faster.

---

## Phase 7 — Mobile App (React Native)

**Goal of this phase:** build the 13 screens, wired to the now-complete
backend.

- [ ] **Session 24: Project scaffold + navigation.** Set up the React
  Native project and the navigation structure (stack/tabs) for all 13
  screens as empty placeholders. *Why:* gives you a skeleton to fill in
  screen by screen, rather than building navigation and features at once.
- [ ] **Session 25: Auth screens** (splash, login, register) wired to the
  real auth endpoints. *Why first real screens:* nothing else in the app
  is reachable without login working.
- [ ] **Session 26: Budget list + create budget screens.**
- [ ] **Session 27: Budget dashboard screen** (the daily-summary view) —
  likely your most visually complex screen. Give it its own session.
- [ ] **Session 28: Add transaction + transaction history screens.**
- [ ] **Session 29: Categories + fixed expenses screens.**
- [ ] **Session 30: Savings list + underspend prompt screens.**
- [ ] **Session 31: Settings screen** (profile, logout, notification
  preferences). *Why last:* lowest-priority screen, a good wind-down
  session.

---

## Phase 8 — Website (React)

**Goal of this phase:** the informational site — deliberately the
simplest remaining piece.

- [ ] **Session 32: Static site with app description + download links.**
  One session is realistic since there's no backend calls at all — it's
  pure presentation.

---

## Phase 9 — Wrap-up

- [ ] **Session 33: End-to-end pass.** Walk through the entire app as a
  brand-new user, start to finish — register, create a budget, log
  transactions across a couple of simulated days, trigger an underspend
  and an overspend, check a notification fires. *Why last:* the first
  time everything is tested together rather than piece by piece — this
  is where integration bugs surface.
- [ ] **Session 34: Deploy check + README.** Confirm the deployed Render
  backend and database work independently of your local machine, and
  write a short README describing the project for your portfolio/CV.

---

**Total: 34 sessions.** If you do one most days, that's roughly 5–6 weeks
at a sustainable pace — faster if a session goes quickly, slower if one
needs to split. The order matters more than the pace: each phase only
starts once the one before it actually works, not just once it's "mostly
done."
