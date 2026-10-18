import crypto from "node:crypto";
import { hashPassword } from "../src/lib/auth.ts";
import { getPool } from "../src/lib/db.ts";
import { setPasswordHash, setSessionSecret } from "../src/lib/repositories/settings.ts";

// Prefer ADMIN_PASSWORD: a command-line argument shows up in shell history and `ps`.
const password = process.env.ADMIN_PASSWORD ?? process.argv[2];
if (!password) {
  console.error("Usage: ADMIN_PASSWORD='<new-password>' bun run reset-password");
  process.exit(1);
}

await setPasswordHash(hashPassword(password));
// New secret invalidates every existing session cookie.
await setSessionSecret(crypto.randomBytes(32).toString("hex"));
await getPool().end();
console.log("Admin password reset; all existing sessions are now invalid.");
