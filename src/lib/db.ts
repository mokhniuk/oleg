import mysql from "mysql2/promise";

export type Pool = mysql.Pool;

/** Build pool options from DATABASE_URL, else individual MYSQL_* env vars. */
function poolConfig(): mysql.PoolOptions {
  const url = process.env.DATABASE_URL;
  if (url) {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
    };
  }
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "portfolio",
  };
}

export function createPool(overrides?: mysql.PoolOptions): Pool {
  return mysql.createPool({
    ...poolConfig(),
    ...overrides,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    charset: "utf8mb4",
  });
}

// Process-wide singleton — survives Next.js dev hot-reload via globalThis.
const globalForDb = globalThis as unknown as { __pool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.__pool) globalForDb.__pool = createPool();
  return globalForDb.__pool;
}

// Named-placeholder params (namedPlaceholders: true) or positional array.
type Params = Record<string, unknown> | unknown[];

/** Query helper returning typed rows. */
export async function rows<T>(sql: string, params?: Params, pool: Pool = getPool()): Promise<T[]> {
  const [result] = await pool.query(sql, params as unknown[]);
  return result as T[];
}

/** Mutation helper returning the result header (insertId, affectedRows). */
export async function run(sql: string, params?: Params, pool: Pool = getPool()): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.query(sql, params as unknown[]);
  return result as mysql.ResultSetHeader;
}

/** Run `fn` on one connection inside a transaction; rolls back if it throws. */
export async function inTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>, pool: Pool = getPool()): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      conn.destroy(); // connection is broken; don't hand it back to the pool
    }
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * Set sort_order = position for every row of `table`. `ids` must be exactly the
 * current set of row ids (no duplicates, nothing missing or unknown); otherwise
 * nothing changes and false is returned, so a stale client list can't scramble the order.
 */
export async function reorderRows(table: "works" | "pet_projects" | "dj_events", ids: number[]): Promise<boolean> {
  return inTransaction(async (conn) => {
    const [existing] = await conn.query<mysql.RowDataPacket[]>(`SELECT id FROM \`${table}\` FOR UPDATE`);
    const have = new Set(existing.map((r) => r.id as number));
    if (new Set(ids).size !== ids.length || ids.length !== have.size || !ids.every((id) => have.has(id))) return false;
    for (let i = 0; i < ids.length; i++) {
      await conn.query(`UPDATE \`${table}\` SET sort_order = ? WHERE id = ?`, [i, ids[i]]);
    }
    return true;
  });
}

// JSON is stored as LONGTEXT and (de)serialized in the repositories. Booleans
// are TINYINT (0/1). `show` and `date` are reserved words, so they are
// back-ticked wherever referenced.
const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS works (
     id INT AUTO_INCREMENT PRIMARY KEY,
     slug VARCHAR(191) NOT NULL UNIQUE,
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     synopsis TEXT NULL,
     bg_color VARCHAR(32) NOT NULL DEFAULT '#ffffff',
     categories LONGTEXT NOT NULL,
     link LONGTEXT NULL,
     link2 LONGTEXT NULL,
     \`show\` TINYINT NOT NULL DEFAULT 1,
     featured TINYINT NOT NULL DEFAULT 0,
     in_progress TINYINT NOT NULL DEFAULT 0,
     sort_order INT NOT NULL DEFAULT 0,
     case_study LONGTEXT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS pet_projects (
     id INT AUTO_INCREMENT PRIMARY KEY,
     slug VARCHAR(191) NOT NULL UNIQUE,
     title TEXT NOT NULL,
     icon TEXT NOT NULL,
     image TEXT NOT NULL,
     url TEXT NOT NULL,
     description TEXT NOT NULL,
     sort_order INT NOT NULL DEFAULT 0
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS dj_events (
     id INT AUTO_INCREMENT PRIMARY KEY,
     \`date\` VARCHAR(32) NOT NULL,
     venue TEXT NOT NULL,
     city TEXT NOT NULL,
     link TEXT NULL,
     sort_order INT NOT NULL DEFAULT 0
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS dj_info (
     id INT PRIMARY KEY,
     summary LONGTEXT NOT NULL,
     technical_rider LONGTEXT NOT NULL,
     booking_email VARCHAR(255) NOT NULL,
     photos LONGTEXT NOT NULL,
     partners LONGTEXT NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS cv (
     id INT PRIMARY KEY,
     content LONGTEXT NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS settings (
     id INT PRIMARY KEY,
     password_hash VARCHAR(255) NULL,
     session_secret VARCHAR(255) NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export async function initSchema(pool: Pool = getPool()): Promise<void> {
  for (const stmt of SCHEMA) await pool.query(stmt);
}
