# The Complete JavaScript Guide (Array Methods, DOM & Async Focus)

## Table of Contents
1. Language Basics (quick pass)
2. **Array Methods (deep dive)**
3. **The DOM (deep dive)**
4. **Async JavaScript & Promises (deep dive)**
5. Objects & Classes
6. Functions & Scope
7. Everything Else (modules, error handling, misc features)
8. Cheat Sheet

---

# PART 1 — Language Basics

## 1.1 Variables

```javascript
let age = 25;        // block-scoped, reassignable
const name = "Chidozie"; // block-scoped, cannot be reassigned
var old = "avoid";   // function-scoped, legacy — avoid in modern code
```
`const` doesn't mean immutable — it means the *binding* can't change. Objects/arrays declared with `const` can still be mutated internally.

```javascript
const user = { name: "Chidozie" };
user.name = "New Name"; // allowed — mutating contents
user = {};              // Error — reassigning the binding itself
```

## 1.2 Data Types

```javascript
typeof 42;          // "number"
typeof "text";       // "string"
typeof true;         // "boolean"
typeof undefined;    // "undefined"
typeof null;         // "object" (a famous JS quirk/bug)
typeof {};           // "object"
typeof [];           // "object" (arrays are objects)
typeof function(){}; // "function"
typeof Symbol();     // "symbol"
typeof 10n;          // "bigint"
```

## 1.3 Operators Worth Knowing

```javascript
5 == "5";   // true  — loose equality, coerces types (avoid)
5 === "5";  // false — strict equality, no coercion (use this)

let x = null ?? "default";       // "default" — nullish coalescing (only null/undefined)
let y = 0 || "default";          // "default" — falsy coalescing (0 counts as falsy!)
let z = 0 ?? "default";          // 0 — ?? doesn't treat 0 as nullish

user?.address?.city; // optional chaining — no error if user or address is null/undefined
```

---

# PART 2 — Array Methods (Deep Dive)

This is where JavaScript really shines for data manipulation. Almost all array methods return either a new array, a value, or a boolean — very few mutate the original array (noted below where they do).

## 2.1 Transforming — `.map()`

Creates a **new array** by transforming every element. Use when you need the same number of items back, just changed.

```javascript
const prices = [10, 20, 30];
const withTax = prices.map(price => price * 1.08);
// [10.8, 21.6, 32.4]

// Use case: extracting a property from an array of objects
const users = [{ name: "Ada" }, { name: "Chidozie" }];
const names = users.map(u => u.name); // ["Ada", "Chidozie"]

// Use case: rendering-ready data (common before putting into the DOM)
const cardHtml = users.map(u => `<div class="card">${u.name}</div>`).join("");
```

## 2.2 Filtering — `.filter()`

Creates a **new array** with only elements that pass a test.

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0); // [2, 4, 6]

// Use case: search/filter UI
const products = [{ name: "Shirt", inStock: true }, { name: "Shoes", inStock: false }];
const available = products.filter(p => p.inStock);

// Use case: removing an item by id (common pattern — never mutate directly)
const removeItem = (list, id) => list.filter(item => item.id !== id);
```

## 2.3 Reducing — `.reduce()`

Boils an array down to a **single value** — a sum, an object, a grouped structure, anything.

```javascript
const numbers = [1, 2, 3, 4];
const total = numbers.reduce((acc, n) => acc + n, 0); // 10

// Use case: shopping cart total
const cart = [{ price: 10, qty: 2 }, { price: 5, qty: 3 }];
const total2 = cart.reduce((sum, item) => sum + item.price * item.qty, 0); // 35

// Use case: grouping data by a property — VERY common real use case
const people = [
  { name: "Ada", dept: "Eng" },
  { name: "Chidozie", dept: "Eng" },
  { name: "Sam", dept: "Sales" },
];
const byDept = people.reduce((groups, person) => {
  (groups[person.dept] ??= []).push(person);
  return groups;
}, {});
// { Eng: [{Ada...}, {Chidozie...}], Sales: [{Sam...}] }

// Use case: counting occurrences
const votes = ["yes", "no", "yes", "yes", "no"];
const counts = votes.reduce((acc, vote) => {
  acc[vote] = (acc[vote] || 0) + 1;
  return acc;
}, {});
// { yes: 3, no: 2 }
```

## 2.4 Searching — `.find()`, `.findIndex()`, `.includes()`, `.some()`, `.every()`

```javascript
const users = [{ id: 1, name: "Ada" }, { id: 2, name: "Chidozie" }];

