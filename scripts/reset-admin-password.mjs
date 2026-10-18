import { hashPassword } from "../src/lib/auth.ts";
import { getPool } from "../src/lib/db.ts";
import { setPasswordHash } from "../src/lib/repositories/settings.ts";

const password = process.argv[2] ?? process.env.ADMIN_PASSWORD;
if (!password) {
  console.error("Usage: bun run reset-password <new-password> (or set ADMIN_PASSWORD)");
  process.exit(1);
}

await setPasswordHash(hashPassword(password));
await getPool().end();
console.log("Admin password reset.");
