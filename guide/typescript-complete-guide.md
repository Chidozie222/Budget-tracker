# The Complete TypeScript Guide

## 1. What TypeScript Is

TypeScript is a superset of JavaScript that adds static typing. It compiles ("transpiles") down to plain JavaScript, so anything that runs in JS can run TypeScript once compiled. The core value: catch type-related bugs at compile time instead of runtime.

```typescript
// JavaScript — no error until you run it
function add(a, b) { return a + b; }
add(2, "3"); // "23" — silent bug

// TypeScript — caught immediately
function add(a: number, b: number): number { return a + b; }
add(2, "3"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

Setup: `npm install -g typescript`, compile with `tsc file.ts`, or use `ts-node` to run directly.

---

## 2. Basic Types

```typescript
let age: number = 25;
let name: string = "Chidozie";
let isActive: boolean = true;
let tags: string[] = ["dev", "student"];
let coords: [number, number] = [10, 20]; // tuple — fixed length/types
let anything: any = "avoid this — disables type checking";
let notSure: unknown = 4; // safer than any — must narrow before use
let nothing: null = null;
let notDefined: undefined = undefined;
let neverReturns: never; // for functions that never return (throw/infinite loop)
```

### `any` vs `unknown`
```typescript
let a: any = 5;
a.toUpperCase(); // no error, even though numbers have no toUpperCase — runtime crash

let u: unknown = 5;
u.toUpperCase(); // Error — must narrow type first
if (typeof u === "string") {
  u.toUpperCase(); // OK now
}
```
**Rule of thumb:** prefer `unknown` over `any` whenever possible — it forces you to check the type before using it.

---

## 3. Interfaces and Type Aliases

Both describe the shape of an object. Mostly interchangeable; conventions differ by team.

```typescript
interface User {
  id: number;
  name: string;
  email?: string;        // optional property
  readonly createdAt: Date; // can't be reassigned after creation
}

type UserType = {
  id: number;
  name: string;
  email?: string;
};

const user: User = { id: 1, name: "Chidozie", createdAt: new Date() };
user.createdAt = new Date(); // Error — readonly
```

**When to use which:**
- `interface` — when defining object shapes, especially ones that might be extended later (classes implementing them, declaration merging).
- `type` — when you need unions, intersections, tuples, or mapped types (interfaces can't do these).

```typescript
// interface can extend
interface Admin extends User {
  permissions: string[];
}

// type can do unions — interface cannot
type Status = "active" | "inactive" | "pending";
```

---

## 4. Functions

```typescript
// Parameter and return types
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Optional and default parameters
function multiply(a: number, b: number = 2, c?: number): number {
  return c ? a * b * c : a * b;
}

// Rest parameters
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Arrow functions
const divide = (a: number, b: number): number => a / b;

// Function types
let operation: (a: number, b: number) => number;
operation = add;

// void — function returns nothing meaningful
function log(message: string): void {
  console.log(message);
}
```

---

## 5. Union and Intersection Types

**Union (`|`)** — value can be one of several types.
```typescript
function printId(id: number | string) {
  console.log(id);
}
printId(101);
printId("A101");
```

**Intersection (`&`)** — combines multiple types into one.
```typescript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged; // must have both name AND age

const p: Person = { name: "Chidozie", age: 25 };
```

**Discriminated unions** — a common, powerful pattern using a shared literal property to distinguish types.
```typescript
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; side: number };
type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
  }
}
```

---

## 6. Type Narrowing

TypeScript narrows a union type based on runtime checks.

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    value.toUpperCase(); // TS knows it's a string here
  } else {
    value.toFixed(2);    // TS knows it's a number here
  }
}

// Narrowing with instanceof
class Dog { bark() {} }
class Cat { meow() {} }
function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// Narrowing with "in"
type Fish = { swim: () => void };
type Bird = { fly: () => void };
function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}
```

---

## 7. Generics

Generics let you write reusable code that works with multiple types while keeping type safety.