users.find(u => u.id === 2);        // { id: 2, name: "Chidozie" } — first match, or undefined
users.findIndex(u => u.id === 2);   // 1 — index of first match, or -1
[1, 2, 3].includes(2);              // true — does array contain this value?

// .some() — does AT LEAST ONE element pass? (short-circuits)
const hasAdmin = users.some(u => u.role === "admin");

// .every() — do ALL elements pass?
const allActive = users.every(u => u.isActive);
```
**Use case:** form validation — check if every field is filled:
```javascript
const fields = [name, email, password];
const isFormValid = fields.every(f => f.trim().length > 0);
```

## 2.5 Sorting — `.sort()`

**Mutates the original array.** Without a comparator, it sorts as strings (surprising for numbers!).

```javascript
[10, 1, 21].sort();                    // [1, 10, 21] as numbers? NO — ["1", "10", "21"] string order... actually [1, 10, 21] due to lexical sort quirks
[10, 1, 21].sort((a, b) => a - b);     // [1, 10, 21] — correct ascending numeric sort
[10, 1, 21].sort((a, b) => b - a);     // [21, 10, 1] — descending

// Use case: sort objects by a property
const people = [{ age: 30 }, { age: 20 }, { age: 25 }];
people.sort((a, b) => a.age - b.age); // ascending by age

// Avoiding mutation — copy first (important! .sort() mutates in place)
const sorted = [...people].sort((a, b) => a.age - b.age);
```

## 2.6 Iterating — `.forEach()`

Runs a function for each element, returns `undefined`. Use only for side effects (logging, DOM updates) — never chain after it.

```javascript
[1, 2, 3].forEach(n => console.log(n));

// Use case: updating the DOM for each item (see Part 3)
document.querySelectorAll(".item").forEach(el => el.classList.add("active"));
```

## 2.7 Combining/Restructuring — `.slice()`, `.splice()`, `.concat()`, `.flat()`, `.flatMap()`

```javascript
// .slice(start, end) — NON-mutating, extracts a portion
const arr = [1, 2, 3, 4, 5];
arr.slice(1, 3); // [2, 3] — original unchanged

// .splice(start, deleteCount, ...items) — MUTATES, adds/removes in place
arr.splice(1, 2);          // removes [2,3], arr is now [1,4,5]
arr.splice(1, 0, "new");   // inserts "new" at index 1, no deletion

// .concat() — NON-mutating, merges arrays
[1, 2].concat([3, 4]); // [1, 2, 3, 4]
// modern alternative: spread
[...[1, 2], ...[3, 4]]; // [1, 2, 3, 4]

// .flat(depth) — flattens nested arrays
[1, [2, 3], [4, [5, 6]]].flat();    // [1, 2, 3, 4, [5, 6]] — depth 1
[1, [2, 3], [4, [5, 6]]].flat(2);   // [1, 2, 3, 4, 5, 6] — depth 2

// .flatMap() — map then flatten one level (efficient combo)
const sentences = ["hello world", "foo bar"];
sentences.flatMap(s => s.split(" ")); // ["hello", "world", "foo", "bar"]
```

## 2.8 Other Frequently Used Methods

```javascript
Array.from({ length: 5 }, (_, i) => i);   // [0, 1, 2, 3, 4] — generate a range
Array.isArray(value);                      // true/false type check
[1, 2, 3].join("-");                       // "1-2-3"
[1, 2, 3].reverse();                       // mutates! [3, 2, 1]
[1, [2, 3]].at(-1);                        // last element (supports negative index)
```

## 2.9 Method Chaining — Real Use Case

This is where array methods become genuinely powerful — chain them to express a full data pipeline in one readable statement.

```javascript
const orders = [
  { customer: "Ada", total: 120, paid: true },
  { customer: "Chidozie", total: 80, paid: false },
  { customer: "Ada", total: 200, paid: true },
];

// "Total revenue from paid orders, per customer, sorted highest first"
const report = Object.entries(
  orders
    .filter(o => o.paid)
    .reduce((acc, o) => {
      acc[o.customer] = (acc[o.customer] || 0) + o.total;
      return acc;
    }, {})
)
  .map(([customer, total]) => ({ customer, total }))
  .sort((a, b) => b.total - a.total);

// [{ customer: "Ada", total: 320 }]
```

---

# PART 3 — The DOM (Deep Dive)

## 3.1 Selecting Elements

```javascript
document.getElementById("header");              // single element by id
document.querySelector(".card");                // first match (CSS selector)
document.querySelectorAll(".card");              // NodeList of ALL matches
document.getElementsByClassName("card");         // live HTMLCollection (older API)
document.getElementsByTagName("li");             // live HTMLCollection
```
**Use `querySelector`/`querySelectorAll` in modern code** — they accept any CSS selector, which is more flexible than the older `getElementBy*` methods.

```javascript
// querySelectorAll returns a NodeList — iterate with forEach (modern browsers support this)
document.querySelectorAll(".item").forEach(item => console.log(item.textContent));

