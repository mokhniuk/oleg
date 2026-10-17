import { hashPassword } from "../src/lib/auth.ts";
import { setPasswordHash } from "../src/lib/repositories/settings.ts";

const password = process.argv[2];
if (!password) {
  console.error("Usage: bun run scripts/reset-admin-password.mjs <new-password>");
  process.exit(1);
}

await setPasswordHash(hashPassword(password));
console.log("Admin password reset.");
