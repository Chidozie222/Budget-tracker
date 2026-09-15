## JavaScript Regex — In-Depth Guide

## 1. What Regex Is

A regular expression (regex) is a pattern used to match character combinations in strings. In JavaScript, a regex is either a literal (`/pattern/flags`) or a `RegExp` object (`new RegExp("pattern", "flags")`). Use the literal form unless the pattern is built dynamically from a variable.

```javascript
const literal = /\d+/;
const dynamic = new RegExp(`^${userInput}$`);
```

---

## 2. Literal Characters

Most characters match themselves exactly.

```javascript
/cat/.test("concatenate"); // true — "cat" appears inside the word
/cat/.test("dog"); // false
```

Special characters that need escaping if you want them literally: `. * + ? ^ $ { } ( ) | [ ] \`

```javascript
/3.14/.test("3.14"); // true, but "." matches ANY char here
/3\.14/.test("3x14"); // false — escaped dot means literal "."
```

---

## 3. Character Classes `[...]`

Match any **one** character from a set.

```javascript
/[aeiou]/.test("sky"); // false — no vowels
/[0-9]/.test("abc5"); // true — matches "5"
/[a-zA-Z]/.test("Hi"); // true — any letter, upper or lower
/[^0-9]/.test("abc"); // true — ^ inside [] negates: "not a digit"
```

Ranges: `a-z`, `A-Z`, `0-9` can be combined: `[a-zA-Z0-9]`.

---

## 4. Shorthand Character Classes

| Symbol | Meaning                          | Equivalent      |
| ------ | -------------------------------- | --------------- |
| `\d`   | digit                            | `[0-9]`         |
| `\D`   | non-digit                        | `[^0-9]`        |
| `\w`   | word character                   | `[a-zA-Z0-9_]`  |
| `\W`   | non-word character               | `[^a-zA-Z0-9_]` |
| `\s`   | whitespace (space, tab, newline) |                 |
| `\S`   | non-whitespace                   |                 |
| `.`    | any character except newline     |                 |

```javascript
/\d{3}/.test("abc123"); // true — three digits somewhere
/^\w+$/.test("hello_123"); // true — only word characters
/\s/.test("no space"); // true — has a space
```

---

## 5. Quantifiers — Repetition

| Symbol  | Meaning           |
| ------- | ----------------- |
| `*`     | 0 or more         |
| `+`     | 1 or more         |
| `?`     | 0 or 1 (optional) |
| `{n}`   | exactly n         |
| `{n,}`  | n or more         |
| `{n,m}` | between n and m   |

```javascript
/colou?r/.test("color"); // true — "u" optional
/colou?r/.test("colour"); // true
/go{2,4}gle/.test("gooogle"); // true — 2 to 4 o's
/a*/.test(""); // true — 0 or more allows empty match
```

### Greedy vs Lazy

By default quantifiers are **greedy** (match as much as possible). Add `?` after the quantifier to make it **lazy** (match as little as possible).

```javascript
"<a><b>".match(/<.+>/)[0]; // "<a><b>" — greedy, grabs everything
"<a><b>".match(/<.+?>/)[0]; // "<a>"    — lazy, stops at first ">"
```

---

## 6. Anchors — Position, Not Characters

| Symbol | Meaning                                  |
| ------ | ---------------------------------------- |
| `^`    | start of string (or line, with `m` flag) |
| `$`    | end of string (or line, with `m` flag)   |
| `\b`   | word boundary                            |
| `\B`   | NOT a word boundary                      |

```javascript
/^hello/.test("hello world"); // true
/world$/.test("hello world"); // true
/^hello$/.test("hello world"); // false — must match whole string
/\bcat\b/.test("category"); // false — "cat" is part of a bigger word
/\bcat\b/.test("the cat sat"); // true — "cat" stands alone
```

**Rule of thumb:** use `^...$` when validating that an _entire_ string fits a format (e.g. form input). Skip anchors when _searching_ for a pattern inside larger text.

---

## 7. Groups and Alternation

**Grouping** `(...)` treats a sequence as one unit and captures it.

```javascript
"2026-09-12".match(/(\d{4})-(\d{2})-(\d{2})/);
// result[0] = "2026-09-12" (full match)
// result[1] = "2026", result[2] = "09", result[3] = "12"
```

**Alternation** `|` means OR.

```javascript
/cat|dog/.test("I have a dog"); // true
```

**Non-capturing group** `(?:...)` groups without creating a capture reference — useful when you only need grouping for a quantifier, not the captured text.

```javascript
/(?:ab)+/.test("ababab"); // true — matches repeated "ab", no capture stored
```

**Named groups** `(?<name>...)` — more readable than numbered groups.

```javascript
const match = "2026-09-12".match(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
);
`${match.groups.month}/${match.groups.day}/${match.groups.year}`;
// "09/12/2026"
```

---

## 8. Lookahead and Lookbehind

These check what comes before/after a position **without including it in the match**.

| Symbol     | Meaning             |
| ---------- | ------------------- |
| `(?=...)`  | positive lookahead  |
| `(?!...)`  | negative lookahead  |
| `(?<=...)` | positive lookbehind |
| `(?<!...)` | negative lookbehind |

```javascript
// Password must contain a digit (lookahead doesn't consume characters)
/(?=.*\d)/.test("abc1"); // true

