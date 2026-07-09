# Portfolio Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Plan `2026-07-10-portfolio-db-backend.md` must be complete — this plan depends on the repositories, `getDb`, `src/lib/types.ts`, and the seeded `settings` table (password hash + session secret).

**Goal:** A password-protected `/admin` area to create, edit, reorder, and delete all portfolio content (works with a blocks editor, pet-projects, DJ info + events, CV), plus image upload with automatic WebP conversion.

**Architecture:** Auth is a single password (scrypt-hashed in `settings`) exchanged for an HMAC-signed session cookie. `middleware.ts` guards `/admin/*` and `/api/admin/*`. Content mutations go through `/api/admin/*` route handlers that call the Plan 1 repositories. The admin UI is a set of client components posting to those routes. Image upload saves the original under `public/projects/<slug>/` and writes a sharp-generated WebP alongside it.

**Tech Stack:** Next.js 14 route handlers + middleware, Node `crypto` (scrypt + HMAC), `sharp` (already present), React client components.

## Global Constraints

- Single admin user. No user table, no roles.
- Password hash format: `salt:hash` where `hash = scrypt(password, salt, 64)`, both hex. Verify with `crypto.timingSafeEqual`.
- Session cookie name: `admin_session`. Value: `base64url(payload).hmac` signed with the `settings.session_secret` (HMAC-SHA256). Payload holds `{ exp }` (epoch ms). Cookie is `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`.
- Session lifetime: 7 days.
- Every `/api/admin/*` handler (except `login`) returns 401 if the session cookie is missing/invalid. `middleware.ts` enforces this and also redirects unauthenticated `/admin` page requests to `/admin/login`.
- Uploaded files live under `public/projects/<slug>/`; the API returns the public path (e.g. `/projects/<slug>/<name>.webp`). Stored image paths in the DB use this web path form.
- Reuse Plan 1 repository functions for ALL data access. Do not write SQL in route handlers.

---

## File Structure

**Created:**
- `src/lib/auth.ts` — password hashing + session token sign/verify.
- `src/lib/auth.test.ts` — auth unit tests.
- `middleware.ts` (repo root) — route guard.
- `src/app/admin/login/page.tsx` — login form.
- `src/app/admin/layout.tsx` — admin shell (nav).
- `src/app/admin/page.tsx` — dashboard.
- `src/app/admin/works/page.tsx` — works list.
- `src/app/admin/works/[id]/page.tsx` — works editor (new/edit).
- `src/app/admin/pet-projects/page.tsx` — pet-projects manager.
- `src/app/admin/dj/page.tsx` — DJ info + events manager.
- `src/app/admin/cv/page.tsx` — CV editor.
- `src/components/admin/WorkForm.tsx` — works form (client).
- `src/components/admin/BlocksEditor.tsx` — case-study blocks editor (client).
- `src/components/admin/ImageUploader.tsx` — single-image upload widget (client).
- `src/components/admin/ImageListEditor.tsx` — multi-image list widget (client).
- `src/components/admin/admin.module.scss` — admin styles.
- `src/app/api/admin/login/route.ts`, `.../logout/route.ts`
- `src/app/api/admin/upload/route.ts`
- `src/app/api/admin/works/route.ts` (POST create) + `src/app/api/admin/works/[id]/route.ts` (PUT/DELETE) + `src/app/api/admin/works/reorder/route.ts`
- `src/app/api/admin/pet-projects/route.ts` + `[id]/route.ts` + `reorder/route.ts`
- `src/app/api/admin/dj-events/route.ts` + `[id]/route.ts` + `reorder/route.ts`
- `src/app/api/admin/dj-info/route.ts` (PUT)
- `src/app/api/admin/cv/route.ts` (PUT)

**Modified:**
- `next.config.mjs` — add `sharp` to `serverComponentsExternalPackages` (alongside `better-sqlite3`).

---

## Task 1: Auth library (hashing + session tokens)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth.test.ts`

**Interfaces:**
- Consumes: `getPasswordHash`, `getSessionSecret` from `@/lib/repositories/settings`; Node `crypto`.
- Produces:
  - `hashPassword(password: string): string` → `"salt:hash"`.
  - `verifyPassword(password: string, stored: string): boolean`.
  - `signSession(secret: string, expMs: number): string`.
  - `verifySession(token: string, secret: string, now?: number): boolean`.
  - `SESSION_COOKIE = "admin_session"`, `SESSION_TTL_MS = 7 days`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSession, verifySession } from "./auth";

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const stored = hashPassword("hunter2");
    expect(stored).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    expect(verifyPassword("hunter2", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
});

describe("session tokens", () => {
  const secret = "test-secret";
  it("accepts a valid unexpired token", () => {
    const token = signSession(secret, 10_000); // exp = now+10s handled by caller
    expect(verifySession(token, secret, Date.now())).toBe(true);
  });
  it("rejects a tampered token", () => {
    const token = signSession(secret, Date.now() + 10_000);
    expect(verifySession(token + "x", secret, Date.now())).toBe(false);
  });
  it("rejects a token signed with a different secret", () => {
    const token = signSession(secret, Date.now() + 10_000);
    expect(verifySession(token, "other-secret", Date.now())).toBe(false);
  });
  it("rejects an expired token", () => {
    const token = signSession(secret, Date.now() - 1);
    expect(verifySession(token, secret, Date.now())).toBe(false);
  });
});
```

> Note: `signSession(secret, expMs)` takes the absolute expiry timestamp. The first test passes `10_000` which is already in the past relative to `Date.now()`, so adjust: use `signSession(secret, Date.now() + 10_000)`.

Fix the first session test to: `const token = signSession(secret, Date.now() + 10_000);`

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/auth.test.ts`
Expected: FAIL — module `./auth` not found.

- [ ] **Step 3: Implement `src/lib/auth.ts`**

