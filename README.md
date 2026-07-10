This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Database & deployment

Content lives in **MySQL**. Configure the connection with either a single
`DATABASE_URL` (`mysql://user:pass@host:3306/dbname`) or the individual
`MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`
env vars. See `.env.example`.

### Local development

```bash
docker compose up -d          # start a local MySQL
cp .env.example .env          # DATABASE_URL points at it by default
docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS portfolio_test"  # for tests
ADMIN_PASSWORD='dev-password' bun run seed   # create schema + import content + admin login
bun run dev
```

`bun run test` runs the repository suite against `portfolio_test` (it skips if
no MySQL is reachable).

### Production (Hostinger / any Node host)

1. Create a MySQL database in the host panel and set the connection env vars
   (`DATABASE_URL` or the `MYSQL_*` set) plus `ADMIN_PASSWORD`.
2. Run the one-time seed: `ADMIN_PASSWORD='your-password' bun run seed`
   (`ADMIN_PASSWORD` is only needed for this step — the app doesn't read it at
   runtime). After that you can unset it.
3. `bun run build && bun run start` (or the Docker image on port 3000).

Uploaded project images are written to `public/projects/` — persist that
directory across redeploys (e.g. a mounted volume) so uploads survive.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
