# The Complete Next.js Guide (In-Depth Edition)

This version goes deeper on *why* things work the way they do, not just the syntax. Every concept has a worked example. Read Section 4 (Server vs. Client Components) slowly — it's the one idea that unlocks everything else.

---

## 1. What Next.js Actually Is

Plain React answers one question: "how do I build UI out of components?" It doesn't answer: how do pages map to URLs, how does data get from a server to a component, how is the app bundled, how is it deployed, how are images optimized. Every React app eventually needs answers to all of that, so teams either hand-roll them or reach for a framework. Next.js is that framework.

Concretely, when you run `next dev`, Next.js is:
1. Running a Node.js server that renders your React components into HTML on-demand.
2. Watching your `app/` folder and turning its structure into routes automatically.
3. Bundling your client-side JavaScript with a compiler (currently based on Turbopack/webpack).
4. Giving you conventions (special filenames) instead of configuration, so most decisions are made for you.

This guide uses the **App Router** (the `app/` directory), which is the current standard as of Next.js 13+ and is built on **React Server Components** — a genuinely new rendering model, not just a Next.js quirk.

---

## 2. Getting Started — A Full Walkthrough

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

Say yes to TypeScript, App Router, and Tailwind when prompted, unless you have a specific reason not to. Visit `http://localhost:3000` and you'll see the default starter page.

**Resulting structure:**
```
my-app/
├── app/
│   ├── layout.tsx      # wraps every page in the app
│   ├── page.tsx        # the home page → route "/"
│   └── globals.css
├── public/              # served as-is at the root URL, e.g. public/logo.png → /logo.png
├── next.config.js
├── tailwind.config.ts
└── package.json
```

Let's replace the default home page with something concrete so every later example builds on it:

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to my app</h1>
      <p>This is the home page, served at "/"</p>
    </main>
  );
}
```

```tsx
// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h2>My App</h2>
        </header>
        {children}
        <footer>© 2026</footer>
      </body>
    </html>
  );
}
```

Notice: `layout.tsx` renders `{children}` — that's where `page.tsx` (or nested layouts/pages) gets injected. The header and footer here will appear on *every* page in the app, without you repeating them.

---

## 3. Routing — File System as URL Map, With a Real Example

Imagine you're building a small blog. Here's the folder structure and the URLs it produces:

```
app/
├── page.tsx                    →  /
├── about/
│   └── page.tsx                 →  /about
├── blog/
│   ├── page.tsx                 →  /blog              (list of posts)
│   └── [slug]/
│       └── page.tsx             →  /blog/my-first-post  (one post)
└── dashboard/
    ├── layout.tsx                (wraps everything under /dashboard)
    ├── page.tsx                  →  /dashboard
    └── settings/
        └── page.tsx              →  /dashboard/settings
```

**Example: the blog list page fetching and linking to posts:**

```tsx
// app/blog/page.tsx
import Link from "next/link";

async function getPosts() {
  const res = await fetch("https://my-cms.example.com/posts");
  return res.json();
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post: { slug: string; title: string }) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Example: the dynamic post page reading the URL parameter:**

```tsx
// app/blog/[slug]/page.tsx
async function getPost(slug: string) {
  const res = await fetch(`https://my-cms.example.com/posts/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

Walk through what happens when a user clicks a blog link:
1. The browser navigates to `/blog/my-first-post`.
2. Next.js matches this to `app/blog/[slug]/page.tsx` and sets `params.slug = "my-first-post"`.
3. The component runs on the server, fetches that one post, and renders HTML.
4. `<Link>` had already prefetched this route in the background when it scrolled into view, so the navigation feels instant.

**Catch-all routes**, for comparison — useful when depth is unknown (e.g., a nested docs site):
```
app/docs/[...slug]/page.tsx
```
- `/docs/a` → `params.slug = ["a"]`
- `/docs/a/b/c` → `params.slug = ["a", "b", "c"]`
- `/docs` → 404 (catch-all requires at least one segment; use `[[...slug]]` — double brackets — to also match `/docs` itself)

---

