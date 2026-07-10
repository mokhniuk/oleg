// Point the data layer at a MySQL test database. Override with
// TEST_DATABASE_URL (or DATABASE_URL) to use a different server.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.TEST_DATABASE_URL ||
  "mysql://root:root@127.0.0.1:3306/portfolio_test";