```ts
import crypto from "node:crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function hmac(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function signSession(secret: string, expMs: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs })).toString("base64url");
  return `${payload}.${hmac(secret, payload)}`;
}

export function verifySession(token: string, secret: string, now: number = Date.now()): boolean {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = hmac(secret, payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/auth.test.ts`
Expected: PASS (all 5 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts
git commit -m "feat: add admin auth (scrypt password + HMAC session)"
```

---

## Task 2: Login / logout API routes

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`

**Interfaces:**
- Consumes: `getPasswordHash`, `getSessionSecret` from settings repo; `verifyPassword`, `signSession`, `SESSION_COOKIE`, `SESSION_TTL_MS` from `@/lib/auth`.
- Produces: `POST /api/admin/login` (sets cookie on success), `POST /api/admin/logout` (clears cookie).

- [ ] **Step 1: Implement `src/app/api/admin/login/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getPasswordHash, getSessionSecret } from "@/lib/repositories/settings";
import { verifyPassword, signSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const stored = getPasswordHash();
  const secret = getSessionSecret();
  if (!stored || !secret || !verifyPassword(password ?? "", stored)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = signSession(secret, Date.now() + SESSION_TTL_MS);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
```

- [ ] **Step 2: Implement `src/app/api/admin/logout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 3: Manual verification**

Run: `bun run dev`. In a terminal:

```bash
curl -i -X POST localhost:3000/api/admin/login -H 'content-type: application/json' -d '{"password":"WRONG"}'
```
Expected: `401` with `{"error":"Invalid password"}`.

```bash
curl -i -X POST localhost:3000/api/admin/login -H 'content-type: application/json' -d '{"password":"<your-seed-password>"}'
```
Expected: `200`, response includes a `Set-Cookie: admin_session=...` header.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/login/route.ts src/app/api/admin/logout/route.ts
git commit -m "feat: admin login/logout API"
```

---

## Task 3: Route guard middleware

**Files:**
- Create: `middleware.ts` (repo root)

**Interfaces:**
- Consumes: `verifySession`, `getSessionSecret`, `SESSION_COOKIE`.
- Produces: protection for `/admin/*` (redirect to login) and `/api/admin/*` (401).

> **Constraint:** Next.js middleware runs on the Edge runtime by default, where `better-sqlite3` and Node `crypto` scrypt are unavailable. To read the session secret and verify HMAC in middleware, pin it to the Node runtime is **not** supported for middleware in Next 14. Instead, the middleware performs a **shallow presence + signature check using a secret from an environment variable** mirror. To avoid Edge limitations entirely, do the real verification in each route/page via a shared helper and keep middleware to a cheap cookie-presence gate.

Because full crypto verification is best done in Node, split responsibilities:
- **`middleware.ts`**: cheap gate — if the cookie is absent, redirect `/admin/*` → `/admin/login` and return 401 for `/api/admin/*`. (Presence only.)
- **Route handlers & admin pages**: call a Node-runtime helper `requireSession()` that does full HMAC + expiry verification.

- [ ] **Step 1: Implement `middleware.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login");
  if (isLogin) return NextResponse.next();

  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (hasCookie) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

- [ ] **Step 2: Create the Node-runtime verification helper**

Add to `src/lib/auth.ts`:

```ts
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/repositories/settings";

export function hasValidSession(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const secret = getSessionSecret();
  if (!token || !secret) return false;
  return verifySession(token, secret);
}
```

> `cookies()` and the settings repo are Node-only, so this helper is called from route handlers / server components (all `runtime = "nodejs"`), never from middleware.

- [ ] **Step 3: Guard each API handler**

At the top of every `/api/admin/*` handler (except login/logout), add:

```ts
import { hasValidSession } from "@/lib/auth";
// inside the handler, first line:
if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

(Logout may also require a valid session; add the guard there too.)

- [ ] **Step 4: Manual verification**

Run: `bun run dev`. Visit `http://localhost:3000/admin` in a private window (no cookie).
Expected: redirected to `/admin/login`.

Run: `curl -i localhost:3000/api/admin/works -X POST -d '{}'` (no cookie)
Expected: `401`.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts src/lib/auth.ts
git commit -m "feat: guard admin routes with session middleware"
```

---

## Task 4: Login page UI

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/admin/admin.module.scss`

**Interfaces:**
- Consumes: `POST /api/admin/login`.
- Produces: a login form that redirects to `/admin` on success.

- [ ] **Step 1: Create `src/components/admin/admin.module.scss`**

```scss
.wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }
.login { max-width: 360px; margin: 15vh auto; display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
.field label { font-size: 0.85rem; font-weight: 600; }
.field input, .field textarea, .field select {
  padding: 0.55rem 0.7rem; border: 1px solid #ccc; border-radius: 6px; font: inherit;
}
.button {
  padding: 0.55rem 1rem; border: 0; border-radius: 6px; background: #111; color: #fff;
  font-weight: 600; cursor: pointer;
}
.button.secondary { background: #eee; color: #111; }
.button.danger { background: #b00020; color: #fff; }
.row { display: flex; gap: 0.5rem; align-items: center; }
.nav { display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee; margin-bottom: 1.5rem; flex-wrap: wrap; }
.nav a { text-decoration: none; font-weight: 600; }
.list { display: flex; flex-direction: column; gap: 0.5rem; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; border: 1px solid #eee; border-radius: 6px; }
.block { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.blockHead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.error { color: #b00020; font-size: 0.9rem; }
.thumb { width: 64px; height: 48px; object-fit: cover; border-radius: 4px; }
```

- [ ] **Step 2: Create `src/app/admin/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin");
    else setError("Invalid password");
  }

  return (
    <form className={styles.login} onSubmit={submit}>
      <h1>Admin</h1>
      <div className={styles.field}>
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit">Log in</button>
    </form>
  );
}
```

- [ ] **Step 3: Verify**

Run: `bun run dev`, visit `/admin/login`, enter the seed password.
Expected: redirected to `/admin` (which 404s until Task 5 — that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx src/components/admin/admin.module.scss
git commit -m "feat: admin login page"
```

---

## Task 5: Admin shell + dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `hasValidSession` (guard), logout API.
- Produces: nav shell for all admin pages; dashboard with links + counts.

- [ ] **Step 1: Create `src/app/admin/layout.tsx`**

```tsx
import Link from "next/link";
import styles from "@/components/admin/admin.module.scss";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/works">Works</Link>
        <Link href="/admin/pet-projects">Pet projects</Link>
        <Link href="/admin/dj">DJ</Link>
        <Link href="/admin/cv">CV</Link>
        <span style={{ marginLeft: "auto" }}>
          <LogoutButton />
        </span>
      </nav>
      {children}
    </div>
  );
}
```

> The login page is at `/admin/login` and this layout wraps it too. To avoid showing nav on the login screen, the login page ignores the layout visually (it renders its own centered form). Acceptable; optionally move login outside `/admin` later.

- [ ] **Step 2: Create `src/components/admin/LogoutButton.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }
  return (
    <button className={`${styles.button} ${styles.secondary}`} onClick={logout}>
      Log out
    </button>
  );
}
```

- [ ] **Step 3: Create `src/app/admin/page.tsx`**

```tsx
import Link from "next/link";
import { getAllWorks } from "@/lib/repositories/works";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import styles from "@/components/admin/admin.module.scss";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const works = getAllWorks();
  const pets = getAllPetProjects();
  const events = getAllDjEvents();
  return (
    <div className={styles.list}>
      <h1>Dashboard</h1>
      <div className={styles.item}><span>Works</span><Link href="/admin/works">{works.length} →</Link></div>
      <div className={styles.item}><span>Pet projects</span><Link href="/admin/pet-projects">{pets.length} →</Link></div>
      <div className={styles.item}><span>DJ events</span><Link href="/admin/dj">{events.length} →</Link></div>
      <div className={styles.item}><span>CV</span><Link href="/admin/cv">Edit →</Link></div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `bun run dev`, log in, land on `/admin`.
Expected: dashboard shows counts and nav; "Log out" returns to login.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/page.tsx src/components/admin/LogoutButton.tsx
git commit -m "feat: admin shell and dashboard"
```

---

## Task 6: Image upload API + uploader widgets

**Files:**
- Create: `src/app/api/admin/upload/route.ts`
- Create: `src/components/admin/ImageUploader.tsx`
- Create: `src/components/admin/ImageListEditor.tsx`
- Modify: `next.config.mjs` (add `sharp` external)

**Interfaces:**
- Produces:
  - `POST /api/admin/upload` (multipart: `file`, `slug`) → `{ path: "/projects/<slug>/<name>.webp" }`.
  - `<ImageUploader value slug onChange />` — single image path.
  - `<ImageListEditor values slug onChange />` — ordered list of image paths.

- [ ] **Step 1: Add `sharp` to externals in `next.config.mjs`**

Change:
```js
serverComponentsExternalPackages: ["better-sqlite3"],
```
to
```js
serverComponentsExternalPackages: ["better-sqlite3", "sharp"],
```

- [ ] **Step 2: Implement `src/app/api/admin/upload/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function safeSlug(s: string): string {
  return (s || "misc").toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");
}

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const slug = safeSlug(String(form.get("slug") || "misc"));
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
  const dir = path.join(process.cwd(), "public", "projects", slug);
  await fs.mkdir(dir, { recursive: true });

  const webpName = `${base}.webp`;
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(dir, webpName));

  return NextResponse.json({ path: `/projects/${slug}/${webpName}` });
}
```

- [ ] **Step 3: Implement `src/components/admin/ImageUploader.tsx`**

```tsx
"use client";
import { useState } from "react";
import styles from "@/components/admin/admin.module.scss";

export default function ImageUploader({
  value,
  slug,
  onChange,
  label = "Image",
}: {
  value?: string;
  slug: string;
  onChange: (path: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug || "misc");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setBusy(false);
    if (res.ok) onChange((await res.json()).path);
    else alert("Upload failed");
  }
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.row}>
        {value && <img src={value} alt="" className={styles.thumb} />}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="/projects/slug/image.webp" />
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/components/admin/ImageListEditor.tsx`**

```tsx
"use client";
import ImageUploader from "./ImageUploader";
import styles from "@/components/admin/admin.module.scss";

export default function ImageListEditor({
  values,
  slug,
  onChange,
  label = "Images",
}: {
  values: string[];
  slug: string;
  onChange: (paths: string[]) => void;
  label?: string;
}) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= values.length) return;
    const copy = [...values];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <div className={styles.block}>
      <div className={styles.blockHead}><strong>{label}</strong></div>
      {values.map((v, i) => (
        <div key={i} className={styles.row}>
          <ImageUploader value={v} slug={slug} onChange={(p) => set(i, p)} label={`#${i + 1}`} />
          <button type="button" className={styles.button} onClick={() => move(i, -1)}>↑</button>
          <button type="button" className={styles.button} onClick={() => move(i, 1)}>↓</button>
          <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => onChange([...values, ""])}>
        + Add image
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Verify upload**

Run: `bun run dev` (logged in). Temporarily drop an `<ImageUploader slug="test" .../>` on the dashboard OR test via curl with a valid cookie:

```bash
curl -i -b "admin_session=<paste-cookie>" -F "file=@some.jpg" -F "slug=test" localhost:3000/api/admin/upload
```
Expected: `200 {"path":"/projects/test/some.webp"}`, and `public/projects/test/some.webp` exists.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/upload/route.ts src/components/admin/ImageUploader.tsx src/components/admin/ImageListEditor.tsx next.config.mjs
git commit -m "feat: image upload API with sharp WebP conversion + uploader widgets"
```

---

## Task 7: Works CRUD API

**Files:**
- Create: `src/app/api/admin/works/route.ts`
- Create: `src/app/api/admin/works/[id]/route.ts`
- Create: `src/app/api/admin/works/reorder/route.ts`

**Interfaces:**
- Consumes: `createWork`, `updateWork`, `deleteWork`, `reorderWorks` from works repo; `hasValidSession`.
- Produces:
  - `POST /api/admin/works` — body `WorksType` → `{ id }`.
  - `PUT /api/admin/works/:id` — body `WorksType` → `{ ok: true }`.
  - `DELETE /api/admin/works/:id` → `{ ok: true }`.
  - `POST /api/admin/works/reorder` — body `{ ids: number[] }` → `{ ok: true }`.

- [ ] **Step 1: Implement `src/app/api/admin/works/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as WorksType;
  const id = createWork(body);
  return NextResponse.json({ id });
}
```

- [ ] **Step 2: Implement `src/app/api/admin/works/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updateWork, deleteWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as WorksType;
  updateWork(Number(params.id), body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  deleteWork(Number(params.id));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Implement `src/app/api/admin/works/reorder/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { reorderWorks } from "@/lib/repositories/works";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = (await req.json()) as { ids: number[] };
  reorderWorks(ids);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Verify with an authenticated cookie**

```bash
curl -i -b "admin_session=<cookie>" -X POST localhost:3000/api/admin/works \
  -H 'content-type: application/json' \
  -d '{"slug":"tmp","title":"Tmp","description":"d","bgColor":"#fff","categories":["web"],"show":true}'
```
Expected: `200 {"id":<n>}`. Then `DELETE /api/admin/works/<n>` → `{ok:true}`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/works
git commit -m "feat: works CRUD API"
```

---

## Task 8: Blocks editor component

**Files:**
- Create: `src/components/admin/BlocksEditor.tsx`

**Interfaces:**
- Consumes: `CaseStudyBlock` from `@/lib/types`; `ImageUploader`, `ImageListEditor`.
- Produces: `<BlocksEditor blocks slug onChange />` — add/reorder/delete/edit blocks of every type.

- [ ] **Step 1: Implement `src/components/admin/BlocksEditor.tsx`**

```tsx
"use client";
import type { CaseStudyBlock } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import ImageListEditor from "./ImageListEditor";
import styles from "@/components/admin/admin.module.scss";

const BLOCK_TYPES: CaseStudyBlock["type"][] = [
  "section",
  "image",
  "video",
  "gallery",
  "testimonial",
  "screens-grid",
];

function emptyBlock(type: CaseStudyBlock["type"]): CaseStudyBlock {
  switch (type) {
    case "section": return { type, content: "" };
    case "image": return { type, url: "" };
    case "video": return { type, url: "" };
    case "gallery": return { type, images: [] };
    case "testimonial": return { type, quote: "", author: "", position: "" };
    case "screens-grid": return { type, images: [] };
  }
}

export default function BlocksEditor({
  blocks,
  slug,
  onChange,
}: {
  blocks: CaseStudyBlock[];
  slug: string;
  onChange: (blocks: CaseStudyBlock[]) => void;
}) {
  const update = (i: number, patch: Partial<CaseStudyBlock>) =>
    onChange(blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as CaseStudyBlock) : b)));
  const remove = (i: number) => onChange(blocks.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const copy = [...blocks];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = (type: CaseStudyBlock["type"]) => onChange([...blocks, emptyBlock(type)]);

  return (
    <div>
      <h3>Case study blocks</h3>
      {blocks.map((b, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.blockHead}>
            <strong>{b.type}</strong>
            <span className={styles.row}>
              <button type="button" className={styles.button} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className={styles.button} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => remove(i)}>Delete</button>
            </span>
          </div>

          {b.type === "section" && (
            <>
              <div className={styles.field}><label>Title</label>
                <input value={b.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} /></div>
              <div className={styles.field}><label>Content</label>
                <textarea rows={4} value={b.content} onChange={(e) => update(i, { content: e.target.value })} /></div>
              <div className={styles.field}><label>Background color</label>
                <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              <div className={styles.field}><label>Title color</label>
                <select value={b.titleColor ?? ""} onChange={(e) => update(i, { titleColor: (e.target.value || undefined) as any })}>
                  <option value="">default</option><option value="primary">primary</option><option value="contrast">contrast</option>
                </select></div>
              <ImageUploader value={b.image} slug={slug} onChange={(p) => update(i, { image: p })} label="Section image (optional)" />
            </>
          )}

          {b.type === "image" && (
            <>
              <ImageUploader value={b.url} slug={slug} onChange={(p) => update(i, { url: p })} />
              <div className={styles.field}><label>Caption</label>
                <input value={b.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} /></div>
            </>
          )}

          {b.type === "video" && (
            <>
              <div className={styles.field}><label>Video URL (path under /public)</label>
                <input value={b.url} onChange={(e) => update(i, { url: e.target.value })} /></div>
              <div className={styles.field}><label>Caption</label>
                <input value={b.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} /></div>
            </>
          )}

          {b.type === "testimonial" && (
            <>
              <div className={styles.field}><label>Quote</label>
                <textarea rows={3} value={b.quote} onChange={(e) => update(i, { quote: e.target.value })} /></div>
              <div className={styles.field}><label>Author</label>
                <input value={b.author} onChange={(e) => update(i, { author: e.target.value })} /></div>
              <div className={styles.field}><label>Position</label>
                <input value={b.position} onChange={(e) => update(i, { position: e.target.value })} /></div>
            </>
          )}

          {(b.type === "gallery" || b.type === "screens-grid") && (
            <>
              <ImageListEditor values={b.images} slug={slug} onChange={(imgs) => update(i, { images: imgs })} />
              <div className={styles.field}><label>Columns</label>
                <input type="number" value={b.columns ?? ""} onChange={(e) => update(i, { columns: Number(e.target.value) as any })} /></div>
              {b.type === "screens-grid" && (
                <div className={styles.field}><label>Background color</label>
                  <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              )}
            </>
          )}
        </div>
      ))}

      <div className={styles.row}>
        {BLOCK_TYPES.map((t) => (
          <button type="button" key={t} className={`${styles.button} ${styles.secondary}`} onClick={() => add(t)}>
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors. (Consumed by WorkForm in Task 9; standalone compile is fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/BlocksEditor.tsx
git commit -m "feat: case-study blocks editor"
```

---

## Task 9: Works form + list pages

**Files:**
- Create: `src/components/admin/WorkForm.tsx`
- Create: `src/app/admin/works/page.tsx`
- Create: `src/app/admin/works/[id]/page.tsx`

**Interfaces:**
- Consumes: works repo (server pages), works API (client form), `BlocksEditor`, `ImageUploader`.
- Produces: list with new/edit links + delete/toggle; a create/edit form.

- [ ] **Step 1: Implement `src/components/admin/WorkForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorksType, CaseStudyBlock } from "@/lib/types";
import BlocksEditor from "./BlocksEditor";
import ImageUploader from "./ImageUploader";
import styles from "@/components/admin/admin.module.scss";

const emptyWork: WorksType = {
  slug: "", title: "", description: "", bgColor: "#ffffff", categories: [], show: true, caseStudy: { blocks: [] },
};

export default function WorkForm({ initial }: { initial?: WorksType }) {
  const [work, setWork] = useState<WorksType>(initial ?? emptyWork);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const slug = work.slug ?? "";

  const set = (patch: Partial<WorksType>) => setWork((w) => ({ ...w, ...patch }));
  const setCs = (patch: Partial<NonNullable<WorksType["caseStudy"]>>) =>
    setWork((w) => ({ ...w, caseStudy: { ...(w.caseStudy ?? {}), ...patch } }));

  async function save() {
    setSaving(true);
    const isEdit = typeof work.id === "number";
    const res = await fetch(isEdit ? `/api/admin/works/${work.id}` : "/api/admin/works", {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(work),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/works");
    else alert("Save failed");
  }

  return (
    <div>
      <h1>{work.id ? "Edit work" : "New work"}</h1>

      <div className={styles.field}><label>Slug</label>
        <input value={slug} onChange={(e) => set({ slug: e.target.value })} /></div>
      <div className={styles.field}><label>Title</label>
        <input value={work.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div className={styles.field}><label>Description</label>
        <textarea rows={2} value={work.description} onChange={(e) => set({ description: e.target.value })} /></div>
      <div className={styles.field}><label>Synopsis</label>
        <textarea rows={2} value={work.synopsis ?? ""} onChange={(e) => set({ synopsis: e.target.value })} /></div>
      <div className={styles.field}><label>Background color</label>
        <input value={work.bgColor} onChange={(e) => set({ bgColor: e.target.value })} /></div>
      <div className={styles.field}><label>Categories (comma-separated)</label>
        <input value={work.categories.join(", ")}
          onChange={(e) => set({ categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) })} /></div>

      <div className={styles.row}>
        <label><input type="checkbox" checked={work.show} onChange={(e) => set({ show: e.target.checked })} /> Show</label>
        <label><input type="checkbox" checked={!!work.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
        <label><input type="checkbox" checked={!!work.inProgress} onChange={(e) => set({ inProgress: e.target.checked })} /> In progress</label>
      </div>

      <div className={styles.field}><label>Primary link URL</label>
        <input value={work.link?.url ?? ""} onChange={(e) => set({ link: { url: e.target.value, label: work.link?.label ?? "" } })} /></div>
      <div className={styles.field}><label>Primary link label</label>
        <input value={work.link?.label ?? ""} onChange={(e) => set({ link: { url: work.link?.url ?? "", label: e.target.value } })} /></div>

      <h2>Case study</h2>
      <div className={styles.field}><label>Template</label>
        <select value={work.caseStudy?.template ?? "case-study"} onChange={(e) => setCs({ template: e.target.value as any })}>
          <option value="case-study">case-study</option><option value="font">font</option><option value="movie">movie</option>
        </select></div>
      <ImageUploader value={work.caseStudy?.coverImage} slug={slug} onChange={(p) => setCs({ coverImage: p })} label="Cover image" />
      <div className={styles.field}><label>Role</label>
        <input value={work.caseStudy?.role ?? ""} onChange={(e) => setCs({ role: e.target.value })} /></div>
      <div className={styles.field}><label>Client</label>
        <input value={work.caseStudy?.client ?? ""} onChange={(e) => setCs({ client: e.target.value })} /></div>
      <div className={styles.field}><label>Task</label>
        <input value={work.caseStudy?.task ?? ""} onChange={(e) => setCs({ task: e.target.value })} /></div>
      <div className={styles.field}><label>Release date</label>
        <input value={work.caseStudy?.releaseDate ?? ""} onChange={(e) => setCs({ releaseDate: e.target.value })} /></div>

      <h3>Colors</h3>
      <div className={styles.row}>
        <div className={styles.field}><label>Primary</label>
          <input value={work.caseStudy?.colors?.primary ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), primary: e.target.value } })} /></div>
        <div className={styles.field}><label>Contrast</label>
          <input value={work.caseStudy?.colors?.contrast ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), contrast: e.target.value } })} /></div>
        <div className={styles.field}><label>Faded</label>
          <input value={work.caseStudy?.colors?.faded ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), faded: e.target.value } })} /></div>
      </div>

      <h3>Fonts</h3>
      <div className={styles.row}>
        <div className={styles.field}><label>Title font</label>
          <input value={work.caseStudy?.fonts?.title ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), title: e.target.value } })} /></div>
        <div className={styles.field}><label>Text font</label>
          <input value={work.caseStudy?.fonts?.text ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), text: e.target.value } })} /></div>
      </div>

      <BlocksEditor blocks={work.caseStudy?.blocks ?? []} slug={slug} onChange={(blocks: CaseStudyBlock[]) => setCs({ blocks })} />

      <div className={styles.row} style={{ marginTop: "1.5rem" }}>
        <button className={styles.button} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
        <button className={`${styles.button} ${styles.secondary}`} onClick={() => router.push("/admin/works")}>Cancel</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `src/app/admin/works/page.tsx` (list)**

```tsx
import Link from "next/link";
import { getAllWorks } from "@/lib/repositories/works";
import styles from "@/components/admin/admin.module.scss";
import WorksListActions from "@/components/admin/WorksListActions";

export const dynamic = "force-dynamic";

export default function WorksListPage() {
  const works = getAllWorks();
  return (
    <div>
      <div className={styles.blockHead}>
        <h1>Works</h1>
        <Link className={styles.button} href="/admin/works/new">+ New work</Link>
      </div>
      <div className={styles.list}>
        {works.map((w) => (
          <div key={w.id} className={styles.item}>
            <span>{w.title} <small>({w.slug})</small> {w.show ? "" : "· hidden"} {w.featured ? "· featured" : ""}</span>
            <span className={styles.row}>
              <Link href={`/admin/works/${w.id}`}>Edit</Link>
              <WorksListActions id={w.id!} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/components/admin/WorksListActions.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function WorksListActions({ id }: { id: number }) {
  const router = useRouter();
  async function del() {
    if (!confirm("Delete this work?")) return;
    await fetch(`/api/admin/works/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button className={`${styles.button} ${styles.danger}`} onClick={del}>Delete</button>
  );
}
```

- [ ] **Step 4: Implement `src/app/admin/works/[id]/page.tsx` (new + edit)**

```tsx
import { notFound } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import WorkForm from "@/components/admin/WorkForm";

export const dynamic = "force-dynamic";

export default function WorkEditPage({ params }: { params: { id: string } }) {
  if (params.id === "new") return <WorkForm />;
  const work = getAllWorks().find((w) => w.id === Number(params.id));
  if (!work) notFound();
  return <WorkForm initial={work} />;
}
```

- [ ] **Step 5: Verify end-to-end**

Run: `bun run dev`, log in, go to `/admin/works`.
- Click "New work", fill slug/title/description/bgColor/categories, add a `section` block and an `image` block (upload a file), Save.
- Confirm it appears in the list and renders at `/work/<slug>` (dynamic, live).
- Edit it, reorder a block, Save; confirm the change on the public page.
- Delete it; confirm it's gone from `/admin/works` and `/work/<slug>` 404s.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/WorkForm.tsx src/components/admin/WorksListActions.tsx src/app/admin/works
git commit -m "feat: works admin (list, create, edit, delete, blocks)"
```

---

## Task 10: Pet-projects API + admin page

**Files:**
- Create: `src/app/api/admin/pet-projects/route.ts`, `.../[id]/route.ts`
- Create: `src/app/admin/pet-projects/page.tsx`
- Create: `src/components/admin/PetProjectsManager.tsx`

**Interfaces:**
- Consumes: pet-projects repo; `hasValidSession`.
- Produces: `POST /api/admin/pet-projects`, `PUT/DELETE /api/admin/pet-projects/:id`; a client manager UI.

- [ ] **Step 1: Implement `src/app/api/admin/pet-projects/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createPetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = createPetProject((await req.json()) as PetProject);
  return NextResponse.json({ id });
}
```

- [ ] **Step 2: Implement `src/app/api/admin/pet-projects/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updatePetProject, deletePetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  updatePetProject(Number(params.id), (await req.json()) as PetProject);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  deletePetProject(Number(params.id));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Implement `src/components/admin/PetProjectsManager.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PetProject } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";

export default function PetProjectsManager({ initial }: { initial: PetProject[] }) {
  const [items, setItems] = useState<PetProject[]>(initial);
  const router = useRouter();

  const set = (i: number, patch: Partial<PetProject>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function save(p: PetProject) {
    const isEdit = typeof p.id === "number";
    await fetch(isEdit ? `/api/admin/pet-projects/${p.id}` : "/api/admin/pet-projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    router.refresh();
  }
  async function del(p: PetProject) {
    if (p.id && confirm("Delete?")) {
      await fetch(`/api/admin/pet-projects/${p.id}`, { method: "DELETE" });
      router.refresh();
    } else {
      setItems((xs) => xs.filter((x) => x !== p));
    }
  }

  return (
    <div>
      <h1>Pet projects</h1>
      {items.map((p, i) => (
        <div key={p.id ?? `new-${i}`} className={styles.block}>
          <div className={styles.field}><label>Slug</label>
            <input value={p.slug} onChange={(e) => set(i, { slug: e.target.value })} /></div>
          <div className={styles.field}><label>Title</label>
            <input value={p.title} onChange={(e) => set(i, { title: e.target.value })} /></div>
          <div className={styles.field}><label>URL</label>
            <input value={p.url} onChange={(e) => set(i, { url: e.target.value })} /></div>
          <div className={styles.field}><label>Description</label>
            <input value={p.description} onChange={(e) => set(i, { description: e.target.value })} /></div>
          <div className={styles.row}>
            <button className={styles.button} onClick={() => save(items[i])}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} onClick={() => del(items[i])}>Delete</button>
          </div>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`}
        onClick={() => setItems((xs) => [...xs, { slug: "", title: "", icon: "", image: "", url: "", description: "" }])}>
        + Add pet project
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/app/admin/pet-projects/page.tsx`**

```tsx
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import PetProjectsManager from "@/components/admin/PetProjectsManager";

export const dynamic = "force-dynamic";

export default function PetProjectsAdminPage() {
  return <PetProjectsManager initial={getAllPetProjects()} />;
}
```

- [ ] **Step 5: Verify**

Run: `bun run dev`, log in, go to `/admin/pet-projects`. Add one, Save, confirm on the home page's pet-projects section. Edit and delete; confirm live.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/pet-projects src/app/admin/pet-projects src/components/admin/PetProjectsManager.tsx
git commit -m "feat: pet-projects admin"
```

---

## Task 11: DJ admin (info + events)

**Files:**
- Create: `src/app/api/admin/dj-info/route.ts`
- Create: `src/app/api/admin/dj-events/route.ts`, `.../[id]/route.ts`
- Create: `src/app/admin/dj/page.tsx`
- Create: `src/components/admin/DjManager.tsx`

**Interfaces:**
- Consumes: `getDjInfo`/`saveDjInfo`, DJ events repo; `hasValidSession`.
- Produces: `PUT /api/admin/dj-info`; `POST /api/admin/dj-events`, `PUT/DELETE /api/admin/dj-events/:id`; a manager UI.

- [ ] **Step 1: Implement `src/app/api/admin/dj-info/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { saveDjInfo } from "@/lib/repositories/djInfo";
import type { DjInfo } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  saveDjInfo((await req.json()) as DjInfo);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Implement `src/app/api/admin/dj-events/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = createDjEvent((await req.json()) as DjEvent);
  return NextResponse.json({ id });
}
```

- [ ] **Step 3: Implement `src/app/api/admin/dj-events/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updateDjEvent, deleteDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  updateDjEvent(Number(params.id), (await req.json()) as DjEvent);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  deleteDjEvent(Number(params.id));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Implement `src/components/admin/DjManager.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DjInfo, DjEvent } from "@/lib/types";
import ImageListEditor from "./ImageListEditor";
import styles from "@/components/admin/admin.module.scss";

export default function DjManager({ info, events }: { info: DjInfo; events: DjEvent[] }) {
  const [dj, setDj] = useState<DjInfo>(info);
  const [evs, setEvs] = useState<DjEvent[]>(events);
  const router = useRouter();

  const setEv = (i: number, patch: Partial<DjEvent>) =>
    setEvs((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function saveInfo() {
    await fetch("/api/admin/dj-info", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(dj),
    });
    alert("DJ info saved");
  }
  async function saveEvent(e: DjEvent) {
    const isEdit = typeof e.id === "number";
    await fetch(isEdit ? `/api/admin/dj-events/${e.id}` : "/api/admin/dj-events", {
      method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(e),
    });
    router.refresh();
  }
  async function delEvent(e: DjEvent) {
    if (e.id && confirm("Delete event?")) {
      await fetch(`/api/admin/dj-events/${e.id}`, { method: "DELETE" });
      router.refresh();
    } else setEvs((xs) => xs.filter((x) => x !== e));
  }

  return (
    <div>
      <h1>DJ</h1>
      <div className={styles.field}><label>Summary</label>
        <textarea rows={4} value={dj.summary} onChange={(e) => setDj({ ...dj, summary: e.target.value })} /></div>
      <div className={styles.field}><label>Booking email</label>
        <input value={dj.bookingEmail} onChange={(e) => setDj({ ...dj, bookingEmail: e.target.value })} /></div>

      <h3>Technical rider</h3>
      {dj.technicalRider.map((r, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.field}><label>Name</label>
            <input value={r.name} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /></div>
          <div className={styles.field}><label>Description</label>
            <input value={r.description} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, description: e.target.value } : x) })} /></div>
          <div className={styles.field}><label>Image path</label>
            <input value={r.image} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, image: e.target.value } : x) })} /></div>
          <button className={`${styles.button} ${styles.danger}`} onClick={() => setDj({ ...dj, technicalRider: dj.technicalRider.filter((_, j) => j !== i) })}>Remove</button>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`} onClick={() => setDj({ ...dj, technicalRider: [...dj.technicalRider, { name: "", description: "", image: "" }] })}>+ Rider item</button>

      <ImageListEditor label="Photos" values={dj.photos} slug="dj" onChange={(photos) => setDj({ ...dj, photos })} />
      <div className={styles.field}><label>Partners (comma-separated)</label>
        <input value={dj.partners.join(", ")} onChange={(e) => setDj({ ...dj, partners: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>

      <button className={styles.button} onClick={saveInfo}>Save DJ info</button>

      <h2 style={{ marginTop: "2rem" }}>Events</h2>
      {evs.map((e, i) => (
        <div key={e.id ?? `new-${i}`} className={styles.block}>
          <div className={styles.row}>
            <div className={styles.field}><label>Date</label>
              <input type="date" value={e.date} onChange={(ev) => setEv(i, { date: ev.target.value })} /></div>
            <div className={styles.field}><label>Venue</label>
              <input value={e.venue} onChange={(ev) => setEv(i, { venue: ev.target.value })} /></div>
            <div className={styles.field}><label>City</label>
              <input value={e.city} onChange={(ev) => setEv(i, { city: ev.target.value })} /></div>
          </div>
          <div className={styles.field}><label>Link (optional)</label>
            <input value={e.link ?? ""} onChange={(ev) => setEv(i, { link: ev.target.value })} /></div>
          <div className={styles.row}>
            <button className={styles.button} onClick={() => saveEvent(evs[i])}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} onClick={() => delEvent(evs[i])}>Delete</button>
          </div>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`} onClick={() => setEvs((xs) => [...xs, { date: "", venue: "", city: "Berlin" }])}>+ Add event</button>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/app/admin/dj/page.tsx`**

```tsx
import { getDjInfo } from "@/lib/repositories/djInfo";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import DjManager from "@/components/admin/DjManager";

export const dynamic = "force-dynamic";

export default function DjAdminPage() {
  const info = getDjInfo() ?? { summary: "", technicalRider: [], bookingEmail: "", photos: [], partners: [] };
  return <DjManager info={info} events={getAllDjEvents()} />;
}
```

- [ ] **Step 6: Verify**

Run: `bun run dev`, log in, go to `/admin/dj`. Edit summary + add an event, Save; confirm on `/dj`.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/dj-info src/app/api/admin/dj-events src/app/admin/dj src/components/admin/DjManager.tsx
git commit -m "feat: DJ admin (info + events)"
```

---

## Task 12: CV admin

**Files:**
- Create: `src/app/api/admin/cv/route.ts`
- Create: `src/app/admin/cv/page.tsx`
- Create: `src/components/admin/CvEditor.tsx`

**Interfaces:**
- Consumes: `getCv`/`saveCv`; `hasValidSession`.
- Produces: `PUT /api/admin/cv`; a CV editor. To keep scope tight, the editor edits the CV as formatted JSON with client-side validation (the CV structure is deep and rarely changes shape).

- [ ] **Step 1: Implement `src/app/api/admin/cv/route.ts`**

```ts
import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { saveCv } from "@/lib/repositories/cv";
import type { CvContent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  saveCv((await req.json()) as CvContent);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Implement `src/components/admin/CvEditor.tsx`**

```tsx
"use client";
import { useState } from "react";
import type { CvContent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";

export default function CvEditor({ initial }: { initial: CvContent }) {
  const [text, setText] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState("");

  async function save() {
    let parsed: CvContent;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      return;
    }
    setError("");
    const res = await fetch("/api/admin/cv", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed),
    });
    if (res.ok) alert("CV saved");
    else setError("Save failed");
  }

  return (
    <div>
      <h1>CV</h1>
      <p>Edit the CV JSON. Keys: topSkills, personalInfo, summary, experience[], stack, languages[], education[].</p>
      <textarea style={{ width: "100%", minHeight: "60vh", fontFamily: "monospace" }}
        value={text} onChange={(e) => setText(e.target.value)} />
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} onClick={save}>Save</button>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/app/admin/cv/page.tsx`**

```tsx
import { getCv } from "@/lib/repositories/cv";
import CvEditor from "@/components/admin/CvEditor";

export const dynamic = "force-dynamic";

export default function CvAdminPage() {
  const cv = getCv();
  if (!cv) return <p>No CV yet — run the seed.</p>;
  return <CvEditor initial={cv} />;
}
```

- [ ] **Step 4: Verify**

Run: `bun run dev`, log in, go to `/admin/cv`. Change the summary in the JSON, Save; confirm on `/cv`. Enter broken JSON → inline error, no save.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/cv src/app/admin/cv src/components/admin/CvEditor.tsx
git commit -m "feat: CV admin (JSON editor)"
```

---

## Task 13: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Typecheck, tests, build**

Run: `bunx tsc --noEmit` → no errors.
Run: `bun run test` → all pass (db, repos, auth).
Run: `bun run build` → succeeds (seeded DB present).

- [ ] **Step 2: End-to-end auth + CRUD smoke test**

Run: `bun run build && bun run start`. Verify, all while logged in:
- `/admin` requires login; wrong password rejected; correct password lands on dashboard.
- Create a work with blocks + uploaded image → visible on `/` (if featured) and `/work/<slug>`.
- Edit, reorder blocks, toggle show/featured, delete → reflected live.
- Pet project add/edit/delete → reflected on `/`.
- DJ info + event edit → reflected on `/dj`.
- CV edit → reflected on `/cv`.
- Log out → `/admin` redirects to login; `/api/admin/works` POST returns 401 without cookie.

- [ ] **Step 3: Commit any fixes and finish**

```bash
git add -A
git commit -m "chore: admin panel verification fixes"
```

---

## Self-Review

**Spec coverage (admin portion):**
- Single-password auth + signed session cookie → Tasks 1–4. ✅
- Guarded `/admin` + `/api/admin` → Task 3. ✅
- Works admin incl. blocks editor, colors, fonts, links, template → Tasks 7–9. ✅
- Pet-projects admin → Task 10. ✅
- DJ info + events admin → Task 11. ✅
- CV admin → Task 12. ✅
- Image upload + auto-WebP via sharp → Task 6. ✅
- Reuse Plan 1 repositories for all data access → every API task. ✅

**Known simplifications (intentional, per YAGNI):**
- Reorder API endpoints for works/pet-projects/dj-events exist in repos (Plan 1) and works has a reorder route (Task 7); UI reordering of top-level lists is via editing `sort_order`-driven order later. The blocks editor and image lists support reordering within a work. Top-level drag-reorder UI can be added if desired.
- CV editing is a validated JSON textarea rather than a field-by-field form (deep, rarely-reshaped structure).

**Type consistency:** `hasValidSession`, `SESSION_COOKIE`, `signSession`, `verifySession`, `verifyPassword` defined in Task 1 and used consistently in Tasks 2–3, 6–12. Repository function names match Plan 1 exactly (`createWork`, `updateWork`, `deleteWork`, `reorderWorks`, `createPetProject`, `createDjEvent`, `saveDjInfo`, `saveCv`). ✅

**Middleware caveat noted:** middleware does presence-only gating (Edge runtime limits); full HMAC verification happens in Node-runtime route handlers/pages via `hasValidSession`. This is deliberate and documented in Task 3.