## 4. Server Components vs. Client Components — The Core Mental Model

This is the part that trips up everyone coming from plain React (Create React App, Vite+React), because in those setups *everything* is a "client component" by default — your code always ends up running in the browser. In the Next.js App Router, that assumption flips.

### The analogy

Think of your app as a restaurant. A **Server Component** is like a dish prepared entirely in the kitchen — the customer just receives the finished plate (HTML). A **Client Component** is like a make-your-own-taco bar — the ingredients (JavaScript) have to be shipped out to the table so the customer can assemble and interact with it themselves.

You want as much prepared in the kitchen as possible — it's faster and cheaper. You only send raw ingredients to the table when the customer actually needs to *do* something themselves (click, type, drag).

### Server Components (the default)

Every file under `app/` is a Server Component unless you say otherwise. Concretely:

```tsx
// app/products/page.tsx  (Server Component — no directive needed)
async function getProducts() {
  const res = await fetch("https://api.example.com/products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts(); // runs on the server, at request/build time

  return (
    <ul>
      {products.map((p: any) => (
        <li key={p.id}>{p.name} — ${p.price}</li>
      ))}
    </ul>
  );
}
```

What's notable here:
- The `async`/`await` is directly in the component — no `useEffect`, no loading state juggling for the initial render.
- This code — including the `fetch` URL, and any API keys used in it — **never reaches the browser**. Only the resulting HTML does.
- You **cannot** use `useState`, `useEffect`, `onClick`, or anything that depends on the browser here. If you try, you'll get a build error.

### Client Components (opt-in)

Add `"use client"` as the very first line of the file. This tells Next.js "compile this and ship its JavaScript to the browser too, because it needs interactivity":

```tsx
// app/products/AddToCartButton.tsx
"use client";

import { useState } from "react";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  return (
    <button onClick={() => setAdded(true)}>
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
```

### Putting them together (the pattern you'll use constantly)

The idiomatic pattern is: **Server Component fetches data → passes it down → a small Client Component handles the interactive slice.**

```tsx
// app/products/page.tsx  (Server Component)
import AddToCartButton from "./AddToCartButton";

async function getProducts() {
  const res = await fetch("https://api.example.com/products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ul>
      {products.map((p: any) => (
        <li key={p.id}>
          {p.name} — ${p.price}
          <AddToCartButton productId={p.id} /> {/* the only "client" part */}
        </li>
      ))}
    </ul>
  );
}
```

Here, the page itself — including the data fetch — stays a Server Component. Only `AddToCartButton` ships JavaScript to the browser, and it's tiny. If you'd made the *whole page* a Client Component just because one button needed `onClick`, you'd force the entire product list, and the fetch logic, into client-side JavaScript unnecessarily — bigger bundle, slower page, and you'd lose the ability to fetch data directly.

### Quick decision table

| You need... | Component type |
|---|---|
| To fetch data | Server (default) |
| To read a `.env` secret or hit a database | Server (default) |
| `useState`, `useReducer` | Client |
| `useEffect`, `useLayoutEffect` | Client |
| `onClick`, `onChange`, any event handler | Client |
| `window`, `localStorage`, `document` | Client |
| Third-party libraries that use hooks internally (e.g. most chart libraries) | Client |
| Just displaying static or server-fetched content | Server (default) |

### A common mistake, and the fix

```tsx
// ❌ WRONG: whole page marked client just because of one interactive bit
"use client";
import { useState } from "react";

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h1>Welcome</h1> {/* static content, forced into the client bundle for no reason */}
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && <p>Details...</p>}
    </div>
  );
}
```

```tsx
// ✅ BETTER: split it
// app/page.tsx (Server Component — default, no directive)
import Toggle from "./Toggle";

export default function Page() {
  return (
    <div>
      <h1>Welcome</h1>
      <Toggle />
    </div>
  );
}
```
```tsx
// app/Toggle.tsx (Client Component — only this ships JS)
"use client";
import { useState } from "react";

export default function Toggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && <p>Details...</p>}
    </>
  );
}
```

---

