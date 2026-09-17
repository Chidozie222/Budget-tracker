CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    income      NUMERIC(14,2) NOT NULL CHECK (income >= 0),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    budget_id   INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    owner_type  VARCHAR(10) NOT NULL CHECK (owner_type IN ('ADMIN', 'USER')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (budget_id, name)
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
    id          SERIAL PRIMARY KEY,
    budget_id   INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name        VARCHAR(255) NOT NULL,
    amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL PRIMARY KEY,
    budget_id   INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    description VARCHAR(500),
    date        DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings (
    id          SERIAL PRIMARY KEY,
    budget_id   INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    type        VARCHAR(20) NOT NULL DEFAULT 'LEFTOVER' CHECK (type IN ('PLANNED', 'LEFTOVER')),
    description VARCHAR(500),
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS savings
    ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'LEFTOVER';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'savings_type_check'
    ) THEN
        ALTER TABLE savings
        ADD CONSTRAINT savings_type_check CHECK (type IN ('PLANNED', 'LEFTOVER'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    daily_reminder      BOOLEAN NOT NULL DEFAULT TRUE,
    underspend_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    push_token          VARCHAR(255),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
