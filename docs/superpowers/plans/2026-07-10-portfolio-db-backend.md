# Portfolio DB Backend + Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all portfolio content from hand-authored TypeScript files into SQLite, served by a live Node/Next.js server, with the public site reading from the database instead of static data.

**Architecture:** One Next.js 14 app stops being a static export and runs as a Node server (`next start`). SQLite (`better-sqlite3`) is the source of truth. A data-access layer in `src/lib/repositories/*` returns the exact object shapes the old `src/data/*.ts` files did, so public components are untouched except for their import source. A one-time seed script migrates the existing data.

**Tech Stack:** Next.js 14 (App Router), TypeScript, `better-sqlite3`, `sharp` (already present), `vitest` (new, for tests). Package manager: Bun (installs deps); the `next` CLI runs on Node, so `better-sqlite3`'s native binding loads normally.

## Global Constraints

- Node runtime for the app (the `next` binary is `#!/usr/bin/env node`); do NOT run the app under the Bun runtime — `better-sqlite3` is a Node native addon.
- DB file path comes from env `DATABASE_PATH`, default `data/portfolio.db`. Tests pass an in-memory DB explicitly.
- Every repository function takes `db` as its first parameter with a default of `getDb()`, so tests inject an isolated in-memory database.
- Booleans are stored as SQLite integers (0/1) and mapped back to `boolean` at the repository boundary.
- Nested/complex fields are stored as JSON strings and parsed at the repository boundary; public callers receive the same shapes as today.
- Do NOT change any component markup, SCSS, or props. Only swap import sources and add `export const dynamic = "force-dynamic"` where noted.
- Preserve existing data exactly (slugs, order, colors, blocks). The seed is the migration of record.

---

## File Structure

**Created:**
- `src/lib/types.ts` — all shared content types (moved from `src/data/works.ts` + new DJ/CV/PetProject types).
- `src/lib/db.ts` — `getDb()` singleton, `createDb(path)`, `initSchema(db)`.
- `src/lib/repositories/works.ts` — works read/write.
- `src/lib/repositories/petProjects.ts` — pet-project read/write.
- `src/lib/repositories/djEvents.ts` — DJ event read/write.
- `src/lib/repositories/djInfo.ts` — DJ info singleton read/write.
- `src/lib/repositories/cv.ts` — CV singleton read/write.
- `src/lib/repositories/settings.ts` — settings singleton (password hash + session secret).
- `scripts/seed-db.mjs` — one-time migration from `src/data/*.ts`.
- `vitest.config.ts` — test config.
- `src/lib/repositories/*.test.ts` — repository tests.

**Modified:**
- `package.json` — deps + `test` / `seed` scripts.
- `next.config.mjs` — remove static export, add `serverComponentsExternalPackages`.
- `.gitignore` — ignore `data/*.db`.
- `src/utils/categoryUtils.ts` — read from repo instead of importing `WORKS`.
- `src/app/page.tsx`, `src/app/[category]/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/cv/page.tsx`, `src/app/dj/page.tsx` — read from repos; make dynamic where noted.
- `src/components/Templates/MovieTemplate/MovieTemplate.tsx`, `src/components/Templates/FontTemplate/FontTemplate.tsx` — import `CaseStudyBlock` from `@/lib/types`.
- `Dockerfile` — run `next start` on Node instead of busybox static serving.

**Deleted (final task, after verification):**
- `src/data/works.ts`, `src/data/pet-projects.ts`, `src/data/dj.ts`, `src/data/cv.ts`.

---