## 5. Data Fetching, In Depth

### The three caching behaviors

Next.js extends the native `fetch` with a `cache`/`next` option that controls how long the result is reused:

```tsx
// 1. Static (default) — fetched once, reused for every visitor until manually revalidated
const res = await fetch("https://api.example.com/posts");

// 2. Dynamic — fetched fresh on every single request
const res = await fetch("https://api.example.com/posts", { cache: "no-store" });

// 3. Time-based revalidation (ISR) — cached, but refreshed at most every N seconds
const res = await fetch("https://api.example.com/posts", { next: { revalidate: 60 } });
```

**Worked example — a dashboard that must always be fresh vs. a blog that can be mostly static:**

```tsx
// app/dashboard/page.tsx — always show live numbers
async function getStats() {
  const res = await fetch("https://api.example.com/stats", { cache: "no-store" });
  return res.json();
}

export default async function Dashboard() {
  const stats = await getStats();
  return <p>Current users online: {stats.online}</p>;
}
```

```tsx
// app/blog/page.tsx — content rarely changes, but shouldn't go stale forever either
async function getPosts() {
  const res = await fetch("https://my-cms.example.com/posts", {
    next: { revalidate: 3600 }, // refresh at most once an hour
  });
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

### Fetching from a database directly (no external API)

You don't need `fetch` at all if you're talking to a database — just call your query function directly inside the Server Component:

```tsx
// app/users/page.tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.query("SELECT id, name FROM users ORDER BY name");

  return (
    <ul>
      {users.rows.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```
This works because the component runs on the server — the database credentials in `lib/db.ts` never touch the browser.

### Parallel vs. sequential fetching (a real performance trap)

```tsx
// ❌ SLOW: sequential — each await blocks the next
export default async function Page() {
  const user = await getUser();        // waits...
  const posts = await getPosts();      // then waits again
  return <Profile user={user} posts={posts} />;
}
```
```tsx
// ✅ FAST: parallel — both requests fire at once
export default async function Page() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return <Profile user={user} posts={posts} />;
}
```
If `getUser()` and `getPosts()` don't depend on each other, the sequential version wastes time waiting twice when it could wait once.

---

## 6. Rendering Strategies, With Timing Diagrams in Words

**Static Rendering (default):** HTML is generated once (at build time, or on first request and then cached) and reused for everyone. Best for marketing pages, blog posts, docs.

**Dynamic Rendering:** HTML is generated per request. Triggered automatically the moment you use `cookies()`, `headers()`, `searchParams`, or a `no-store` fetch anywhere in the route. Best for dashboards, personalized pages, anything reading a logged-in user's data.

**Streaming with Suspense:** lets you send the fast parts of a page immediately and "stream in" the slow parts as they finish, instead of making the whole page wait on the slowest piece.

**Worked example:**
```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

async function SlowRevenueChart() {
  const data = await fetch("https://api.example.com/revenue", { cache: "no-store" }).then(r => r.json());
  // pretend this API takes 2 full seconds to respond
  return <Chart data={data} />;
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>              {/* shows immediately */}
      <UserGreeting />                {/* shows immediately */}
      <Suspense fallback={<p>Loading revenue chart...</p>}>
        <SlowRevenueChart />          {/* streams in once its 2s fetch finishes */}
      </Suspense>
    </div>
  );
}
```
The user sees the heading and greeting instantly, with a loading message where the chart will appear — then the chart pops in when ready, with no full-page spinner and no blocking.

**ISR (Incremental Static Regeneration)** is just the `revalidate` option from Section 5 applied at the page level — you get the speed of a static page with periodic background refreshes, without rebuilding your whole site.

---

## 7. API Routes (Route Handlers) — A Full CRUD Example

```ts
// app/api/todos/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/todos
export async function GET() {
  const todos = await db.todo.findMany();
  return NextResponse.json(todos);
}

// POST /api/todos
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const todo = await db.todo.create({ data: { title: body.title } });
  return NextResponse.json(todo, { status: 201 });
}
```

```ts
// app/api/todos/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/todos/123
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await db.todo.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