```typescript
function identity<T>(value: T): T {
  return value;
}
identity<string>("hello"); // T = string
identity(42);              // T inferred as number

// Generic interfaces
interface Box<T> {
  contents: T;
}
const stringBox: Box<string> = { contents: "hi" };

// Generic constraints — T must have a "length" property
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}
logLength("hello");   // OK — strings have length
logLength([1, 2, 3]); // OK — arrays have length
logLength(42);        // Error — numbers don't have length

// Multiple type parameters
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
pair("age", 25); // ["age", 25]

// Generic classes
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
const numberStack = new Stack<number>();
```

---

## 8. Enums

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
let dir: Direction = Direction.Up; // 0

// String enums — more readable when logging/debugging
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}
let s: Status = Status.Active; // "ACTIVE"

// const enum — inlined at compile time, no runtime object generated
const enum Level { Low, Medium, High }
```
Note: many modern TS codebases prefer union string literal types (`type Status = "active" | "inactive"`) over enums, since they're simpler and don't generate extra JS.

---

## 9. Classes

```typescript
class Animal {
  private name: string;       // only accessible within this class
  protected age: number;      // accessible within this class and subclasses
  public species: string;     // accessible everywhere (default)
  readonly id: number;        // can't be changed after construction

  constructor(name: string, age: number, species: string, id: number) {
    this.name = name;
    this.age = age;
    this.species = species;
    this.id = id;
  }

  speak(): string {
    return `${this.name} makes a sound.`;
  }
}

// Shorthand constructor syntax (very common)
class Person {
  constructor(
    public name: string,
    private age: number,
    readonly id: number
  ) {}
}

// Inheritance
class Dog extends Animal {
  speak(): string {
    return `${super.speak()} Actually, it barks.`;
  }
}

// Abstract classes — can't be instantiated directly, must be extended
abstract class Shape {
  abstract area(): number; // subclasses must implement this
  describe(): string {
    return `Area is ${this.area()}`;
  }
}
class Square extends Shape {
  constructor(private side: number) { super(); }
  area(): number { return this.side ** 2; }
}

// Interfaces with classes
interface Flyable {
  fly(): void;
}
class Bird implements Flyable {
  fly() { console.log("Flying"); }
}
```

---

## 10. Type Assertions

Tell the compiler "trust me, I know the type" — use sparingly, it bypasses type checking.

```typescript
const input = document.getElementById("input") as HTMLInputElement;
input.value = "hello";

// Alternative angle-bracket syntax (not usable in .tsx files)
const input2 = <HTMLInputElement>document.getElementById("input");

// Non-null assertion — tells TS a value isn't null/undefined
function getLength(str: string | null) {
  return str!.length; // asserts str is not null (dangerous if wrong!)
}
```

---

## 11. Utility Types

Built-in generic types that transform other types — extremely commonly used.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

Partial<User>;      // all properties optional: { id?, name?, email? }
Required<User>;     // all properties required (opposite of Partial)
Readonly<User>;     // all properties readonly
Pick<User, "id" | "name">;    // only id and name
Omit<User, "email">;          // everything except email
Record<string, number>;       // object with string keys, number values

// Practical example
function updateUser(id: number, changes: Partial<User>) {
  // caller only needs to pass the fields they want to change
}
updateUser(1, { name: "New Name" }); // OK — email/id not required here

// Extract/Exclude — work with unions
type Status = "active" | "inactive" | "pending";
Extract<Status, "active" | "pending">; // "active" | "pending"
Exclude<Status, "pending">;            // "active" | "inactive"

// ReturnType / Parameters — extract function type info
function createUser(name: string, age: number) { return { name, age }; }
type NewUser = ReturnType<typeof createUser>; // { name: string; age: number }
type Params = Parameters<typeof createUser>;  // [string, number]
```

---

## 12. Type Guards

Custom functions that narrow types, using the `is` keyword.

```typescript
interface Cat { meow: () => void }
interface Dog { bark: () => void }

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TS knows it's a Cat here
  } else {
    animal.bark(); // TS knows it's a Dog here
  }
}
```

---

## 13. Modules (Import/Export)

```typescript
// math.ts
export function add(a: number, b: number): number { return a + b; }
export const PI = 3.14159;
export default class Calculator { /* ... */ }

// main.ts
import Calculator, { add, PI } from "./math";
import * as MathUtils from "./math"; // namespace import

// Type-only imports (doesn't emit JS import at runtime)
import type { User } from "./types";
```

