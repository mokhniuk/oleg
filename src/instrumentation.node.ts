// Node-only startup work, loaded from src/instrumentation.ts. Kept in its own file so
// the Edge instrumentation bundle never pulls in mysql2.
import { initSchema } from "@/lib/db";

/** Create the schema if missing (idempotent), retrying while MySQL boots. Never throws. */
export async function ensureSchema() {
  const attempts = 15;
  const delayMs = 2000;
  for (let i = 1; i <= attempts; i++) {
    try {
      await initSchema();
      console.log("[init] database schema ready");
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (i === attempts) {
        console.error(`[init] could not initialise the schema after ${attempts} attempts: ${msg}`);
        return; // never crash the server; /api/health reports 503 while the DB is down
      }
      console.log(`[init] database not ready (${i}/${attempts}): ${msg}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
