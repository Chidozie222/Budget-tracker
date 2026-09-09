# Budget Tracker — Entity Relationship Diagram

This renders automatically if viewed on GitHub, GitLab, or any Markdown
viewer with Mermaid support. If viewing elsewhere, paste the code block
into the live editor at https://mermaid.live to see it rendered.

```mermaid
erDiagram
  USERS ||--o{ BUDGETS : owns
  USERS ||--o{ REFRESH_TOKENS : has
  USERS ||--o| NOTIFICATION_PREFERENCES : has
  BUDGETS ||--o{ CATEGORIES : has
  BUDGETS ||--o{ FIXED_EXPENSES : has
  BUDGETS ||--o{ TRANSACTIONS : has
  BUDGETS ||--o{ SAVINGS : has
  CATEGORIES ||--o{ FIXED_EXPENSES : classifies
  CATEGORIES ||--o{ TRANSACTIONS : classifies

  USERS {
    int id PK
    string name
    string email
    string role
  }
  BUDGETS {
    int id PK
    int user_id FK
    string name
    numeric income
    date start_date
    date end_date
  }
  CATEGORIES {
    int id PK
    int budget_id FK
    string name
    string owner_type
  }
  FIXED_EXPENSES {
    int id PK
    int budget_id FK
    int category_id FK
    string name
    numeric amount
  }
  TRANSACTIONS {
    int id PK
    int budget_id FK
    int category_id FK
    numeric amount
    date date
  }
  SAVINGS {
    int id PK
    int budget_id FK
    numeric amount
    string type
    date date
  }
  REFRESH_TOKENS {
    int id PK
    int user_id FK
    string token_hash
    timestamp expires_at
  }
  NOTIFICATION_PREFERENCES {
    int id PK
    int user_id FK
    boolean daily_reminder
    boolean underspend_reminder
    string push_token
  }
```

## Notes not visible in the diagram itself

- `users.role` is restricted to `USER`/`ADMIN` via a `CHECK` constraint,
  not a separate table.
- `categories` has `UNIQUE(budget_id, name)` — one name per budget.
- `fixed_expenses.category_id` and `transactions.category_id` both use
  `ON DELETE RESTRICT` — this is the mechanism that blocks deleting an
  in-use category.
- `notification_preferences` has a one-to-one relationship with `users`,
  enforced by `UNIQUE(user_id)`.

This matches `src/db/schema.sql` from the backend starter exactly.
