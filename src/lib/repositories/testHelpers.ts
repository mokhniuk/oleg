import { getPool, initSchema } from "../db";

const TABLES = ["works", "pet_projects", "dj_events", "dj_info", "cv", "settings"];

/** True when a MySQL test database is reachable (tests skip otherwise). */
export async function dbAvailable(): Promise<boolean> {
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/** Ensure schema exists and empty every table for an isolated test. */
export async function resetDb(): Promise<void> {
  await initSchema();
  for (const t of TABLES) await getPool().query(`TRUNCATE TABLE \`${t}\``);
}