---

## 14. Working with Async Code

```typescript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: User = await response.json();
  return data;
}

// Typing a Promise explicitly
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 15. Mapped and Conditional Types (Advanced)

**Mapped types** — build a new type by transforming each property of another.
```typescript
type Optional<T> = { [K in keyof T]?: T[K] };
type ReadonlyVersion<T> = { readonly [K in keyof T]: T[K] };

interface User { id: number; name: string; }
type OptionalUser = Optional<User>; // { id?: number; name?: string }
```

**Conditional types** — types that depend on a condition, like a ternary for types.
```typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// Practical: unwrap a Promise's inner type
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type Result = Unwrap<Promise<string>>; // string
```

---

## 16. `keyof`, `typeof`, and Indexed Access

```typescript
interface User { id: number; name: string; email: string; }

type UserKeys = keyof User; // "id" | "name" | "email"

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user: User = { id: 1, name: "Chidozie", email: "c@example.com" };
getProperty(user, "name"); // string, type-safe — "invalidKey" would error

// typeof — get the type of a variable/value
const config = { debug: true, env: "prod" };
type Config = typeof config; // { debug: boolean; env: string }

// Indexed access — get the type of a specific property
type UserId = User["id"]; // number
```

---

## 18. tsconfig.json Essentials

The compiler configuration file. Key options:

```json
{
  "compilerOptions": {
    "target": "ES2020",          // JS version to compile down to
    "module": "commonjs",        // module system (or "esnext" for bundlers)
    "strict": true,              // enables all strict type-checking options — use this
    "esModuleInterop": true,     // smoother interop with CommonJS modules
    "outDir": "./dist",          // compiled output location
    "rootDir": "./src",          // source files location
    "noImplicitAny": true,       // error on variables implicitly typed 'any'
    "skipLibCheck": true         // skip type-checking of .d.ts files (faster builds)
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```
`strict: true` is the single most important setting — it enables `strictNullChecks`, `noImplicitAny`, and others that catch the most bugs.

---

## 19. Declaration Files (`.d.ts`)

Used to describe the types of existing JavaScript code (like an untyped npm package).

```typescript
// mylib.d.ts
declare module "mylib" {
  export function doSomething(input: string): number;
}
```
Most popular packages have community-maintained types available via `npm install --save-dev @types/package-name` (e.g. `@types/node`, `@types/react`).

---

## 20. Common Patterns and Best Practices

- **Prefer `unknown` over `any`** when the type is genuinely not known yet.
- **Enable `strict` mode** from day one — retrofitting it onto a large codebase later is painful.
- **Use type inference where possible** — don't over-annotate. `let x = 5;` is already typed `number`; you don't need `let x: number = 5;`.
- **Use discriminated unions** instead of optional properties + type assertions for handling multiple shapes.
- **Avoid type assertions (`as`)** unless you genuinely know more than the compiler — they turn off safety checks.
- **Model your domain with types** — e.g. `type UserId = string` instead of raw `string` everywhere, to prevent mixing up IDs.
- **Use `readonly` and `Readonly<T>`** for data that shouldn't be mutated, especially function parameters.

```typescript
// Prevent id/name mixups with branded-like clarity
type UserId = string;
type ProductId = string;
function getUser(id: UserId) { /* ... */ }
```

---

## 21. Quick Reference Cheat Sheet

```typescript
string, number, boolean, null, undefined, void, any, unknown, never
string[]  or  Array<string>          // array
[string, number]                     // tuple
{ a: string; b?: number }            // object shape
A | B                                 // union
A & B                                 // intersection
(a: number) => string                // function type
<T>(x: T) => T                       // generic function
interface Foo { ... }                // interface
type Foo = { ... }                   // type alias
enum Foo { A, B }                    // enum
class Foo implements Bar { ... }     // class implementing interface
Partial<T> / Required<T> / Readonly<T> / Pick<T,K> / Omit<T,K> / Record<K,V>
keyof T                              // union of T's keys
typeof x                             // type of a value
T extends U ? X : Y                  // conditional type
```
