# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site (works, pet projects, DJ page, CV) with a password-protected
admin area for editing all content. Next.js 14 App Router, React 18, TypeScript, Sass
modules. Content lives in **MySQL**; the package manager is **bun**.

## Commands

```bash
bun run dev            # dev server on :3000
bun run build          # convert-images.js (jpg/png → webp) THEN next build
bun run start          # production server
bun run lint           # next lint
bun run test           # vitest run (see DB note below)
bun run test:watch     # vitest watch
bun run analyze        # ANALYZE=true next build (bundle analyzer)
ADMIN_PASSWORD='...' bun run seed   # create schema + import seed-data.json + admin login
```

Run a single test file: `bunx vitest run src/lib/repositories/works.test.ts`

## Database setup (required for dev and tests)

The app needs a reachable MySQL. Locally: `docker compose up -d` starts one, and
`.env.example` (copy to `.env`) points `DATABASE_URL` at it. Connection is configured by
either a single `DATABASE_URL` (`mysql://user:pass@host:3306/db`) or the individual
`MYSQL_HOST/PORT/USER/PASSWORD/DATABASE` vars (URL wins).

- **Seeding** is a one-time step: `initSchema()` creates tables, `seed-data.json` fills
  content, and `ADMIN_PASSWORD` is hashed into the DB. `ADMIN_PASSWORD` is *only* read by
  the seed script — the running app never reads it.
- **Tests** run against a separate `portfolio_test` database (see `vitest.setup.ts`, override
  with `TEST_DATABASE_URL`). They **skip silently if no MySQL is reachable** (`dbAvailable()`
  in `testHelpers.ts`), so a green run with no DB proves nothing. `resetDb()` `TRUNCATE`s
  every table between tests, and `vitest.config.ts` sets `fileParallelism: false` so files
  don't wipe each other's rows.

Note: the data layer was migrated from SQLite to MySQL (`mysql2`). The `docs/superpowers/`
spec/plan filenames still say "sqlite" for historical reasons; the implementation is MySQL.

## Architecture

**Data layer is the spine.** Everything reads/writes content through repository modules in
`src/lib/repositories/` (`works`, `petProjects`, `djEvents`, `djInfo`, `cv`, `settings`).
Rules that hold across all of them:

- Only `src/lib/db.ts` touches `mysql2`. It exposes `rows<T>(sql, params)` (SELECT) and
  `run(sql, params)` (mutations), plus a `globalThis`-cached pool singleton that survives dev
  hot-reload. Params use **named placeholders** (`:slug`) — `namedPlaceholders: true` is on.
- Repositories map between snake_case DB rows and camelCase domain types from
  `src/lib/types.ts`. **Complex fields (categories, links, case studies, photos, CV content)
  are stored as JSON in `LONGTEXT` columns** and `JSON.parse`/`JSON.stringify`'d in the repo —
  not native SQL columns. Booleans are `TINYINT` 0/1. `show` and `date` are reserved words and
  must be back-ticked in SQL.
- Singleton tables (`dj_info`, `cv`, `settings`) always use `id = 1`.

**Auth** (`src/lib/auth.ts` + `src/middleware.ts`): password is scrypt-hashed in the
`settings` table; login issues an HMAC-signed session token (secret also in `settings`) stored
in the `admin_session` httpOnly cookie. `src/middleware.ts` gates `/admin/*` and `/api/admin/*`
by cookie *presence only* (redirects pages to login, 401s API routes). Every admin API route
**must additionally call `await hasValidSession()`** — the middleware does not verify the
signature, it only checks the cookie exists.

**Routing / rendering:**
- Public pages: `/` (home), `/[category]` (dynamic category listings derived from works'
  `categories` arrays via `src/utils/categoryUtils.ts`), `/work/[slug]` (case studies),
  `/about`, `/dj`, `/cv`. Most public pages set `export const dynamic = "force-dynamic"` since
  content comes from the DB.
- Admin: `/admin/*` pages + `/api/admin/*` route handlers (all `runtime = "nodejs"`).
  `SiteChrome.tsx` renders the public Header/Footer for everything **except** `/admin/*`,
  which has its own layout/nav.

**Images:** uploads go to `public/projects/<slug>/` as WebP (converted server-side with
`sharp` in `api/admin/upload/route.ts`). This directory must persist across redeploys. The
`build` script also runs `convert-images.js` over `public/images` and `public/projects`. The
Next image optimizer is disabled (`images.unoptimized`); `mysql2` and `sharp` are externalized
in `next.config.mjs`.

## Conventions

- Path alias `@/*` → `src/*` (tsconfig + vitest).
- Component folders pair `Component.tsx` with a co-located `component.module.scss` (Sass
  modules). Global styles in `src/assets/styles/`.
- New content types follow the existing shape: a table in `db.ts`'s `SCHEMA`, a repository
  module with row↔type mappers, a `types.ts` entry, an admin page + API route, and a
  `.test.ts` next to the repository.

## Planning docs

`docs/superpowers/{specs,plans}/` hold the design spec and implementation plans for the
admin/DB backend work — useful context for how this backend was intended to fit together.
