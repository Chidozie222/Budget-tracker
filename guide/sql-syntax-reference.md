# SQL Syntax Reference

Every SQL keyword and construct covered in this project, plus the
essential ones every SQL user needs, organized by category. Examples use
the same generic style as the code examples earlier (not tied to the
budget tracker specifically), so this file stands alone as a general
reference.

---

## 1. Data Definition (defining structure)

| Syntax | What it does |
|---|---|
| `CREATE TABLE` | Defines a new table and its columns |
| `DROP TABLE` | Permanently deletes a table and all its data |
| `ALTER TABLE` | Changes an existing table's structure (add/remove/modify a column) |
| `PRIMARY KEY` | Marks a column as the unique identifier for each row |
| `SERIAL` | An auto-incrementing integer — Postgres generates the next number automatically on insert |
| `FOREIGN KEY` / `REFERENCES` | Links a column to a row in another table, enforcing that the referenced row must exist |
| `NOT NULL` | Rejects a row if this column is left empty |
| `UNIQUE` | Rejects a row if this value already exists elsewhere in the column (or combination of columns) |
| `DEFAULT` | Supplies a value automatically if none is given on insert |
| `CHECK` | Rejects a row unless a stated condition is true (e.g. `CHECK (amount >= 0)`) |

**Example:**
```sql
CREATE TABLE authors (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE
);
```

## 2. Foreign Key Delete Behavior

| Syntax | What it does |
|---|---|
| `ON DELETE CASCADE` | If the referenced row is deleted, automatically delete this row too |
| `ON DELETE RESTRICT` | Refuses to delete the referenced row at all while this row still points to it |
| `ON DELETE SET NULL` | If the referenced row is deleted, set this column to `NULL` instead of deleting this row |

**Example:**
```sql
CREATE TABLE books (
    id        SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES authors(id) ON DELETE RESTRICT
);
```

## 3. Reading Data — `SELECT`

| Syntax | What it does |
|---|---|
| `SELECT * FROM table` | Returns every column for every row |
| `SELECT col1, col2 FROM table` | Returns only the named columns |
| `WHERE` | Filters which rows are returned |
| `ORDER BY col ASC/DESC` | Sorts results; `ASC` (default) low-to-high, `DESC` high-to-low |
| `LIMIT` | Caps how many rows are returned |
| `OFFSET` | Skips a number of rows before starting to return results (used with `LIMIT` for pagination) |
| `DISTINCT` | Removes duplicate rows from the result |

**Example:**
```sql
SELECT title, published_year FROM books
WHERE published_year > 2000
ORDER BY published_year DESC
LIMIT 5;
```

## 4. Filtering Conditions

| Syntax | What it does |
|---|---|
| `=`, `!=` / `<>`, `<`, `>`, `<=`, `>=` | Standard comparisons |
| `AND`, `OR`, `NOT` | Combine or invert conditions |
| `IN (...)` | Matches if the value is any one of a list |
| `BETWEEN x AND y` | Matches if the value falls in that range (inclusive) |
| `LIKE` | Pattern matching on text; `%` matches any sequence, `_` matches one character |
| `IS NULL` / `IS NOT NULL` | Checks specifically for/against `NULL` — `= NULL` never works, this is required instead |

**Example:**
```sql
SELECT * FROM books
WHERE genre IN ('Fiction', 'Sci-Fi')
  AND published_year BETWEEN 1990 AND 2020
  AND title LIKE 'The %';
```

## 5. Joining Tables