// Convert to a real array if you need array methods like .map()/.filter()
const items = Array.from(document.querySelectorAll(".item"));
const texts = items.map(el => el.textContent);
```

## 3.2 Reading and Changing Content

```javascript
const el = document.querySelector("#title");

el.textContent = "New Title";       // sets text only, safe from injection
el.innerHTML = "<b>Bold Title</b>"; // sets HTML — be careful with user input here (XSS risk)
el.innerText;                        // like textContent but respects CSS visibility

// Attributes
el.getAttribute("data-id");
el.setAttribute("data-id", "42");
el.removeAttribute("disabled");
el.hasAttribute("hidden");

// Common shortcuts for standard attributes
const img = document.querySelector("img");
img.src = "new-image.png";
img.alt = "Description";

const input = document.querySelector("input");
input.value;          // current input value
input.value = "text"; // set input value
input.disabled = true;
```

## 3.3 Styling and Classes

```javascript
const el = document.querySelector(".box");

el.style.color = "blue";
el.style.display = "none";

el.classList.add("active");
el.classList.remove("hidden");
el.classList.toggle("open");           // adds if absent, removes if present
el.classList.contains("active");       // true/false
el.classList.toggle("open", isOpen);   // force add (true) or remove (false)
```
**Use case:** toggling a mobile nav menu:
```javascript
document.querySelector("#menuButton").addEventListener("click", () => {
  document.querySelector("#navMenu").classList.toggle("open");
});
```

## 3.4 Creating and Modifying Structure

```javascript
// Create an element
const div = document.createElement("div");
div.className = "card";
div.textContent = "New card";

// Insert it into the page
document.body.appendChild(div);              // add as last child
parentEl.prepend(div);                        // add as first child
referenceEl.before(div);                      // insert before a specific element
referenceEl.after(div);                       // insert after a specific element
parentEl.insertBefore(div, referenceEl);      // older API, still common

// Remove an element
div.remove();                                 // modern, simple
parentEl.removeChild(div);                    // older API

// Use case: rendering a list of items dynamically
function renderList(items) {
  const ul = document.querySelector("#list");
  ul.innerHTML = ""; // clear existing content
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name;
    ul.appendChild(li);
  });
}
```

## 3.5 Events

```javascript
const button = document.querySelector("#submitBtn");

button.addEventListener("click", (event) => {
  console.log("Clicked!", event.target);
});

// Remove a listener (must reference the same function)
function handleClick() { console.log("clicked"); }
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);

// Common event object properties
button.addEventListener("click", (e) => {
  e.preventDefault();       // stop default behavior (e.g. form submission/link navigation)
  e.stopPropagation();      // stop the event from bubbling up to parent elements
  e.target;                 // the element that triggered the event
  e.currentTarget;          // the element the listener is attached to
});
```

### Event Delegation — Important Real-World Pattern
Instead of attaching a listener to every item (expensive, and misses future items), attach ONE listener to a parent and check what was clicked.

```javascript
document.querySelector("#todoList").addEventListener("click", (e) => {
  if (e.target.matches(".delete-btn")) {
    e.target.closest("li").remove();
  }
  if (e.target.matches(".complete-btn")) {
    e.target.closest("li").classList.toggle("done");
  }
});
// Works even for <li> items added to the list AFTER this listener was set up
```

### Common Events
```javascript
element.addEventListener("click", handler);
element.addEventListener("submit", handler);      // form submission
element.addEventListener("input", handler);       // every keystroke in a text field
element.addEventListener("change", handler);      // value change committed (e.g. blur, select change)
element.addEventListener("keydown", handler);
element.addEventListener("mouseenter", handler);
document.addEventListener("DOMContentLoaded", handler); // DOM fully parsed, before images/styles finish
window.addEventListener("load", handler);          // everything finished loading
window.addEventListener("resize", handler);
```

## 3.6 Forms — Real Use Case

```javascript
const form = document.querySelector("#signupForm");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the page from reloading

  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email.includes("@")) {
    document.querySelector("#error").textContent = "Invalid email";
    return;
  }

  console.log("Submitting:", { email, password });
  // typically followed by a fetch() call — see Part 4
});
```

## 3.7 Traversing the DOM

```javascript
el.parentElement;
el.children;              // direct child elements
el.firstElementChild;
el.lastElementChild;
el.nextElementSibling;
el.previousElementSibling;
el.closest(".card");      // nearest ancestor (or self) matching selector
el.contains(otherEl);     // is otherElement a descendant?
```

---

# PART 4 — Async JavaScript & Promises (Deep Dive)

## 4.1 The Problem Promises Solve

JavaScript is single-threaded — long-running operations (network requests, timers, file reads) can't block the main thread. Promises represent a value that will exist **eventually**.

```javascript
// A Promise has 3 states: pending → fulfilled OR rejected
const promise = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) resolve("Data loaded");
    else reject(new Error("Failed to load"));
  }, 1000);
});
```

## 4.2 Consuming Promises — `.then()`/`.catch()`/`.finally()`

```javascript
promise
  .then(result => console.log(result))       // runs on success
  .catch(error => console.error(error))       // runs on failure
  .finally(() => console.log("Done either way")); // always runs