Calling it from a Client Component:
```tsx
"use client";
import { useState } from "react";

export default function TodoForm() {
  const [title, setTitle] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Add Todo</button>
    </form>
  );
}
```
Use API routes when the consumer is external (a webhook from Stripe, a mobile app, a third party) — for your own app's forms, Server Actions (next section) are usually less code.

---

## 8. Server Actions — Mutations Without a Separate API

A Server Action is a function marked `"use server"` that a form (or any client code) can call directly, as if it were a normal JavaScript function — Next.js handles the network request under the hood.

**Full worked example — an add-todo form, no `/api` route needed at all:**

```ts
// app/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTodo(formData: FormData) {
  const title = formData.get("title") as string;

  if (!title) {
    throw new Error("Title is required");
  }

  await db.todo.create({ data: { title } });
  revalidatePath("/todos"); // tells Next.js "the /todos page's cached data is now stale, refresh it"
}
```

```tsx
// app/todos/page.tsx
import { createTodo } from "@/app/actions";
import { db } from "@/lib/db";

export default async function TodosPage() {
  const todos = await db.todo.findMany();

  return (
    <div>
      <form action={createTodo}>
        <input name="title" placeholder="New todo" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((t) => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  );
}
```

What happens on submit:
1. The browser doesn't do a normal form POST — Next.js intercepts it and calls `createTodo` on the server with the form's data.
2. `createTodo` inserts the row, then calls `revalidatePath("/todos")`.
3. Next.js re-renders `TodosPage` on the server with fresh data and sends the update back — no manual `fetch`, no manual state update, no API route file.

Server Actions can also be called from Client Component event handlers directly (not just `<form action={...}>`), which is useful for buttons like "delete":
```tsx
"use client";
import { deleteTodo } from "@/app/actions";

export default function DeleteButton({ id }: { id: string }) {
  return <button onClick={() => deleteTodo(id)}>Delete</button>;
}
```

---

## 9. Layouts, Metadata, and SEO — Worked Example

**Nested layout for a dashboard section**, so the sidebar isn't re-rendered on every navigation within `/dashboard/*`:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <nav>
        <a href="/dashboard">Overview</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```
Navigating between `/dashboard` and `/dashboard/settings` keeps this `<nav>` mounted — only `{children}` swaps.

**Static metadata:**
```tsx
// app/about/page.tsx
export const metadata = {
  title: "About Us",
  description: "Learn more about our company",
};

export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

**Dynamic metadata**, generated per-item — crucial for blogs/e-commerce so each page has a unique title/description for search engines and social previews:
```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}
```

---

## 10. Styling — Three Approaches Compared

**Tailwind (utility classes, set up by `create-next-app`):**
```tsx
export default function Card() {
  return <div className="rounded-lg bg-white p-4 shadow-md">Hello</div>;
}
```

**CSS Modules (scoped per-file, no naming collisions):**
```css
/* app/Card.module.css */
.card {
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```
```tsx
import styles from "./Card.module.css";
export default function Card() {
  return <div className={styles.card}>Hello</div>;
}
```

**Global CSS**, imported once in the root layout — for resets, base typography, CSS variables:
```css
/* app/globals.css */
:root { --primary-color: #0070f3; }
body { margin: 0; font-family: sans-serif; }
```

---

## 11. Images and Fonts, With Before/After

**Before (plain `<img>`)** — no lazy-loading, no automatic resizing, layout shift risk:
```tsx
<img src="/hero.jpg" alt="Hero" />
```

**After (`next/image`)** — automatically serves the right size for the device, lazy-loads offscreen images, and prevents layout shift because width/height are required:
```tsx
import Image from "next/image";

export default function Hero() {
  return <Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />;
}
```
`priority` tells Next.js to load this image eagerly — use it only for above-the-fold images like a hero banner.

