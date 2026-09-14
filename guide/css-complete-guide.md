# The Complete CSS Guide

## Table of Contents
1. Basics & Selectors
2. The Box Model
3. Layout — Flexbox
4. Layout — Grid
5. Positioning
6. Typography
7. Colors & Backgrounds
8. Responsive Design
9. Transitions & Animations
10. Transforms
11. CSS Variables (Custom Properties)
12. Common Patterns & Use Cases
13. Cheat Sheet

---

# 1. Basics & Selectors

## 1.1 How CSS Applies Styles

```css
selector {
  property: value;
}
```

## 1.2 Selector Types

```css
/* Element selector */
p { color: black; }

/* Class selector — most commonly used */
.card { padding: 16px; }

/* ID selector — use sparingly, high specificity */
#header { background: navy; }

/* Attribute selector */
input[type="text"] { border: 1px solid gray; }
a[target="_blank"] { color: red; }

/* Descendant selector — any nested element */
.card p { margin: 0; }

/* Direct child selector — only immediate children */
.card > p { margin: 0; }

/* Adjacent sibling — element immediately after */
h2 + p { font-weight: bold; }

/* General sibling — any sibling after */
h2 ~ p { color: gray; }

/* Grouping — apply same rule to multiple selectors */
h1, h2, h3 { font-family: sans-serif; }

/* Universal selector */
* { box-sizing: border-box; }
```

## 1.3 Pseudo-classes and Pseudo-elements

```css
/* Pseudo-classes — state-based */
a:hover { color: blue; }
button:active { transform: scale(0.98); }
input:focus { outline: 2px solid blue; }
input:disabled { opacity: 0.5; }
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(2) { background: #eee; }
li:nth-child(odd) { background: #f5f5f5; }
li:nth-child(even) { background: white; }
input:checked + label { color: green; }
p:not(.highlight) { opacity: 0.7; }

/* Pseudo-elements — target a part of an element */
p::first-line { font-weight: bold; }
p::first-letter { font-size: 2em; }
.tooltip::before { content: "→ "; }
.tooltip::after { content: " ←"; }
```

**Use case:** styling every other table row (zebra striping) without adding extra classes in the HTML:
```css
tr:nth-child(even) {
  background-color: #f9f9f9;
}
```

## 1.4 Specificity — Why Some Rules "Win"

Specificity determines which rule applies when multiple rules target the same element. Roughly, from lowest to highest:

```
element selectors        (p, div)               → weight 0-0-1
class/attribute/pseudo   (.card, [type], :hover) → weight 0-1-0
ID selectors              (#header)               → weight 1-0-0
inline styles             (style="...")            → always wins over stylesheet rules
!important                                          → overrides everything (use sparingly!)
```

```css
p { color: black; }             /* specificity: 0-0-1 */
.text { color: blue; }          /* specificity: 0-1-0 — wins over above */
#main p { color: red; }         /* specificity: 1-0-1 — wins over both */
```
**Best practice:** avoid IDs and `!important` for styling — they make overriding styles later much harder. Prefer classes.

---

# 2. The Box Model

Every element is a box made of: content → padding → border → margin.

```css
.box {
  width: 200px;
  padding: 20px;   /* space inside the border */
  border: 2px solid black;
  margin: 10px;    /* space outside the border */
}
```

## 2.1 `box-sizing` — Extremely Important

```css
.box {
  box-sizing: content-box; /* DEFAULT: width applies only to content; padding/border ADD to total size */
}
.box {
  box-sizing: border-box; /* width INCLUDES padding and border — much more predictable */
}

/* Best practice: apply globally at the start of every project */
* {
  box-sizing: border-box;
}
```
**Use case:** without `border-box`, adding `padding: 20px` to a `width: 200px` box makes it render at 240px wide (200 + 20 + 20), which breaks layouts. `border-box` keeps it at exactly 200px total.

## 2.2 Margin Collapsing (a common surprise)