// Chaining — each .then() can return a new value or promise
fetchUser(1)
  .then(user => fetchOrders(user.id))   // returns another promise
  .then(orders => console.log(orders))
  .catch(err => console.error("Something failed:", err));
```

## 4.3 `async`/`await` — Cleaner Syntax for Promises

`await` can only be used inside an `async` function. It pauses execution until the promise resolves, without blocking the rest of the app.

```javascript
async function loadUserData(id) {
  try {
    const user = await fetchUser(id);
    const orders = await fetchOrders(user.id);
    return { user, orders };
  } catch (error) {
    console.error("Failed to load:", error);
    throw error; // re-throw if the caller needs to know
  }
}
```
**Rule of thumb:** `async/await` is syntactic sugar over `.then()` chains — same underlying mechanism, easier to read, especially with multiple sequential steps.

## 4.4 `fetch()` — Real-World Use Case: Calling an API

```javascript
async function getUsers() {
  const response = await fetch("https://api.example.com/users");
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

// POST request with a body
async function createUser(user) {
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return response.json();
}

// Use case: loading data and rendering it into the DOM (combines Parts 2, 3 & 4)
async function loadAndRenderUsers() {
  const list = document.querySelector("#userList");
  list.textContent = "Loading...";
  try {
    const users = await getUsers();
    list.innerHTML = users.map(u => `<li>${u.name}</li>`).join("");
  } catch (err) {
    list.textContent = "Failed to load users";
  }
}
```

## 4.5 Running Promises Concurrently

```javascript
// Sequential — SLOW, each waits for the previous one
const user = await fetchUser(1);
const orders = await fetchOrders(1);
// total time ≈ time(user) + time(orders)

// Concurrent — FAST, both start immediately
const [user2, orders2] = await Promise.all([fetchUser(1), fetchOrders(1)]);
// total time ≈ max(time(user), time(orders))

// Promise.all — fails fast: if ANY promise rejects, the whole thing rejects immediately
// Promise.allSettled — waits for ALL, gives you success/failure for each individually
const results = await Promise.allSettled([fetchUser(1), fetchUser(999)]);
results.forEach(r => {
  if (r.status === "fulfilled") console.log(r.value);
  else console.log("Failed:", r.reason);
});

// Promise.race — resolves/rejects as soon as the FIRST promise settles
const fastest = await Promise.race([fetchFromServerA(), fetchFromServerB()]);

// Promise.any — resolves as soon as the FIRST one succeeds (ignores rejections unless all fail)
const firstSuccess = await Promise.any([fetchFromServerA(), fetchFromServerB()]);
```

## 4.6 Common Async Patterns and Pitfalls

```javascript
// PITFALL: forEach does NOT wait for async callbacks
[1, 2, 3].forEach(async (n) => {
  await delay(1000);
  console.log(n); // all fire almost simultaneously, forEach doesn't await them
});

// FIX: use a regular for loop for sequential async work
for (const n of [1, 2, 3]) {
  await delay(1000);
  console.log(n); // waits 1 second between each
}

// FIX: use Promise.all with map for concurrent async work
await Promise.all([1, 2, 3].map(async (n) => {
  await delay(1000);
  console.log(n); // all run concurrently, ~1 second total
}));
```

### Debouncing an async search input — real use case combining DOM + async
```javascript
let timeoutId;
document.querySelector("#search").addEventListener("input", (e) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    const results = await fetch(`/api/search?q=${e.target.value}`).then(r => r.json());
    renderResults(results);
  }, 300); // waits 300ms after the user stops typing before firing the request
});
```

## 4.7 Timers

```javascript
setTimeout(() => console.log("Runs once after 2s"), 2000);
const intervalId = setInterval(() => console.log("Runs every 1s"), 1000);
clearInterval(intervalId); // stop it