**Fonts**, self-hosted automatically (no request to Google Fonts at runtime, which improves privacy and speed):
```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 12. Environment Variables — What Leaks and What Doesn't

```
# .env.local
DATABASE_URL=postgres://user:pass@host/db      # server-only, never sent to the browser
STRIPE_SECRET_KEY=sk_live_xxxxx                 # server-only
NEXT_PUBLIC_API_URL=https://api.example.com     # exposed to the browser — anyone can see this
```

The rule: if the variable name doesn't start with `NEXT_PUBLIC_`, it's only readable inside Server Components, Route Handlers, and Server Actions — never inside a `"use client"` file. This is intentional: it's the mechanism that keeps secrets out of the browser bundle.

---

## 13. Middleware — Worked Auth Example

```ts
// middleware.ts (project root, next to package.json)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// only run this middleware for paths under /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
```
This runs before the route even renders, on Next.js's Edge runtime (fast, minimal cold start) — so an unauthenticated user is redirected to `/login?from=/dashboard` before any dashboard code executes at all.

---

## 14. Deployment

- **Vercel** — connect your GitHub repo, every push to `main` deploys automatically, every PR gets its own preview URL. Free tier is generous for personal projects.
- **Self-hosted** — `npm run build` then `npm run start` on any server with Node.js; or build a Docker image using Next.js's `output: "standalone"` config option for a minimal image size.
- **Static export** — set `output: "export"` in `next.config.js` if your site has no server features (no API routes, no Server Actions, no ISR) and you just want plain static HTML/CSS/JS files, deployable anywhere (GitHub Pages, S3, Netlify).

---

## 15. Common Pitfalls, Explained (Not Just Listed)

**1. Marking a whole page `"use client"` for one interactive element.**
Why it's a problem: it forces the entire component tree under that file into the client JS bundle, and you lose the ability to `await` data directly. Fix: extract just the interactive piece into its own small Client Component (see Section 4's worked example).

**2. Fetching in `useEffect` on a page that could just `await`.**
```tsx
// ❌ unnecessary client-side fetch, causes a loading flash
"use client";
useEffect(() => { fetch("/api/data").then(...) }, []);
```
```tsx
// ✅ fetch directly, no client component needed, no loading flash
export default async function Page() {
  const data = await fetch("https://api.example.com/data").then(r => r.json());
  return <View data={data} />;
}
```

**3. A page "not updating" after a mutation.**
This is almost always a caching issue, not a bug: if you wrote data with a Server Action or API route but the page still shows old data, you likely forgot `revalidatePath()` or `revalidateTag()` to tell Next.js the cache is stale.

**4. Mixing `pages/` and `app/` routers without a migration plan.**
Both can coexist during a gradual migration, but routes should not be defined for the same URL in both — Next.js will error. Pick one router for new work.

**5. Forgetting that dynamic segments (`params`) and search params (`searchParams`) are just strings.**
`params.id` is always a `string`, even if it "looks like" a number in the URL — you must parse it (`Number(params.id)`) before using it numerically.

---

## 16. A Suggested Build-Along Project

Build these in order, in one app, so each step reuses the last:
1. **Static pages + shared layout** — Home, About, with a shared header/footer via `layout.tsx`.
2. **A data-driven list + detail route** — `/posts` and `/posts/[slug]`, fetching from a free public API like JSONPlaceholder.
3. **A Client Component island** — a "like" button on each post that toggles state, while the rest of the page stays server-rendered.
4. **A Server Action form** — a comment box that adds a comment and calls `revalidatePath`.
5. **Middleware** — fake-protect a `/admin` route behind a cookie check.
6. **Deploy to Vercel** and watch a real preview URL get generated from a PR.

---

## 17. Quick Reference

| Import | Use | Component type required |
|---|---|---|
| `next/link` | Client-side navigation | Either |
| `next/image` | Optimized images | Either |
| `next/font/google` | Optimized fonts | Server (usually in layout) |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) | Client-side routing hooks | Client only |
| `next/headers` (`cookies()`, `headers()`) | Read request data | Server only |
| `next/server` (`NextResponse`, `NextRequest`) | Route handlers & middleware | Server only |
| `next/cache` (`revalidatePath`, `revalidateTag`) | Invalidate cached data | Server only |