```css
.first { margin-bottom: 20px; }
.second { margin-top: 30px; }
/* Vertical margins between these two collapse to 30px (the larger), NOT 50px */
```
This only happens with vertical margins between block-level siblings — worth knowing so you don't chase a "missing" 20px.

---

# 3. Layout — Flexbox

Flexbox is for **one-dimensional** layouts (a row OR a column).

## 3.1 Container Properties

```css
.container {
  display: flex;
  flex-direction: row;           /* row (default) | column | row-reverse | column-reverse */
  justify-content: center;       /* main-axis alignment: flex-start | center | flex-end | space-between | space-around | space-evenly */
  align-items: center;           /* cross-axis alignment: flex-start | center | flex-end | stretch | baseline */
  flex-wrap: wrap;                /* nowrap (default) | wrap — allow items to wrap to new lines */
  gap: 16px;                      /* spacing between items — cleaner than margins */
}
```

## 3.2 Item Properties

```css
.item {
  flex-grow: 1;      /* how much this item grows relative to siblings when there's extra space */
  flex-shrink: 1;     /* how much it shrinks when space is tight */
  flex-basis: 200px;  /* starting size before growing/shrinking */
  flex: 1;             /* shorthand for grow=1 shrink=1 basis=0 — "take equal share" */
  align-self: flex-end; /* override align-items for this one item */
  order: 2;             /* change visual order without changing HTML order */
}
```

## 3.3 Real Use Cases

**Navbar with logo left, links right:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Perfectly centered content (the classic centering problem, solved):**
```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**Equal-width cards in a row:**
```css
.card-container {
  display: flex;
  gap: 16px;
}
.card {
  flex: 1; /* each card takes equal share of available space */
}
```

**Sticky footer (footer stays at bottom even on short pages):**
```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1; /* pushes footer down by consuming all extra space */
}
```

---

# 4. Layout — Grid

Grid is for **two-dimensional** layouts (rows AND columns together).

## 4.1 Container Properties

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;    /* 3 columns: fixed, flexible, flexible */
  grid-template-rows: 100px auto;           /* 2 rows */
  gap: 16px;                                 /* spacing between cells (row + column) */
  row-gap: 16px;
  column-gap: 24px;
}

/* Common shorthand for equal columns */
.grid {
  grid-template-columns: repeat(3, 1fr); /* 3 equal-width columns */
}

/* Responsive columns without media queries — auto-fits as many as fit */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

## 4.2 Item Placement

```css
.item {
  grid-column: 1 / 3;   /* span from column line 1 to 3 (spans 2 columns) */
  grid-row: 1 / 2;
  grid-column: span 2;   /* alternative syntax — span 2 columns from current position */
}

/* Named grid areas — very readable for page layouts */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }
```

## 4.3 Real Use Cases

**Responsive photo gallery — no media queries needed:**
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
```

**Classic page layout (header, sidebar, content, footer):**
```css
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}
```

**Dashboard with uneven card sizes:**
```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.featured-card {
  grid-column: span 2;  /* this card takes up 2 columns */
  grid-row: span 2;      /* and 2 rows */
}
```

### Flexbox vs Grid — when to use which
| Use Flexbox when | Use Grid when |
|---|---|
| Laying out items in a single row or column | Laying out both rows AND columns together |
| Content size should drive layout | You want precise control over a structured layout |
| Navbars, button groups, centering | Page layouts, image galleries, dashboards |

---

# 5. Positioning

```css
.static  { position: static; }    /* default — normal document flow */
.relative { position: relative; top: 10px; left: 10px; } /* offset from its NORMAL position, still takes up original space */
.absolute { position: absolute; top: 0; right: 0; }       /* removed from flow, positioned relative to nearest positioned ancestor */
.fixed    { position: fixed; bottom: 0; left: 0; }        /* removed from flow, positioned relative to the VIEWPORT (stays on scroll) */
.sticky   { position: sticky; top: 0; }                    /* hybrid — acts static until scroll reaches threshold, then sticks */
```

