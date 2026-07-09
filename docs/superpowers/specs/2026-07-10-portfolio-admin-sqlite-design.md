# Portfolio Admin + SQLite — Design

**Date:** 2026-07-10
**Status:** Approved (pending spec review)

## Problem

Portfolio content is hand-authored in TypeScript files (`src/data/works.ts` — 911 lines
of nested case-study `blocks[]`, plus `pet-projects.ts`, `dj.ts`, `cv.ts`). Adding or
editing a project means manually editing large TS objects, placing image files under
`public/projects/<slug>/`, and rebuilding. This is slow and error-prone.

## Goal

A password-protected admin UI to manage **all** portfolio content, backed by SQLite,
with image upload + auto-WebP conversion. Edits go live instantly.

## Decisions (from brainstorming)

1. **Unified live server.** One Next.js app, server-rendered, SQLite as source of truth.
   The public site stops being a static export and is served by Node (`next start`).
   User can run a Node app on their shared hosting.
2. **Scope: everything** — works, pet-projects, DJ (info + events), CV.
3. **Images: upload + auto-WebP** in the admin via sharp (already a dependency).
4. **Auth: single password** + HMAC-signed session cookie.
5. **CV stored as a single JSON document** edited via a form (not normalized tables).
6. **v1 includes the blocks editor** (no deferral).

## Architecture

- Next.js 14 app, drop `output: "export"` and the static-only image constraint.
  Runs as a Node server via `next start`.
- **`better-sqlite3`** (synchronous driver, ideal for server components). DB file at
  `data/portfolio.db`. Added to `serverComponentsExternalPackages` in `next.config.mjs`.
- Data-access layer in `src/lib/` replaces `src/data/*.ts` imports.
- Shared **types** (`WorksType`, `CaseStudy`, `CaseStudyBlock`, and its union members,
  `Category`, CV/DJ types) move to `src/lib/types.ts`. Templates keep importing the
  types from there.

## Database schema (hybrid: scalar columns + JSON)

Queryable/sortable fields are columns; nested structures are JSON, faithful to the
existing TS types.

- **`works`**: `id, slug (unique), title, description, synopsis, bg_color,
  categories(JSON array), link(JSON), link2(JSON), show(int), featured(int),
  in_progress(int), sort_order(int), case_study(JSON)`.
  The full `caseStudy` object (template, header fields, colors, fonts, blocks[],
  credits, laurels, movieData, starring, etc.) is stored in `case_study` JSON.
- **`pet_projects`**: `id, title, icon, image, url, description, sort_order`.
- **`dj_events`**: `id, date, venue, city, sort_order`.
- **`dj_info`** (single row, id=1): `summary, technical_rider(JSON), booking_email,
  photos(JSON), partners(JSON)`.
- **`cv`** (single row, id=1): `content(JSON)`.
- **`settings`** (single row, id=1): `password_hash, session_secret`.

Booleans stored as integers (0/1). JSON columns serialized/parsed at the data-access
layer so callers get the same shapes as today's TS objects.

## Admin (`/admin`)

- **Login** (`/admin/login`): password checked against `settings.password_hash`
  (Node `crypto.scrypt`). On success, sets an HMAC-signed, httpOnly session cookie.
- **Dashboard**: links to each content section.
- **Works**: list view with reorder (updates `sort_order`) and quick toggles
  (`show`, `featured`, `in_progress`). Create/edit form:
  - Header fields: slug, title, description, synopsis, bgColor, categories, link, link2,
    show/featured/inProgress.
  - Case study: template selector (`case-study` | `font` | `movie`), colors
    (primary/contrast/faded), fonts (title/text + custom flags), role/client/task/
    releaseDate/coverImage/link, and template-specific fields (fontFile/downloadLink,
    movieData, starring, credits, laurels).
  - **Blocks editor**: ordered list; add / reorder (up/down or drag) / delete blocks.
    Each block type renders its own fields:
    - `section`: title, content, image, bgColor, titleColor
    - `image`: url, caption
    - `video`: url, caption
    - `gallery`: images[], columns, titleColor
    - `testimonial`: quote, author, position
    - `screens-grid`: images[], columns, bgColor, titleColor
    Image-bearing blocks use the uploader; multi-image blocks manage a list.
- **Pet projects**: CRUD list (title, icon, image, url, description, reorder).
- **DJ**: edit `dj_info` (summary, technical rider items, booking email, photos,
  partners) + `dj_events` CRUD (date, venue, city, reorder).
- **CV**: form editing the CV JSON document.

## Auth & API

- `middleware.ts` guards `/admin/*` (except `/admin/login`) and `/api/admin/*`,
  verifying the signed session cookie; unauthenticated → redirect to login (pages) or
  401 (API).
- CRUD + upload endpoints under `/api/admin/*`:
  - `POST /api/admin/login`, `POST /api/admin/logout`
  - `works` / `pet-projects` / `dj-events` / `dj-info` / `cv`: create/update/delete/reorder
  - `POST /api/admin/upload`: multipart file → saves original under
    `public/projects/<slug>/`, runs sharp → WebP, returns stored path.
- Public pages need **no** public API — server components read the DB directly.

## Public pages

Replace `@/data/*` imports with data-access-layer calls:

- `src/app/page.tsx` — works + pet-projects
- `src/app/[category]/page.tsx` — works (make **dynamic**, drop `generateStaticParams`)
- `src/app/work/[slug]/page.tsx` — works (make **dynamic**, drop `generateStaticParams`)
- `src/app/cv/page.tsx` — cv
- `src/app/dj/page.tsx` — dj info + events + photos + partners

No visual/markup changes: same components, same prop shapes (data layer returns the
same objects the TS files did). Dynamic rendering means admin edits appear instantly.

## Migration / seed

One-time idempotent `scripts/seed-db.mjs`: creates the schema (if absent) and imports
the existing `src/data/*.ts` into SQLite. Also seeds `settings` with an initial
password hash (from an env var / prompt) and a generated session secret. The old
`src/data/*.ts` files remain until the migration is verified in the running app, then
are deleted (types already extracted to `src/lib/types.ts`).

## Deployment

- Dockerfile: build stage runs `next build`; production stage runs `next start` on
  `node:20` (replaces busybox static serving).
- Persist via volume: `data/portfolio.db` **and** `public/projects/` (uploaded images)
  survive redeploys.
- `.gitignore`: add `data/*.db`. Uploaded images under `public/projects/` are runtime
  data on the server volume.

## Testing

Light coverage:
- Data-access layer: round-trip read/write for each table, JSON (de)serialization.
- Seed idempotency (running twice doesn't duplicate).
- Auth: password hash verify + cookie sign/verify (valid, tampered, expired).

## Out of scope (v1)

- Multi-user accounts / roles.
- Public-facing API.
- Rebuild pipeline (not needed — server reads DB live).