// Match a number NOT followed by "px"
"100px 100em".match(/\d+(?!px)/g); // ["100"] from "100em" only...
// (note: matches partial digits too — use word boundaries for full numbers)

// Match a price only if preceded by "$"
"$100".match(/(?<=\$)\d+/)[0]; // "100"

// Match a word NOT preceded by "un"
"happy unhappy".match(/(?<!un)happy/g); // ["happy"]
```

Lookaheads are commonly used for **adding thousands separators**:

```javascript
(1234567).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// "1,234,567"
```

---

## 9. Flags

| Flag | Name       | Effect                               |
| ---- | ---------- | ------------------------------------ |
| `g`  | global     | find all matches, not just the first |
| `i`  | ignoreCase | case-insensitive matching            |
| `m`  | multiline  | `^`/`$` match start/end of each line |
| `s`  | dotAll     | `.` also matches newlines            |
| `u`  | unicode    | enables full unicode matching        |

```javascript
"Cat cat CAT".match(/cat/gi); // ["Cat", "cat", "CAT"]
"line1\nline2".match(/^line/gm); // ["line1", "line2"]
```

---

## 10. Regex Methods Reference

| Method                     | Belongs to | Returns               | Use for                                             |
| -------------------------- | ---------- | --------------------- | --------------------------------------------------- |
| `.test(str)`               | RegExp     | `true`/`false`        | quick yes/no check                                  |
| `.exec(str)`               | RegExp     | match array or `null` | step through matches one at a time                  |
| `.match(regex)`            | String     | array or `null`       | get match(es) from a string                         |
| `.matchAll(regex)`         | String     | iterator              | get all matches **with groups** (requires `g` flag) |
| `.replace(regex, repl)`    | String     | new string            | substitute first match (or all, with `g`)           |
| `.replaceAll(regex, repl)` | String     | new string            | substitute all matches (regex must have `g`)        |
| `.split(regex)`            | String     | array                 | split string on a pattern                           |
| `.search(regex)`           | String     | index or `-1`         | find position of first match                        |

```javascript
// matchAll example — extract every date and its parts
const text = "Start: 2026-01-01, End: 2026-12-31";
const dates = [...text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)];
dates.map((m) => m[1]); // ["2026", "2026"] — both years
```

---

## 11. Real-World Use Cases

### Validate an email (basic)

```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test("chidozie@example.com"); // true
```

### Validate a username (3–16 chars, letters/numbers/underscore)

```javascript
/^[a-zA-Z0-9_]{3,16}$/.test("chidozie_25"); // true
```

### Password strength check (min 8 chars, 1 upper, 1 lower, 1 digit, 1 symbol)

```javascript
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
strongPassword.test("Abcdef1!"); // true
```

### Format a phone number

```javascript
"1234567890".replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
// "(123) 456-7890"
```

### Extract hashtags from text

```javascript
"I love #JavaScript and #regex".match(/#\w+/g);
// ["#JavaScript", "#regex"]
```

### Slugify a title

```javascript
"My Blog Post Title!"
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
// "my-blog-post-title"
```

### camelCase to kebab-case

```javascript
"myVariableName".replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
// "my-variable-name"
```

### Mask sensitive data (credit card)

```javascript
"1234-5678-9012-3456".replace(/\d{4}(?=\d{4})/g, "****");
// "****-****-****-3456"
```

### Trim and collapse whitespace

```javascript
"  too   much   space  ".trim().replace(/\s+/g, " ");
// "too much space"
```

### Validate a URL (basic)

```javascript
/^https?:\/\/[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test("https://example.com/path");
// true
```

### Extract all numbers from a string

```javascript
"Order #123 costs $45.99".match(/[\d.]+/g); // ["123", "45.99"]
```

### Remove HTML tags from a string

```javascript
"<p>Hello <b>world</b></p>".replace(/<[^>]+>/g, ""); // "Hello world"
```

---

## 12. Common Pitfalls

- **Forgetting `g` in `replace`** — without it, only the first match is replaced.
  ```javascript
  "a-b-c".replace(/-/, "_"); // "a_b-c"  (only first)
  "a-b-c".replace(/-/g, "_"); // "a_b_c"  (all)
  ```
- **Forgetting to escape special characters** in dynamic regex — e.g. building a pattern from user input containing `.` or `*`.
- **Using greedy quantifiers on structured data like HTML/JSON** — regex is not a full parser; for anything nested or complex, use a proper parser instead.
- **`.test()` with the `g` flag on a reused regex** — a global regex remembers `lastIndex` between calls, which can cause `.test()` to unexpectedly return `false` on the same string the second time. Reset `regex.lastIndex = 0` or create a fresh regex if reusing.

---

## 13. Building a Regex — Step-by-Step Method

1. Decide scope: does the **whole string** need to match (`^...$`), or are you **searching** within larger text?
2. Break the target into logical pieces (letters? digits? symbols? separators?).
3. Choose the right character class or shorthand for each piece.
4. Add quantifiers for how many times each piece repeats.
5. Group and use alternation where there are multiple valid forms.
6. Add flags as needed (`g` for all matches, `i` for case-insensitivity).
7. Test against multiple valid **and** invalid examples before relying on it.
