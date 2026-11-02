# Backlog

## Self-host fonts for New Age Defence and Flicker Club
Works are not public yet, so not blocking. Seed data marks these fonts as custom (no Google request) and the page falls back to serif / system-ui until the files exist.

- [ ] Add font files from the local projects (none are in the repo yet):
  - `public/projects/new-age-defence/fonts/Signifier.woff2`
  - `public/projects/new-age-defence/fonts/PP-Neue-Montreal.woff2` (loader turns spaces into dashes)
  - `public/projects/flicker-club/fonts/SF-Pro-Text.woff2`, or drop it and use `system-ui` (Apple's SF licence usually forbids web embedding)
- [ ] Add matching `@font-face` rules in `src/assets/styles/project-fonts.css` (family names must equal the seed `fonts.title` / `fonts.text`)
- [ ] Check each font licence allows web embedding
- [ ] Run `SEED_UPDATE=1` seed on the deployed DB if font config changes (see `docs/deploy-coolify.md`)