## Real Use Cases

**Badge/notification dot on an icon:**
```css
.icon-wrapper { position: relative; }
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: red;
  border-radius: 50%;
  width: 10px;
  height: 10px;
}
```

**Sticky table header or nav bar:**
```css
.table-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10; /* ensures it stays above scrolling content */
}
```

**Modal overlay covering the whole screen:**
```css
.modal-overlay {
  position: fixed;
  inset: 0; /* shorthand for top:0; right:0; bottom:0; left:0; */
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**`z-index`** controls stacking order (higher = on top), and only works on positioned elements (`relative`, `absolute`, `fixed`, `sticky`) — not `static`.

---

# 6. Typography

```css
body {
  font-family: "Segoe UI", Arial, sans-serif; /* fallback fonts in case first isn't available */
  font-size: 16px;
  font-weight: 400;       /* 100-900, or normal/bold */
  line-height: 1.5;        /* unitless = multiplier of font-size, better than fixed px */
  letter-spacing: 0.5px;
  text-align: center;
  text-transform: uppercase;
  text-decoration: underline;
  white-space: nowrap;      /* prevent text wrapping */
  overflow: hidden;
  text-overflow: ellipsis;  /* "..." for truncated text — needs the two above */
}
```

**Use case: truncating long text with an ellipsis (very common in cards/lists):**
```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
```

**Use case: multi-line truncation (clamp to 3 lines):**
```css
.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Web fonts:**
```css
@font-face {
  font-family: "CustomFont";
  src: url("custom-font.woff2") format("woff2");
}
body { font-family: "CustomFont", sans-serif; }
```

---

# 7. Colors & Backgrounds

```css
.box {
  color: #333333;                       /* hex */
  color: rgb(51, 51, 51);
  color: rgba(51, 51, 51, 0.8);         /* with transparency */
  color: hsl(0, 0%, 20%);
  color: hsl(0 0% 20% / 0.8);           /* modern syntax with alpha */

  background-color: white;
  background-image: url("bg.jpg");
  background-size: cover;                /* fill container, cropping if needed */
  background-position: center;
  background-repeat: no-repeat;

  background: linear-gradient(to right, red, blue);
  background: radial-gradient(circle, yellow, orange);

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* x-offset y-offset blur color */
  border-radius: 8px;
  opacity: 0.9;
}
```

**Use case: a card with hover elevation effect:**
```css
.card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
```

---

# 8. Responsive Design

## 8.1 Media Queries

```css
/* Mobile-first approach (recommended): base styles for mobile, then override for larger screens */
.container {
  padding: 8px;
}

@media (min-width: 768px) {
  .container { padding: 16px; } /* tablets and up */
}

@media (min-width: 1024px) {
  .container { padding: 32px; } /* desktops and up */
}

/* Common breakpoint ranges (approximate, adjust to your design) */
/* Mobile:  < 768px       */
/* Tablet:  768px - 1023px */
/* Desktop: >= 1024px      */
```

## 8.2 Responsive Units

```css
.box {
  width: 50%;        /* relative to parent */
  font-size: 1.2rem;  /* relative to root (html) font-size — scales predictably */
  padding: 2em;        /* relative to THIS element's font-size */
  width: 100vw;         /* 100% of viewport width */
  height: 100vh;         /* 100% of viewport height */
  width: min(90%, 600px); /* responsive with a max cap — very useful */
  font-size: clamp(1rem, 2vw, 2rem); /* min, preferred, max — fluid typography */
}
```
**Use case: fluid heading that scales with viewport but has sane min/max:**
```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

## 8.3 Responsive Images

```css
img {
  max-width: 100%;
  height: auto; /* prevents images from overflowing their container */
}
```

---

# 9. Transitions & Animations

## 9.1 Transitions — Smooth Changes Between States

```css
.button {
  background: blue;
  transition: background 0.3s ease, transform 0.2s ease;
}
.button:hover {
  background: darkblue;
  transform: translateY(-2px);
}