| Syntax | What it does |
|---|---|
| `INNER JOIN` (or just `JOIN`) | Returns rows only where both tables have a match |
| `LEFT JOIN` | Returns all rows from the left table, with matching data from the right table where it exists (`NULL` where it doesn't) |
| `RIGHT JOIN` | Same as `LEFT JOIN`, but keeps all rows from the right table instead |
| `ON` | Specifies the condition that links the two tables |

**Example:**
```sql
SELECT books.title, authors.name
FROM books
INNER JOIN authors ON books.author_id = authors.id;
```
This is the SQL equivalent of what your project does with `budget_id`/`category_id` foreign keys — joining lets you pull data across two related tables in a single query, instead of two separate queries and combining them in JavaScript.

## 6. Grouping & Aggregating

| Syntax | What it does |
|---|---|
| `GROUP BY` | Collapses rows sharing a value into one group, for use with aggregate functions |
| `HAVING` | Filters groups after aggregation (like `WHERE`, but for grouped results) |
| `COUNT(*)` | Counts rows |
| `SUM(col)` | Adds up a numeric column |
| `AVG(col)` | Averages a numeric column |
| `MIN(col)` / `MAX(col)` | Smallest / largest value in a column |
| `COALESCE(value, default)` | Returns `value` unless it's `NULL`, in which case returns `default` — critical for `SUM` on empty result sets, which otherwise returns `NULL` instead of `0` |

**Example:**
```sql
SELECT genre, COUNT(*) AS book_count
FROM books
GROUP BY genre
HAVING COUNT(*) > 3;
```
This is the general form behind every "total spent," "total planned savings" query in your project — grouping by `budget_id` with `SUM(amount)` is the same pattern at a bigger scale.

## 7. Changing Data

| Syntax | What it does |
|---|---|
| `INSERT INTO table (cols) VALUES (...)` | Adds a new row |
| `UPDATE table SET col = value WHERE ...` | Modifies existing row(s) — **always include `WHERE`, or every row changes** |
| `DELETE FROM table WHERE ...` | Removes row(s) — same warning applies |
| `RETURNING *` | Immediately returns the affected row(s) from an `INSERT`, `UPDATE`, or `DELETE`, without a separate `SELECT` |
| `ON CONFLICT (col) DO UPDATE SET ...` | "Upsert" — insert a new row, or update it instead if a conflicting unique value already exists |
| `ON CONFLICT (col) DO NOTHING` | Same conflict detection, but silently skips the insert instead of updating |

**Example:**
```sql
INSERT INTO authors (name, email)
VALUES ('Jane Doe', 'jane@example.com')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING *;
```
`EXCLUDED` refers to the row that *would* have been inserted — used inside an `ON CONFLICT ... DO UPDATE` to reference the new values.

## 8. Dates & Time

| Syntax | What it does |
|---|---|
| `NOW()` | The current timestamp, as calculated by the database server |
| `CURRENT_DATE` | Today's date, with no time component |
| `INTERVAL '<n> <unit>'` | A span of time for date math, e.g. `INTERVAL '30 days'`, `INTERVAL '1 hour'` |
| `date_column + INTERVAL '...'` | Adds a time span to a date/timestamp |
| `date_column < / > / BETWEEN` | Compares dates directly, same as numbers |
| `EXTRACT(field FROM date)` | Pulls out a specific part of a date, e.g. `EXTRACT(YEAR FROM published_at)` |

**Example:**
```sql
SELECT * FROM subscriptions
WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

## 9. Conditional Logic

| Syntax | What it does |
|---|---|
| `CASE WHEN ... THEN ... ELSE ... END` | SQL's if/else — returns different values depending on a condition, usable inside `SELECT` |

**Example:**
```sql
SELECT title,
  CASE
    WHEN published_year >= 2020 THEN 'Recent'
    WHEN published_year >= 2000 THEN 'Modern'
    ELSE 'Classic'
  END AS era
FROM books;
```

## 10. Subqueries

| Syntax | What it does |
|---|---|
| `(SELECT ...)` inside another query | A query nested inside another, used to compute a value or filter list that the outer query then uses |

**Example (the pattern already used for category usage checks in your project):**
```sql
SELECT
  (SELECT COUNT(*) FROM books WHERE author_id = authors.id) AS book_count
FROM authors;
```

## 11. Multiple Statements as One Unit — Transactions

| Syntax | What it does |
|---|---|
| `BEGIN` | Starts a transaction — a group of statements that either all succeed or all fail together |
| `COMMIT` | Saves all changes made since `BEGIN` |
| `ROLLBACK` | Discards all changes made since `BEGIN`, as if none of them happened |

**Example:**
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```
If the second `UPDATE` failed for any reason, a `ROLLBACK` (often automatic on error, depending on your client) would undo the first one too — preventing money from vanishing from account 1 without appearing in account 2. Not used yet in your project, but worth knowing conceptually — it's the mechanism that would matter if you ever needed two related inserts to succeed or fail as one unit.

## 12. Placeholders (parameterized queries)

| Syntax | What it does |
|---|---|
| `$1`, `$2`, `$3`, ... | Postgres-style placeholders — stand-ins for values supplied separately by your code, never concatenated into the query string |

**Example (from your project):**
```javascript
await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
```
This is the pattern preventing SQL injection — covered in depth earlier in this conversation.

## 13. Data Types

**Numbers**

| Type | What it stores |
|---|---|
| `INTEGER` (or `INT`) | Whole numbers, no decimals — good for counts, foreign keys |
| `SERIAL` | An auto-incrementing `INTEGER` — Postgres assigns the next number automatically, used for `id` columns |
| `NUMERIC(precision, scale)` | Exact decimal numbers — `precision` is total digits, `scale` is digits after the decimal point. `NUMERIC(14,2)` allows up to 14 digits total, 2 after the decimal — the correct choice for money, since it never introduces rounding error the way floating-point types can |
| `REAL` / `DOUBLE PRECISION` | Floating-point numbers — faster, but can introduce tiny rounding errors. Avoid for money; fine for things like scientific measurements |

**Text**

| Type | What it stores |
|---|---|
| `VARCHAR(n)` | Text with a maximum length of `n` characters — rejects anything longer |
| `TEXT` | Text with no length limit at all |
| `CHAR(n)` | Fixed-length text, padded with spaces if shorter than `n` — rarely used in modern schemas; `VARCHAR` or `TEXT` are almost always the better choice |

In practice: use `VARCHAR(n)` when you want a length cap to enforce (like `VARCHAR(255)` for an email), and `TEXT` when there's no reasonable limit (like a long description or notes field).

**True/False**

| Type | What it stores |
|---|---|
| `BOOLEAN` | `TRUE`, `FALSE`, or `NULL` (if nullable) |

**Dates & Time**

| Type | What it stores |
|---|---|
| `DATE` | Just a calendar date, no time — `2026-09-06` |
| `TIME` | Just a time, no date — `14:30:00` |
| `TIMESTAMP` | Date + time, with no timezone awareness |
| `TIMESTAMPTZ` | Date + time, timezone-aware — Postgres stores it in UTC internally and converts on display. This is the recommended default for `created_at`/`updated_at`/`expires_at` columns, since it behaves correctly regardless of what timezone your server or users are in |

**Identifiers**

| Type | What it stores |
|---|---|
| `UUID` | A 128-bit universally unique identifier, e.g. `550e8400-e29b-41d4-a716-446655440000`. An alternative to `SERIAL` for primary keys — harder to guess/enumerate than a sequential integer, and safe to generate on multiple servers at once without collision. Not used in your project (you're on `SERIAL`), but common enough to recognize |

**Structured / flexible data**

| Type | What it stores |
|---|---|
| `JSON` | Stores JSON text as-is, re-parsed on every read |
| `JSONB` | Stores JSON in a parsed, indexed binary format — faster to query, and the generally recommended choice over `JSON` in Postgres specifically. Useful when a column's shape genuinely varies row to row (e.g. a flexible "settings" blob) — not something your project currently needs, since every column has a fixed, known shape |

**Restricting to a fixed list of values**

| Type | What it does |
|---|---|
| `ENUM` (custom type, via `CREATE TYPE`) | Restricts a column to a fixed set of named values, defined once and reused across tables |

**Example:**
```sql
CREATE TYPE mood AS ENUM ('HAPPY', 'SAD', 'NEUTRAL');

CREATE TABLE journal_entries (
    id    SERIAL PRIMARY KEY,
    mood  mood NOT NULL
);
```
This is functionally similar to what your project does with `VARCHAR(10) CHECK (role IN ('USER', 'ADMIN'))` — both restrict a column to a fixed set of values. The difference: a real `ENUM` type is reusable across multiple tables and slightly more storage-efficient, while `CHECK` is simpler to define inline and easier to modify later (changing an `ENUM`'s allowed values requires an `ALTER TYPE` statement, while a `CHECK` constraint's list can just be redefined). Your project uses `CHECK` deliberately for that flexibility — worth knowing `ENUM` exists as the alternative.

---



| Goal | Use |
|---|---|
| Get one column's total across many rows | `SUM()` + `GROUP BY` |
| Avoid `NULL` from an empty sum | `COALESCE(SUM(...), 0)` |
| Get related data from two tables at once | `JOIN` |
| Get a computed value inline | Subquery `(SELECT ...)` |
| Insert or update depending on whether it exists | `ON CONFLICT ... DO UPDATE` |
| Get the row back right after changing it | `RETURNING *` |
| Do date math | `NOW() + INTERVAL '...'` |
| Return different text based on a condition | `CASE WHEN ... THEN ... END` |
| Make several changes succeed or fail together | `BEGIN` / `COMMIT` / `ROLLBACK` |
