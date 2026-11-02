// Best-effort .env load for local runs (Node 20.12+). Harmless if .env or the API is missing.
try { process.loadEnvFile(); } catch {}

import crypto from "node:crypto";

// Imports are dynamic so they run after the env is loaded (static imports are hoisted).
const { hashPassword } = await import("../src/lib/auth.ts");
const { getPool } = await import("../src/lib/db.ts");
const { setPasswordHash, setSessionSecret } = await import("../src/lib/repositories/settings.ts");

// Prefer ADMIN_PASSWORD: a command-line argument shows up in shell history and `ps`.
const password = process.env.ADMIN_PASSWORD ?? process.argv[2];
if (!password) {
  console.error("Usage: ADMIN_PASSWORD='<new-password>' bun run reset-password   (or npm run in the container)");
  process.exit(1);
}

await setPasswordHash(hashPassword(password));
// New secret invalidates every existing session cookie.
await setSessionSecret(crypto.randomBytes(32).toString("hex"));
await getPool().end();
console.log("Admin password reset; all existing sessions are now invalid.");