/* Transition shorthand: property duration timing-function delay */
.box {
  transition: all 0.3s ease-in-out 0s;
}
```
**Timing functions:** `ease` (default, starts fast), `linear` (constant speed), `ease-in` (slow start), `ease-out` (slow end), `ease-in-out`, or custom `cubic-bezier()`.

**Use case: a smoothly expanding accordion:**
```css
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.accordion-content.open {
  max-height: 500px; /* large enough to fit content */
}
```

## 9.2 Keyframe Animations — For More Complex Sequences

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.element {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 1s linear infinite; /* loops forever */
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.notification-badge {
  animation: pulse 2s ease-in-out infinite;
}
```
**Use case: a loading spinner:**
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ddd;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

# 10. Transforms

```css
.box {
  transform: translateX(20px);        /* move horizontally */
  transform: translateY(-10px);       /* move vertically */
  transform: translate(20px, -10px);  /* both */
  transform: scale(1.1);               /* resize (1 = 100%) */
  transform: rotate(45deg);
  transform: skew(10deg, 0deg);
  transform: translate(-50%, -50%);    /* commonly paired with absolute centering */
}
```

**Use case: perfectly centering an absolutely positioned element (classic technique):**
```css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

# 11. CSS Variables (Custom Properties)

```css
:root {
  --primary-color: #3b82f6;
  --spacing-unit: 8px;
  --font-main: "Segoe UI", sans-serif;
}

.button {
  background: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  font-family: var(--font-main);
}

/* Fallback value if the variable isn't defined */
.box {
  color: var(--text-color, black);
}

/* Variables can be scoped/overridden per component or theme */
.dark-theme {
  --primary-color: #60a5fa;
  --bg-color: #111827;
}
```
**Use case: theme switching (dark mode) without duplicating every style:**
```css
:root {
  --bg: white;
  --text: black;
}
[data-theme="dark"] {
  --bg: #111;
  --text: #eee;
}
body {
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
}
```
```javascript
// Toggling the theme just requires flipping a data attribute
document.documentElement.setAttribute("data-theme", "dark");
```

---

# 12. Common Patterns & Use Cases (Combined)

**Card component with hover effect:**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
```

**Responsive navbar that collapses on mobile:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
.nav-links { display: flex; gap: 16px; }

@media (max-width: 768px) {
  .nav-links {
    display: none; /* hidden by default on mobile, toggled via JS + a class */
  }
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
  }
}
```

**Custom scrollable container with hidden scrollbar (webkit browsers):**
```css
.scroll-container {
  overflow-x: auto;
  scrollbar-width: none;         /* Firefox */
}
.scroll-container::-webkit-scrollbar {
  display: none;                  /* Chrome, Safari */
}
```

**Visually hidden but accessible to screen readers:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

---

# 13. Cheat Sheet

```css
/* Box model */
box-sizing: border-box;
margin / padding / border

/* Flexbox */
display: flex;
justify-content: flex-start | center | flex-end | space-between | space-around;
align-items: flex-start | center | flex-end | stretch;
flex: 1;
gap: 16px;

/* Grid */
display: grid;
grid-template-columns: repeat(3, 1fr);
grid-template-areas: "a b" "c c";
gap: 16px;

/* Positioning */
position: relative | absolute | fixed | sticky;
top / right / bottom / left;
z-index;

/* Responsive */
@media (min-width: 768px) { }
clamp(min, preferred, max)
min(a, b) / max(a, b)

/* Transitions/Animations */
transition: property duration timing-function;
@keyframes name { from {} to {} }
animation: name duration timing-function iteration-count;

/* Transforms */
transform: translate() scale() rotate();

/* Variables */
:root { --name: value; }
var(--name, fallback)

/* Common selectors */
.class  #id  [attr]  :hover  :nth-child()  ::before  > + ~
```
