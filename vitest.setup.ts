// Point the data layer at a MySQL test database. DATABASE_URL (e.g. from .env) is
// deliberately ignored: resetDb() truncates every table, so tests must only ever
// use TEST_DATABASE_URL or the default portfolio_test database.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mysql://root:root@127.0.0.1:3306/portfolio_test";