// A promise-based delay helper, used constantly in async code
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
await delay(1000);
```

---

# PART 5 — Objects & Classes

## 5.1 Objects

```javascript
const user = { name: "Chidozie", age: 25 };

// Destructuring
const { name, age } = user;
const { name: userName = "Anonymous" } = user; // rename + default

// Spread — shallow copy / merge
const updated = { ...user, age: 26 };

// Object methods
Object.keys(user);              // ["name", "age"]
Object.values(user);            // ["Chidozie", 25]
Object.entries(user);           // [["name","Chidozie"], ["age",25]]
Object.assign({}, user, { age: 30 }); // merge (older alternative to spread)
Object.freeze(user);            // prevent mutation
```

## 5.2 Classes

```javascript
class User {
  #password; // private field (# prefix)

  constructor(name, password) {
    this.name = name;
    this.#password = password;
  }

  greet() {
    return `Hello, ${this.name}`;
  }

  static create(name) { // static method — called on the class, not an instance
    return new User(name, "default");
  }
}

class Admin extends User {
  constructor(name, password) {
    super(name, password);
    this.role = "admin";
  }
  greet() {
    return `${super.greet()} (Admin)`;
  }
}

const admin = new Admin("Chidozie", "secret");
admin.greet(); // "Hello, Chidozie (Admin)"
```

---

# PART 6 — Functions & Scope

```javascript
function regular(a, b) { return a + b; }
const arrow = (a, b) => a + b;

// Arrow functions don't have their own `this` — they inherit it from enclosing scope
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => {
      this.seconds++; // `this` correctly refers to the Timer instance
    }, 1000);
  }
}

// Default and rest parameters
function greet(name = "Guest", ...otherArgs) {
  console.log(name, otherArgs);
}

// Closures — a function "remembers" the scope it was created in
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
counter(); // 1
counter(); // 2 — count persisted between calls

// IIFE — Immediately Invoked Function Expression (older pattern for scoping)
(function () {
  console.log("Runs immediately");
})();
```

---

# PART 7 — Everything Else

## 7.1 Modules

```javascript
// math.js
export function add(a, b) { return a + b; }
export default class Calculator {}

// main.js
import Calculator, { add } from "./math.js";
```

## 7.2 Error Handling

```javascript
try {
  JSON.parse("invalid json");
} catch (error) {
  console.error(error.message);
} finally {
  console.log("Always runs");
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
throw new ValidationError("Email is required");
```

## 7.3 JSON

```javascript
JSON.stringify({ a: 1, b: [1, 2] }); // '{"a":1,"b":[1,2]}'
JSON.parse('{"a":1}');               // { a: 1 }
```

## 7.4 Template Literals & Tagged Templates

```javascript
const name = "Chidozie";
`Hello ${name}`;              // basic interpolation
`Line 1
Line 2`;                       // multi-line strings

// Tagged templates (advanced, used by libraries like styled-components)
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) => `${acc}${str}${values[i] ? `**${values[i]}**` : ""}`, "");
}
highlight`Hello ${name}, you are ${25} years old`;
```

## 7.5 Symbols, Map, Set

```javascript
const map = new Map();
map.set("key", "value");
map.get("key");
map.has("key");
map.delete("key");
// Map preserves insertion order and allows any type as a key (unlike plain objects)

const set = new Set([1, 2, 2, 3]); // {1, 2, 3} — unique values only
set.add(4);
set.has(2); // true
```

## 7.6 Iterators and Generators

```javascript
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}
for (const n of numberGenerator()) {
  console.log(n); // 1, 2, 3
}
```

---

# PART 8 — Cheat Sheet

```javascript
// Array methods (most-used, roughly by frequency)
.map() .filter() .reduce() .find() .forEach() .some() .every()
.sort() .slice() .splice() .includes() .flat() .flatMap() .join()

// DOM
document.querySelector() / querySelectorAll()
el.textContent / el.innerHTML / el.classList / el.style
el.addEventListener(event, handler)
document.createElement() / el.appendChild() / el.remove()

// Async
async function f() { await promise; }
promise.then().catch().finally()
Promise.all([...]) / Promise.allSettled([...]) / Promise.race([...])
fetch(url).then(r => r.json())

// Misc
const { a, b } = obj;         // destructuring
const [x, y] = arr;
{ ...obj }  [ ...arr ]        // spread
a ?? b   a?.b                 // nullish coalescing, optional chaining
class X extends Y { }
```