## Task 1: Dependencies, Next config, and test harness

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`
- Modify: `.gitignore`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `bun run test` runs vitest; `data/` exists and is gitignored; Next builds as a server app.

- [ ] **Step 1: Install dependencies**

```bash
bun add better-sqlite3
bun add -d @types/better-sqlite3 vitest
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest",
"seed": "node scripts/seed-db.mjs"
```

- [ ] **Step 3: Update `next.config.mjs`**

Remove the static-export bits and register `better-sqlite3` as an external server package. Replace the `nextConfig` object's top with:

```js
const nextConfig = {
  // Server-rendered app (SQLite-backed). No static export.
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  // Images are pre-converted to WebP; keep the optimizer off (local files only).
  images: {
    unoptimized: true,
  },

  compress: true,
```

Delete the `const isDev = ...` line, the `output: !isDev ? "export" : undefined,` line, and the `assetPrefix: !isDev ? "/" : undefined,` line. Leave the `webpack` and `pageExtensions` sections unchanged.

- [ ] **Step 4: Ignore the DB in `.gitignore`**

Append:

```
# SQLite database (runtime data)
/data/*.db
/data/*.db-*
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 6: Verify the app still builds and tests run**

Run: `bun run test`
Expected: vitest exits 0 with "No test files found" (or runs 0 tests) — the harness works.

Run: `bun run build`
Expected: build succeeds (still using old `@/data` imports — that's fine at this stage).

- [ ] **Step 7: Commit**

```bash
git add package.json bun.lock next.config.mjs .gitignore vitest.config.ts
git commit -m "chore: add better-sqlite3, vitest, and switch to server build"
```

---

## Task 2: Shared types module

**Files:**
- Create: `src/lib/types.ts`
- Modify: `src/components/Templates/MovieTemplate/MovieTemplate.tsx:4`
- Modify: `src/components/Templates/FontTemplate/FontTemplate.tsx:6`

**Interfaces:**
- Produces: `CATEGORIES`, `Category`, `SectionBlock`, `ImageBlock`, `VideoBlock`, `GalleryBlock`, `TestimonialBlock`, `ScreensGridBlock`, `CaseStudyBlock`, `CaseStudy`, `WorksType`, `PetProject`, `DjEvent`, `DjRiderItem`, `DjInfo`, `CvContent`, `Cv` — all exported from `@/lib/types`.

- [ ] **Step 1: Create `src/lib/types.ts`**

Copy the block/case-study/works types verbatim from `src/data/works.ts` (lines 1–150), and add the new DJ/CV/PetProject types derived from the existing data files:

```ts
// Case-study content blocks
export type SectionBlock = {
  type: "section";
  title?: string;
  content: string;
  image?: string;
  bgColor?: string;
  titleColor?: "primary" | "contrast";
};

export type ImageBlock = { type: "image"; url: string; caption?: string };

export type GalleryBlock = {
  type: "gallery";
  images: string[];
  columns?: 1 | 2 | 3;
  titleColor?: "primary" | "contrast";
};

export type TestimonialBlock = {
  type: "testimonial";
  quote: string;
  author: string;
  position: string;
};

export type VideoBlock = { type: "video"; url: string; caption?: string };

export type ScreensGridBlock = {
  type: "screens-grid";
  bgColor?: string;
  images: string[];
  columns?: 2 | 3 | 4;
  titleColor?: "primary" | "contrast";
};

export type CaseStudyBlock =
  | SectionBlock
  | ImageBlock
  | VideoBlock
  | GalleryBlock
  | TestimonialBlock
  | ScreensGridBlock;

export const CATEGORIES = {
  WEB: "web",
  PRINT: "print",
  PHOTOGRAPHY: "photography",
  DEVELOPMENT: "development",
  DESIGN: "design",
  BRANDING: "branding",
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export type CaseStudy = {
  template?: "case-study" | "font" | "movie";
  fontFile?: string;
  downloadLink?: string;
  movieData?: { duration?: string; director?: string };
  task?: string;
  client?: string;
  releaseDate?: string;
  coverImage?: string;
  role?: string;
  link?: { url: string; label: string };
  colors?: { primary: string; contrast: string; faded: string };
  fonts?: {
    title: string;
    text?: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
  };
  overview?: string;
  roleDetails?: string;
  timeline?: string;
  stack?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  images?: string[];
  testimonial?: { quote: string; author: string; position: string };
  titleColor?: "primary" | "contrast";
  blocks?: CaseStudyBlock[];
  videoFile?: string;
  posterImage?: string;
  starring?: string[];
  laurels?: { quote?: string; award?: string; source?: string }[];
  credits?: { role: string; name: string }[];
};

export type WorksType = {
  id?: number;
  title: string;
  slug?: string;
  bgColor: string;
  description: string;
  synopsis?: string;
  categories: string[];
  link?: { url: string; label: string };
  link2?: { url: string; label: string };
  show: boolean;
  featured?: boolean;
  caseStudy?: CaseStudy;
  inProgress?: boolean;
  sortOrder?: number;
};

// Pet projects
export type PetProject = {
  id?: number;
  slug: string; // was `id` in the old data file
  title: string;
  icon: string;
  image: string;
  url: string;
  description: string;
  sortOrder?: number;
};

// DJ
export type DjEvent = {
  id?: number;
  date: string;
  venue: string;
  city: string;
  link?: string;
  sortOrder?: number;
};

export type DjRiderItem = { name: string; description: string; image: string };

export type DjInfo = {
  summary: string;
  technicalRider: DjRiderItem[];
  bookingEmail: string;
  photos: string[];
  partners: string[];
};

// CV
export type CvContent = {
  topSkills: string[];
  personalInfo: {
    name: string;
    title: string;
    website: string;
    email: string;
  };
  summary: string;
  experience: {
    position: string;
    company: string;
    period: string;
    type: string;
    location: string;
    description: string;
  }[];
  stack: Record<string, string[]>;
  languages: { language: string; level: string }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    period: string;
    location: string;
  }[];
};
export type Cv = CvContent;
```

> Note: `PetProject.slug` maps from the old `id` field; the DB column is `slug`.

- [ ] **Step 2: Point the templates at the new type source**

In `src/components/Templates/MovieTemplate/MovieTemplate.tsx` change:

```ts
import { CaseStudyBlock } from "@/data/works";
```
to
```ts
import { CaseStudyBlock } from "@/lib/types";
```

Make the identical change in `src/components/Templates/FontTemplate/FontTemplate.tsx`.

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no new errors (old `@/data/works` still exports its own types for now; templates now use `@/lib/types`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/components/Templates/MovieTemplate/MovieTemplate.tsx src/components/Templates/FontTemplate/FontTemplate.tsx
git commit -m "refactor: extract shared content types to src/lib/types"
```

---

## Task 3: Database connection and schema

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/db.test.ts`

**Interfaces:**
- Produces:
  - `createDb(path: string): Database.Database` — opens a DB, enables WAL + foreign keys, runs `initSchema`.
  - `getDb(): Database.Database` — process-wide singleton using `DATABASE_PATH` (default `data/portfolio.db`).
  - `initSchema(db: Database.Database): void` — idempotent `CREATE TABLE IF NOT EXISTS`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/db.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "./db";

describe("initSchema", () => {
  it("creates all content tables", () => {
    const db = new Database(":memory:");
    initSchema(db);
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name);
    for (const t of [
      "works",
      "pet_projects",
      "dj_events",
      "dj_info",
      "cv",
      "settings",
    ]) {
      expect(tables).toContain(t);
    }
  });

  it("is idempotent", () => {
    const db = new Database(":memory:");
    initSchema(db);
    expect(() => initSchema(db)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/db.test.ts`
Expected: FAIL — cannot import `initSchema` from `./db`.

- [ ] **Step 3: Implement `src/lib/db.ts`**

```ts
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      synopsis TEXT,
      bg_color TEXT NOT NULL DEFAULT '#ffffff',
      categories TEXT NOT NULL DEFAULT '[]',
      link TEXT,
      link2 TEXT,
      show INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      in_progress INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      case_study TEXT
    );

    CREATE TABLE IF NOT EXISTS pet_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dj_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      link TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dj_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      summary TEXT NOT NULL DEFAULT '',
      technical_rider TEXT NOT NULL DEFAULT '[]',
      booking_email TEXT NOT NULL DEFAULT '',
      photos TEXT NOT NULL DEFAULT '[]',
      partners TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS cv (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT,
      session_secret TEXT
    );
  `);
}

export function createDb(dbPath: string): Database.Database {
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

// Singleton — survives Next.js dev hot-reload via globalThis.
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__db) {
    const dbPath = process.env.DATABASE_PATH || "data/portfolio.db";
    globalForDb.__db = createDb(dbPath);
  }
  return globalForDb.__db;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/db.test.ts`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/lib/db.test.ts
git commit -m "feat: add SQLite connection and schema"
```

---

## Task 4: Works repository

**Files:**
- Create: `src/lib/repositories/works.ts`
- Create: `src/lib/repositories/works.test.ts`

**Interfaces:**
- Consumes: `getDb` from `@/lib/db`; `WorksType`, `CaseStudy` from `@/lib/types`.
- Produces:
  - `getAllWorks(db?): WorksType[]` — ordered by `sort_order, id`.
  - `getFeaturedWorks(db?): WorksType[]` — `show=1 AND featured=1`.
  - `getWorkBySlug(slug: string, db?): WorksType | null`.
  - `getAllWorkSlugs(db?): string[]` — `show=1` only.
  - `createWork(input: WorksType, db?): number` — returns new id.
  - `updateWork(id: number, input: WorksType, db?): void`.
  - `deleteWork(id: number, db?): void`.
  - `reorderWorks(ids: number[], db?): void` — sets `sort_order` to array index.

- [ ] **Step 1: Write the failing test**

Create `src/lib/repositories/works.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import {
  createWork,
  getAllWorks,
  getWorkBySlug,
  getFeaturedWorks,
  getAllWorkSlugs,
  updateWork,
  deleteWork,
  reorderWorks,
} from "./works";
import type { WorksType } from "../types";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

const sample: WorksType = {
  slug: "bagel-bro",
  title: "Bagel Bro",
  description: "A bagel shop site",
  bgColor: "#feeadd",
  categories: ["web", "design"],
  link: { url: "https://bagelbro.de", label: "bagelbro.de" },
  show: true,
  featured: true,
  inProgress: true,
  caseStudy: {
    coverImage: "cover.webp",
    colors: { primary: "#E7650D", contrast: "#1F6686", faded: "#fafafa" },
    blocks: [{ type: "section", title: "Overview", content: "Hello" }],
  },
};

describe("works repository", () => {
  it("round-trips a work with nested case study", () => {
    const id = createWork(sample, db);
    const got = getWorkBySlug("bagel-bro", db)!;
    expect(got.id).toBe(id);
    expect(got.title).toBe("Bagel Bro");
    expect(got.show).toBe(true);
    expect(got.featured).toBe(true);
    expect(got.categories).toEqual(["web", "design"]);
    expect(got.link).toEqual({ url: "https://bagelbro.de", label: "bagelbro.de" });
    expect(got.caseStudy?.colors?.primary).toBe("#E7650D");
    expect(got.caseStudy?.blocks?.[0]).toMatchObject({ type: "section", content: "Hello" });
  });

  it("filters featured and lists slugs", () => {
    createWork(sample, db);
    createWork({ ...sample, slug: "hidden", featured: false, show: false }, db);
    expect(getFeaturedWorks(db).map((w) => w.slug)).toEqual(["bagel-bro"]);
    expect(getAllWorkSlugs(db)).toEqual(["bagel-bro"]);
    expect(getAllWorks(db)).toHaveLength(2);
  });

  it("updates and deletes", () => {
    const id = createWork(sample, db);
    updateWork(id, { ...sample, title: "Renamed" }, db);
    expect(getWorkBySlug("bagel-bro", db)!.title).toBe("Renamed");
    deleteWork(id, db);
    expect(getWorkBySlug("bagel-bro", db)).toBeNull();
  });

  it("reorders by index", () => {
    const a = createWork({ ...sample, slug: "a" }, db);
    const b = createWork({ ...sample, slug: "b" }, db);
    reorderWorks([b, a], db);
    expect(getAllWorks(db).map((w) => w.slug)).toEqual(["b", "a"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/repositories/works.test.ts`
Expected: FAIL — module `./works` not found.

- [ ] **Step 3: Implement `src/lib/repositories/works.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { WorksType, CaseStudy } from "../types";

type Row = {
  id: number;
  slug: string;
  title: string;
  description: string;
  synopsis: string | null;
  bg_color: string;
  categories: string;
  link: string | null;
  link2: string | null;
  show: number;
  featured: number;
  in_progress: number;
  sort_order: number;
  case_study: string | null;
};

function toWork(row: Row): WorksType {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    synopsis: row.synopsis ?? undefined,
    bgColor: row.bg_color,
    categories: JSON.parse(row.categories) as string[],
    link: row.link ? JSON.parse(row.link) : undefined,
    link2: row.link2 ? JSON.parse(row.link2) : undefined,
    show: row.show === 1,
    featured: row.featured === 1,
    inProgress: row.in_progress === 1,
    sortOrder: row.sort_order,
    caseStudy: row.case_study ? (JSON.parse(row.case_study) as CaseStudy) : undefined,
  };
}

function bindParams(input: WorksType) {
  return {
    slug: input.slug ?? "",
    title: input.title,
    description: input.description ?? "",
    synopsis: input.synopsis ?? null,
    bg_color: input.bgColor ?? "#ffffff",
    categories: JSON.stringify(input.categories ?? []),
    link: input.link ? JSON.stringify(input.link) : null,
    link2: input.link2 ? JSON.stringify(input.link2) : null,
    show: input.show ? 1 : 0,
    featured: input.featured ? 1 : 0,
    in_progress: input.inProgress ? 1 : 0,
    case_study: input.caseStudy ? JSON.stringify(input.caseStudy) : null,
  };
}

export function getAllWorks(db: Database.Database = getDb()): WorksType[] {
  return (db.prepare("SELECT * FROM works ORDER BY sort_order, id").all() as Row[]).map(toWork);
}

export function getFeaturedWorks(db: Database.Database = getDb()): WorksType[] {
  return (
    db
      .prepare("SELECT * FROM works WHERE show = 1 AND featured = 1 ORDER BY sort_order, id")
      .all() as Row[]
  ).map(toWork);
}

export function getWorkBySlug(slug: string, db: Database.Database = getDb()): WorksType | null {
  const row = db.prepare("SELECT * FROM works WHERE slug = ?").get(slug) as Row | undefined;
  return row ? toWork(row) : null;
}

export function getAllWorkSlugs(db: Database.Database = getDb()): string[] {
  return (
    db.prepare("SELECT slug FROM works WHERE show = 1 ORDER BY sort_order, id").all() as {
      slug: string;
    }[]
  ).map((r) => r.slug);
}

export function createWork(input: WorksType, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM works").get() as { m: number }).m + 1;
  const info = db
    .prepare(
      `INSERT INTO works
       (slug, title, description, synopsis, bg_color, categories, link, link2, show, featured, in_progress, sort_order, case_study)
       VALUES (@slug, @title, @description, @synopsis, @bg_color, @categories, @link, @link2, @show, @featured, @in_progress, @sort_order, @case_study)`
    )
    .run({ ...bindParams(input), sort_order: input.sortOrder ?? nextOrder });
  return Number(info.lastInsertRowid);
}

export function updateWork(id: number, input: WorksType, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE works SET
       slug=@slug, title=@title, description=@description, synopsis=@synopsis,
       bg_color=@bg_color, categories=@categories, link=@link, link2=@link2,
       show=@show, featured=@featured, in_progress=@in_progress, case_study=@case_study
     WHERE id=@id`
  ).run({ ...bindParams(input), id });
}

export function deleteWork(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM works WHERE id = ?").run(id);
}

export function reorderWorks(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE works SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => {
    list.forEach((id, i) => stmt.run(i, id));
  });
  tx(ids);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/repositories/works.test.ts`
Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/works.ts src/lib/repositories/works.test.ts
git commit -m "feat: add works repository"
```

---

## Task 5: Pet-projects repository

**Files:**
- Create: `src/lib/repositories/petProjects.ts`
- Create: `src/lib/repositories/petProjects.test.ts`

**Interfaces:**
- Produces: `getAllPetProjects(db?): PetProject[]`, `createPetProject(input, db?): number`, `updatePetProject(id, input, db?): void`, `deletePetProject(id, db?): void`, `reorderPetProjects(ids, db?): void`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/repositories/petProjects.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import {
  getAllPetProjects,
  createPetProject,
  updatePetProject,
  deletePetProject,
} from "./petProjects";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("round-trips a pet project", () => {
  const id = createPetProject(
    { slug: "budget", title: "Budget", icon: "", image: "", url: "https://budget.mokhni.uk", description: "Budgeting" },
    db
  );
  const all = getAllPetProjects(db);
  expect(all).toHaveLength(1);
  expect(all[0]).toMatchObject({ id, slug: "budget", title: "Budget", url: "https://budget.mokhni.uk" });
  updatePetProject(id, { slug: "budget", title: "Budget 2", icon: "", image: "", url: "x", description: "y" }, db);
  expect(getAllPetProjects(db)[0].title).toBe("Budget 2");
  deletePetProject(id, db);
  expect(getAllPetProjects(db)).toHaveLength(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/repositories/petProjects.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/repositories/petProjects.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { PetProject } from "../types";

type Row = {
  id: number;
  slug: string;
  title: string;
  icon: string;
  image: string;
  url: string;
  description: string;
  sort_order: number;
};

const toPet = (r: Row): PetProject => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  icon: r.icon,
  image: r.image,
  url: r.url,
  description: r.description,
  sortOrder: r.sort_order,
});

export function getAllPetProjects(db: Database.Database = getDb()): PetProject[] {
  return (db.prepare("SELECT * FROM pet_projects ORDER BY sort_order, id").all() as Row[]).map(toPet);
}

export function createPetProject(input: PetProject, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM pet_projects").get() as { m: number })
      .m + 1;
  const info = db
    .prepare(
      `INSERT INTO pet_projects (slug, title, icon, image, url, description, sort_order)
       VALUES (@slug, @title, @icon, @image, @url, @description, @sort_order)`
    )
    .run({
      slug: input.slug,
      title: input.title,
      icon: input.icon ?? "",
      image: input.image ?? "",
      url: input.url ?? "",
      description: input.description ?? "",
      sort_order: input.sortOrder ?? nextOrder,
    });
  return Number(info.lastInsertRowid);
}

export function updatePetProject(id: number, input: PetProject, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE pet_projects SET slug=@slug, title=@title, icon=@icon, image=@image, url=@url, description=@description WHERE id=@id`
  ).run({
    id,
    slug: input.slug,
    title: input.title,
    icon: input.icon ?? "",
    image: input.image ?? "",
    url: input.url ?? "",
    description: input.description ?? "",
  });
}

export function deletePetProject(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM pet_projects WHERE id = ?").run(id);
}

export function reorderPetProjects(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE pet_projects SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => list.forEach((id, i) => stmt.run(i, id)));
  tx(ids);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/repositories/petProjects.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/petProjects.ts src/lib/repositories/petProjects.test.ts
git commit -m "feat: add pet-projects repository"
```

---

## Task 6: DJ events repository

**Files:**
- Create: `src/lib/repositories/djEvents.ts`
- Create: `src/lib/repositories/djEvents.test.ts`

**Interfaces:**
- Produces: `getAllDjEvents(db?): DjEvent[]`, `createDjEvent(input, db?): number`, `updateDjEvent(id, input, db?): void`, `deleteDjEvent(id, db?): void`, `reorderDjEvents(ids, db?): void`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/repositories/djEvents.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getAllDjEvents, createDjEvent, updateDjEvent, deleteDjEvent } from "./djEvents";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("round-trips events including optional link", () => {
  const id = createDjEvent({ date: "2025-03-11", venue: "Kafe Kyiv", city: "Berlin" }, db);
  createDjEvent({ date: "2025-12-21", venue: "Skrynya", city: "Berlin", link: "https://x" }, db);
  const all = getAllDjEvents(db);
  expect(all).toHaveLength(2);
  expect(all[0]).toMatchObject({ id, venue: "Kafe Kyiv" });
  expect(all[1].link).toBe("https://x");
  updateDjEvent(id, { date: "2025-03-11", venue: "Cafe Kyiv", city: "Berlin" }, db);
  expect(getAllDjEvents(db)[0].venue).toBe("Cafe Kyiv");
  deleteDjEvent(id, db);
  expect(getAllDjEvents(db)).toHaveLength(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/repositories/djEvents.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/repositories/djEvents.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { DjEvent } from "../types";

type Row = {
  id: number;
  date: string;
  venue: string;
  city: string;
  link: string | null;
  sort_order: number;
};

const toEvent = (r: Row): DjEvent => ({
  id: r.id,
  date: r.date,
  venue: r.venue,
  city: r.city,
  link: r.link ?? undefined,
  sortOrder: r.sort_order,
});

export function getAllDjEvents(db: Database.Database = getDb()): DjEvent[] {
  return (db.prepare("SELECT * FROM dj_events ORDER BY sort_order, id").all() as Row[]).map(toEvent);
}

export function createDjEvent(input: DjEvent, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM dj_events").get() as { m: number }).m + 1;
  const info = db
    .prepare(
      `INSERT INTO dj_events (date, venue, city, link, sort_order)
       VALUES (@date, @venue, @city, @link, @sort_order)`
    )
    .run({
      date: input.date,
      venue: input.venue,
      city: input.city ?? "",
      link: input.link ?? null,
      sort_order: input.sortOrder ?? nextOrder,
    });
  return Number(info.lastInsertRowid);
}

export function updateDjEvent(id: number, input: DjEvent, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE dj_events SET date=@date, venue=@venue, city=@city, link=@link WHERE id=@id`
  ).run({
    id,
    date: input.date,
    venue: input.venue,
    city: input.city ?? "",
    link: input.link ?? null,
  });
}

export function deleteDjEvent(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM dj_events WHERE id = ?").run(id);
}

export function reorderDjEvents(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE dj_events SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => list.forEach((id, i) => stmt.run(i, id)));
  tx(ids);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/repositories/djEvents.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/djEvents.ts src/lib/repositories/djEvents.test.ts
git commit -m "feat: add DJ events repository"
```

---

## Task 7: DJ info + CV singleton repositories

**Files:**
- Create: `src/lib/repositories/djInfo.ts`
- Create: `src/lib/repositories/cv.ts`
- Create: `src/lib/repositories/singletons.test.ts`

**Interfaces:**
- Produces:
  - `getDjInfo(db?): DjInfo | null`, `saveDjInfo(info: DjInfo, db?): void`.
  - `getCv(db?): CvContent | null`, `saveCv(content: CvContent, db?): void`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/repositories/singletons.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getDjInfo, saveDjInfo } from "./djInfo";
import { getCv, saveCv } from "./cv";
import type { DjInfo, CvContent } from "../types";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("stores and replaces DJ info", () => {
  expect(getDjInfo(db)).toBeNull();
  const info: DjInfo = {
    summary: "Vinyl only",
    technicalRider: [{ name: "Turntables", description: "2x", image: "/t.webp" }],
    bookingEmail: "a@b.c",
    photos: ["/1.jpg"],
    partners: ["SKRYNYA"],
  };
  saveDjInfo(info, db);
  expect(getDjInfo(db)).toEqual(info);
  saveDjInfo({ ...info, summary: "Changed" }, db);
  expect(getDjInfo(db)!.summary).toBe("Changed");
});

it("stores and replaces CV", () => {
  expect(getCv(db)).toBeNull();
  const cv = { topSkills: ["A"], personalInfo: { name: "O", title: "T", website: "w", email: "e" }, summary: "s", experience: [], stack: {}, languages: [], education: [] } as CvContent;
  saveCv(cv, db);
  expect(getCv(db)).toEqual(cv);
  saveCv({ ...cv, summary: "new" }, db);
  expect(getCv(db)!.summary).toBe("new");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/repositories/singletons.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `src/lib/repositories/djInfo.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { DjInfo } from "../types";

type Row = {
  summary: string;
  technical_rider: string;
  booking_email: string;
  photos: string;
  partners: string;
};

export function getDjInfo(db: Database.Database = getDb()): DjInfo | null {
  const row = db.prepare("SELECT * FROM dj_info WHERE id = 1").get() as Row | undefined;
  if (!row) return null;
  return {
    summary: row.summary,
    technicalRider: JSON.parse(row.technical_rider),
    bookingEmail: row.booking_email,
    photos: JSON.parse(row.photos),
    partners: JSON.parse(row.partners),
  };
}

export function saveDjInfo(info: DjInfo, db: Database.Database = getDb()): void {
  db.prepare(
    `INSERT INTO dj_info (id, summary, technical_rider, booking_email, photos, partners)
     VALUES (1, @summary, @rider, @email, @photos, @partners)
     ON CONFLICT(id) DO UPDATE SET
       summary=@summary, technical_rider=@rider, booking_email=@email, photos=@photos, partners=@partners`
  ).run({
    summary: info.summary,
    rider: JSON.stringify(info.technicalRider ?? []),
    email: info.bookingEmail,
    photos: JSON.stringify(info.photos ?? []),
    partners: JSON.stringify(info.partners ?? []),
  });
}
```

- [ ] **Step 4: Implement `src/lib/repositories/cv.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { CvContent } from "../types";

export function getCv(db: Database.Database = getDb()): CvContent | null {
  const row = db.prepare("SELECT content FROM cv WHERE id = 1").get() as
    | { content: string }
    | undefined;
  return row ? (JSON.parse(row.content) as CvContent) : null;
}

export function saveCv(content: CvContent, db: Database.Database = getDb()): void {
  db.prepare(
    `INSERT INTO cv (id, content) VALUES (1, @content)
     ON CONFLICT(id) DO UPDATE SET content=@content`
  ).run({ content: JSON.stringify(content) });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bunx vitest run src/lib/repositories/singletons.test.ts`
Expected: PASS (both tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/repositories/djInfo.ts src/lib/repositories/cv.ts src/lib/repositories/singletons.test.ts
git commit -m "feat: add DJ info and CV singleton repositories"
```

---

## Task 8: Settings repository (used by auth in Plan 2)

**Files:**
- Create: `src/lib/repositories/settings.ts`
- Create: `src/lib/repositories/settings.test.ts`

**Interfaces:**
- Produces:
  - `getPasswordHash(db?): string | null`, `setPasswordHash(hash: string, db?): void`.
  - `getSessionSecret(db?): string | null`, `setSessionSecret(secret: string, db?): void`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/repositories/settings.test.ts`:

```ts
import { it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "./settings";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("stores password hash and session secret independently", () => {
  expect(getPasswordHash(db)).toBeNull();
  setPasswordHash("hash1", db);
  expect(getPasswordHash(db)).toBe("hash1");
  setSessionSecret("secret1", db);
  expect(getSessionSecret(db)).toBe("secret1");
  expect(getPasswordHash(db)).toBe("hash1"); // unaffected
  setPasswordHash("hash2", db);
  expect(getPasswordHash(db)).toBe("hash2");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/repositories/settings.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/repositories/settings.ts`**

```ts
import type Database from "better-sqlite3";
import { getDb } from "../db";

function ensureRow(db: Database.Database) {
  db.prepare("INSERT OR IGNORE INTO settings (id) VALUES (1)").run();
}

export function getPasswordHash(db: Database.Database = getDb()): string | null {
  const row = db.prepare("SELECT password_hash FROM settings WHERE id = 1").get() as
    | { password_hash: string | null }
    | undefined;
  return row?.password_hash ?? null;
}

export function setPasswordHash(hash: string, db: Database.Database = getDb()): void {
  ensureRow(db);
  db.prepare("UPDATE settings SET password_hash = ? WHERE id = 1").run(hash);
}

export function getSessionSecret(db: Database.Database = getDb()): string | null {
  const row = db.prepare("SELECT session_secret FROM settings WHERE id = 1").get() as
    | { session_secret: string | null }
    | undefined;
  return row?.session_secret ?? null;
}

export function setSessionSecret(secret: string, db: Database.Database = getDb()): void {
  ensureRow(db);
  db.prepare("UPDATE settings SET session_secret = ? WHERE id = 1").run(secret);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/repositories/settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/repositories/settings.ts src/lib/repositories/settings.test.ts
git commit -m "feat: add settings repository"
```

---

## Task 9: Seed / migration script

**Files:**
- Create: `scripts/seed-db.mjs`

**Interfaces:**
- Consumes: existing `src/data/*.ts` (values), all repositories, `crypto.scrypt`/`randomBytes`.
- Produces: a populated `data/portfolio.db`. Idempotent (running twice does not duplicate rows). Sets an initial password hash from `ADMIN_PASSWORD` (default `changeme`) and a random session secret if absent.

> The script imports the TS data files. Since it runs under Node, use `tsx` to load TS at runtime.

- [ ] **Step 1: Add the TS loader**

```bash
bun add -d tsx
```

Change the `seed` script in `package.json` to:

```json
"seed": "tsx scripts/seed-db.mjs"
```

- [ ] **Step 2: Create `scripts/seed-db.mjs`**

```js
import crypto from "node:crypto";
import { createDb } from "../src/lib/db.ts";
import { getAllWorks, createWork } from "../src/lib/repositories/works.ts";
import { getAllPetProjects, createPetProject } from "../src/lib/repositories/petProjects.ts";
import { getAllDjEvents, createDjEvent } from "../src/lib/repositories/djEvents.ts";
import { getDjInfo, saveDjInfo } from "../src/lib/repositories/djInfo.ts";
import { getCv, saveCv } from "../src/lib/repositories/cv.ts";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "../src/lib/repositories/settings.ts";

import { WORKS } from "../src/data/works.ts";
import { PET_PROJECTS } from "../src/data/pet-projects.ts";
import { DJ_INFO, DJ_EVENTS, DJ_PHOTOS, DJ_PARTNERS } from "../src/data/dj.ts";
import { CV, TOP_SKILLS } from "../src/data/cv.ts";

const dbPath = process.env.DATABASE_PATH || "data/portfolio.db";
const db = createDb(dbPath);

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Works
if (getAllWorks(db).length === 0) {
  for (const w of WORKS) {
    createWork(
      {
        slug: w.slug ?? w.title.toLowerCase().replace(/\s+/g, "-"),
        title: w.title,
        description: w.description,
        synopsis: w.synopsis,
        bgColor: w.bgColor,
        categories: w.categories,
        link: w.link,
        link2: w.link2,
        show: w.show,
        featured: w.featured,
        inProgress: w.inProgress,
        caseStudy: w.caseStudy,
      },
      db
    );
  }
  console.log(`Seeded ${WORKS.length} works`);
} else {
  console.log("Works already present — skipping");
}

// Pet projects
if (getAllPetProjects(db).length === 0) {
  for (const p of PET_PROJECTS) {
    createPetProject(
      { slug: p.id, title: p.title, icon: p.icon, image: p.image, url: p.url, description: p.description },
      db
    );
  }
  console.log(`Seeded ${PET_PROJECTS.length} pet projects`);
} else {
  console.log("Pet projects already present — skipping");
}

// DJ events
if (getAllDjEvents(db).length === 0) {
  for (const e of DJ_EVENTS) {
    createDjEvent({ date: e.date, venue: e.venue, city: e.city, link: e.link }, db);
  }
  console.log(`Seeded ${DJ_EVENTS.length} DJ events`);
} else {
  console.log("DJ events already present — skipping");
}

// DJ info
if (!getDjInfo(db)) {
  saveDjInfo(
    {
      summary: DJ_INFO.summary,
      technicalRider: DJ_INFO.technicalRider,
      bookingEmail: DJ_INFO.bookingEmail,
      photos: DJ_PHOTOS,
      partners: DJ_PARTNERS,
    },
    db
  );
  console.log("Seeded DJ info");
} else {
  console.log("DJ info already present — skipping");
}

// CV
if (!getCv(db)) {
  saveCv({ topSkills: TOP_SKILLS, ...CV }, db);
  console.log("Seeded CV");
} else {
  console.log("CV already present — skipping");
}

// Auth settings
if (!getPasswordHash(db)) {
  setPasswordHash(scryptHash(process.env.ADMIN_PASSWORD || "changeme"), db);
  console.log("Set initial admin password");
}
if (!getSessionSecret(db)) {
  setSessionSecret(crypto.randomBytes(32).toString("hex"), db);
  console.log("Generated session secret");
}

console.log("Seed complete:", dbPath);
```

- [ ] **Step 3: Run the seed**

Run: `ADMIN_PASSWORD='pick-a-real-one' bun run seed`
Expected: logs "Seeded N works", pet projects, DJ events, DJ info, CV, password, secret, then "Seed complete".

- [ ] **Step 4: Verify idempotency**

Run: `bun run seed`
Expected: all lines say "already present — skipping"; no duplication.

- [ ] **Step 5: Spot-check the data**

Run: `bunx tsx -e "import {createDb} from './src/lib/db.ts'; import {getAllWorks} from './src/lib/repositories/works.ts'; const db=createDb('data/portfolio.db'); const w=getAllWorks(db); console.log(w.length, w[0].slug, w[0].caseStudy?.blocks?.length)"`
Expected: prints the works count, first slug, and its block count — matching `src/data/works.ts`.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-db.mjs package.json bun.lock
git commit -m "feat: add SQLite seed/migration script"
```

---

## Task 10: Refactor `categoryUtils` to read from the works repository

**Files:**
- Modify: `src/utils/categoryUtils.ts`

**Interfaces:**
- Consumes: `getAllWorks` from `@/lib/repositories/works`.
- Produces: same exported function signatures as before (`getWorksByCategory`, `getAllCategories`, `getCategoryMetadata`, `validateCategory`, `getCategoryCount`) — now DB-backed.

- [ ] **Step 1: Replace the data import**

In `src/utils/categoryUtils.ts` change:

```ts
import { WORKS } from "@/data/works";
```
to
```ts
import { getAllWorks } from "@/lib/repositories/works";
```

- [ ] **Step 2: Read works inside each function**

Replace every reference to `WORKS` with a local `const works = getAllWorks();` at the top of `getWorksByCategory` and `getAllCategories`. Concretely:

```ts
export function getWorksByCategory(category: string) {
  return getAllWorks().filter(
    (work) => work.show && work.categories.includes(category.toLowerCase())
  );
}

export function getAllCategories(): string[] {
  const categoriesSet = new Set<string>();
  getAllWorks().forEach((work) => {
    if (work.show) {
      work.categories.forEach((category) => categoriesSet.add(category));
    }
  });
  return Array.from(categoriesSet).sort();
}
```

Leave `getCategoryMetadata`, `validateCategory`, and `getCategoryCount` unchanged (they call the two functions above).

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/categoryUtils.ts
git commit -m "refactor: read categories from works repository"
```

---

## Task 11: Refactor the home page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedWorks` from `@/lib/repositories/works`, `getAllPetProjects` from `@/lib/repositories/petProjects`.

- [ ] **Step 1: Swap imports and data source**

In `src/app/page.tsx`:
- Replace `import { WORKS } from "@/data/works";` with `import { getFeaturedWorks } from "@/lib/repositories/works";`
- Replace `import { PET_PROJECTS } from "@/data/pet-projects";` with `import { getAllPetProjects } from "@/lib/repositories/petProjects";`
- Add at the top of the file (after imports): `export const dynamic = "force-dynamic";`
- Change the component signature to read data: at the start of `export default function Home()` add:

```ts
  const works = getFeaturedWorks();
  const petProjects = getAllPetProjects();
```

- Replace the `WORKS.map(...)` block. Since `getFeaturedWorks()` already filters `show && featured`, simplify the render to:

```tsx
{works.map((project) => (
  <ProjectCard
    key={project.title}
    slug={project.slug}
    title={project.title}
    bgColor={project.bgColor}
    description={project.description}
    link={project.link}
    fonts={project.caseStudy?.fonts}
  />
))}
```

- Replace any `PET_PROJECTS` reference lower in the file with `petProjects`.

- [ ] **Step 2: Verify rendering**

Run: `bun run dev` then open `http://localhost:3000`.
Expected: home page shows the same featured projects and pet projects as before.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: home page reads from repositories"
```

---

## Task 12: Refactor the category page (make dynamic)

**Files:**
- Modify: `src/app/[category]/page.tsx`

- [ ] **Step 1: Remove static generation, add dynamic**

In `src/app/[category]/page.tsx`:
- Delete the entire `export async function generateStaticParams() { ... }` block.
- Add near the top: `export const dynamic = "force-dynamic";`
- Leave the rest untouched — it already calls `getWorksByCategory`, `getCategoryMetadata`, `validateCategory`, `getAllCategories` from `@/utils/categoryUtils`, which are now DB-backed.

- [ ] **Step 2: Verify**

Run: `bun run dev`, open `http://localhost:3000/web` (and another category).
Expected: category pages list the same projects and counts as before; unknown category → 404.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[category]/page.tsx"
git commit -m "refactor: category page dynamic, DB-backed"
```

---

## Task 13: Refactor the work detail page (make dynamic)

**Files:**
- Modify: `src/app/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getWorkBySlug`, `getAllWorkSlugs` from `@/lib/repositories/works`; `CaseStudyBlock` from `@/lib/types`.

- [ ] **Step 1: Inspect current usage**

Run: `sed -n '1,120p' src/app/work/[slug]/page.tsx` to see how `WORKS` is used (it looks up a single work by slug and uses `generateStaticParams`).

- [ ] **Step 2: Swap data source**

In `src/app/work/[slug]/page.tsx`:
- Replace `import { WORKS, CaseStudyBlock } from "@/data/works";` with:

```ts
import { getWorkBySlug, getAllWorkSlugs } from "@/lib/repositories/works";
import { CaseStudyBlock } from "@/lib/types";
```

- Add near the top: `export const dynamic = "force-dynamic";`
- Replace the slug lookup (something like `const work = WORKS.find((w) => w.slug === slug);`) with:

```ts
const work = getWorkBySlug(slug);
```

- Replace the body of `generateStaticParams` so it reads slugs from the DB (or delete it entirely — dynamic rendering makes it optional). To keep build-time prerendering, use:

```ts
export async function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}
```

> If `generateStaticParams` causes DB access issues during build, delete it — `dynamic = "force-dynamic"` renders on demand.

- [ ] **Step 3: Verify**

Run: `bun run dev`, open a known work e.g. `http://localhost:3000/work/bagel-bro`.
Expected: full case study renders identically (blocks, colors, fonts, video, gallery).

- [ ] **Step 4: Commit**

```bash
git add "src/app/work/[slug]/page.tsx"
git commit -m "refactor: work detail page dynamic, DB-backed"
```

---

## Task 14: Refactor the CV page

**Files:**
- Modify: `src/app/cv/page.tsx`

**Interfaces:**
- Consumes: `getCv` from `@/lib/repositories/cv`.

- [ ] **Step 1: Inspect current usage**

Run: `sed -n '1,80p' src/app/cv/page.tsx` — note how `CV` (and possibly `TOP_SKILLS`) fields are read.

- [ ] **Step 2: Swap data source**

In `src/app/cv/page.tsx`:
- Replace `import { CV } from "@/data/cv";` with `import { getCv } from "@/lib/repositories/cv";`
- Add near the top: `export const dynamic = "force-dynamic";`
- At the start of the component add:

```ts
const CV = getCv();
if (!CV) return null;
```

- If the page also used `TOP_SKILLS` from `@/data/cv`, read it as `CV.topSkills` (the seed nests it under `topSkills`). Update those references accordingly.

- [ ] **Step 3: Verify**

Run: `bun run dev`, open `http://localhost:3000/cv`.
Expected: CV renders identically (skills, experience, stack, languages, education).

- [ ] **Step 4: Commit**

```bash
git add src/app/cv/page.tsx
git commit -m "refactor: CV page dynamic, DB-backed"
```

---

## Task 15: Refactor the DJ page

**Files:**
- Modify: `src/app/dj/page.tsx`

**Interfaces:**
- Consumes: `getDjInfo` from `@/lib/repositories/djInfo`, `getAllDjEvents` from `@/lib/repositories/djEvents`.

- [ ] **Step 1: Inspect current usage**

Run: `sed -n '1,80p' src/app/dj/page.tsx` — note how `DJ_INFO`, `DJ_EVENTS`, `DJ_PHOTOS`, `DJ_PARTNERS` are consumed.

- [ ] **Step 2: Swap data source**

In `src/app/dj/page.tsx`:
- Replace `import { DJ_INFO, DJ_EVENTS, DJ_PHOTOS, DJ_PARTNERS } from "@/data/dj";` with:

```ts
import { getDjInfo } from "@/lib/repositories/djInfo";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
```

- Add near the top: `export const dynamic = "force-dynamic";`
- At the start of the component:

```ts
const djInfo = getDjInfo();
const DJ_EVENTS = getAllDjEvents();
if (!djInfo) return null;
const DJ_INFO = { summary: djInfo.summary, technicalRider: djInfo.technicalRider, bookingEmail: djInfo.bookingEmail };
const DJ_PHOTOS = djInfo.photos;
const DJ_PARTNERS = djInfo.partners;
```

(This keeps the existing JSX references working unchanged.)

- [ ] **Step 3: Verify**

Run: `bun run dev`, open `http://localhost:3000/dj`.
Expected: DJ page renders identically (summary, rider, events, photos, partners, booking email).

- [ ] **Step 4: Commit**

```bash
git add src/app/dj/page.tsx
git commit -m "refactor: DJ page dynamic, DB-backed"
```

---

## Task 16: Full build verification and delete old data files

**Files:**
- Delete: `src/data/works.ts`, `src/data/pet-projects.ts`, `src/data/dj.ts`, `src/data/cv.ts`

**Interfaces:**
- Consumes: nothing new — this verifies nothing still imports `@/data/*`.

- [ ] **Step 1: Confirm no remaining references to the old data files**

Run: `grep -rn "@/data/" src`
Expected: no results. (If any remain, fix them to use the repositories before deleting.)

- [ ] **Step 2: Delete the old data files**

```bash
git rm src/data/works.ts src/data/pet-projects.ts src/data/dj.ts src/data/cv.ts
```

- [ ] **Step 3: Full typecheck, tests, and build**

Run: `bunx tsc --noEmit`
Expected: no errors.

Run: `bun run test`
Expected: all repository/db tests pass.

Run: `DATABASE_PATH=data/portfolio.db bun run build`
Expected: build succeeds. (The seeded DB must exist; run `bun run seed` first if needed.)

- [ ] **Step 4: Manual smoke test against the production server**

Run: `bun run build && bun run start`, then visit `/`, `/web`, `/work/<a-slug>`, `/cv`, `/dj`.
Expected: every page matches the pre-migration site.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy TS data files (migrated to SQLite)"
```

---

## Task 17: Deployment — Node server + persistent volume

**Files:**
- Modify: `Dockerfile`
- Modify: `README.md` (deploy + seed notes)

**Interfaces:**
- Produces: a container that runs `next start` on Node with `data/` and `public/projects/` mounted as volumes.

- [ ] **Step 1: Rewrite `Dockerfile`**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/portfolio.db
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
```

> `python3/make/g++` are needed to compile `better-sqlite3`'s native binding on Alpine. `src` and `scripts` are copied so `bun run seed` can run inside the container.

- [ ] **Step 2: Document deploy + seed in `README.md`**

Add a "Database & Admin" section:

```markdown
## Database & deployment

Content lives in SQLite at `DATABASE_PATH` (default `data/portfolio.db`).

First run (once):
1. `ADMIN_PASSWORD='your-password' bun run seed` — creates and populates the DB.

Persist across redeploys by mounting volumes:
- `data/` — the SQLite database
- `public/projects/` — uploaded project images

Run the server: `bun run build && bun run start` (or the Docker image on port 3000).
```

- [ ] **Step 3: Verify the container builds and serves**

Run: `docker build -t portfolio . && docker run --rm -p 3000:3000 -v "$PWD/data:/app/data" -v "$PWD/public/projects:/app/public/projects" portfolio`
Expected: server starts; `http://localhost:3000` serves the site from the mounted DB.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile README.md
git commit -m "chore: run app as Node server with persistent SQLite volume"
```

---

## Self-Review

**Spec coverage:**
- Unified live server, SQLite source of truth → Tasks 1, 3, 17. ✅
- Manage everything (works, pet-projects, DJ, CV) storage → Tasks 4–8 (repos), 9 (seed). ✅
- Hybrid schema (columns + JSON) → Task 3. ✅
- Public pages read DB, dynamic rendering → Tasks 10–15. ✅
- Migration/seed idempotent, sets initial password + secret → Task 9. ✅
- Deployment as Node + volumes → Task 17. ✅
- Image upload / admin UI / auth → **Plan 2** (out of scope here; settings repo + password/secret seeding prepared in Tasks 8–9). ✅
- Testing (repo round-trips, seed idempotency) → Tasks 3–9, 16. ✅

**Deferred to Plan 2:** auth (`src/lib/auth.ts`, middleware, login), admin API routes, admin UI, image uploader.

**Type consistency:** `WorksType`, `PetProject`, `DjEvent`, `DjInfo`, `CvContent` defined in Task 2 and used identically across repos, seed, and pages. `getFeaturedWorks`/`getWorkBySlug`/`getAllWorkSlugs`/`getAllPetProjects`/`getAllDjEvents`/`getDjInfo`/`getCv` names are consistent between definition (Tasks 4–7) and consumption (Tasks 10–15). ✅
