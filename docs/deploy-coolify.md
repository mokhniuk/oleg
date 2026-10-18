# Deploying on Coolify

One Docker Compose stack (`docker-compose.coolify.yml`): `app` (Next.js, built from `Dockerfile`) and `mysql` (mysql:8, not exposed).

## Create the application

1. New resource -> Application -> your Gitea repo -> build pack **Docker Compose**, compose file `docker-compose.coolify.yml`.
2. Under Domains, set the domain for service `app` with the container port: `https://example.com:3000`.
3. Deploy. Coolify generates `SERVICE_PASSWORD_DB` and `SERVICE_PASSWORD_ROOT` (MySQL user and root passwords) on first deploy; they persist and can be edited under Environment Variables. Do not change them after the MySQL volume exists (MySQL only reads them on first init).

## Environment

| Variable | Where | Notes |
|---|---|---|
| `SERVICE_PASSWORD_DB` | Coolify-generated | password of MySQL user `portfolio` |
| `SERVICE_PASSWORD_ROOT` | Coolify-generated | MySQL root password |
| `DATABASE_URL` | set in the compose file | `mysql://portfolio:<pw>@mysql:3306/portfolio` |
| `UPLOAD_DIR` | set in the compose file | `/data/projects` (volume `uploads`) |

`ADMIN_PASSWORD` is only used by the `seed` / `reset-password` scripts, never by the running app.

## Volumes

- `uploads` -> `/data/projects`: admin-uploaded images. `/projects/*` is served from here first, then from images baked into the image.
- `mysql` -> `/var/lib/mysql`: database.

## First start

The app creates the tables on boot (retrying while MySQL starts). For a fresh site, seed content and the admin login from the app container terminal (Coolify -> app -> Terminal):

    ADMIN_PASSWORD='<choose one>' npx tsx scripts/seed-db.mjs

Skip this if you import an existing database (below).

## Importing existing data

Database, from the machine that has the data:

    mysqldump -uroot -p --no-tablespaces portfolio > portfolio.sql
    # copy portfolio.sql to the server, then on the server:
    docker exec -i <mysql-container> sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" portfolio' < portfolio.sql

Uploaded images (the `public/projects/<slug>/` files created through the admin): copy into the uploads volume, keeping the `<slug>/<file>.webp` layout and making them readable by uid 1000 (`node`):

    docker cp ./projects/. <app-container>:/data/projects/
    docker exec -u root <app-container> chown -R node:node /data/projects

Images committed in the repo under `public/projects` are already in the image and need no copying.

## Reset the admin password

In the app container terminal:

    ADMIN_PASSWORD='<new password>' npm run reset-password

This also invalidates all existing sessions.

## Health

`GET /api/health` returns `{"ok":true}` (200) when the app can reach MySQL, otherwise 503. It is used by the image `HEALTHCHECK` and the compose `healthcheck`.

## Backups

Back up both volumes. For the database a periodic dump is simplest (Coolify scheduled tasks or host cron):

    docker exec <mysql-container> sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --no-tablespaces portfolio' | gzip > portfolio-$(date +%F).sql.gz

For uploads, archive the `uploads` volume (for example `docker run --rm -v <project>_uploads:/d -v $PWD:/b alpine tar czf /b/uploads.tgz -C /d .`).
