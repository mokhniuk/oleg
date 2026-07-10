import { rows, run } from "../db";

async function ensureRow(): Promise<void> {
  await run("INSERT IGNORE INTO settings (id) VALUES (1)");
}

export async function getPasswordHash(): Promise<string | null> {
  const r = await rows<{ password_hash: string | null }>("SELECT password_hash FROM settings WHERE id = 1");
  return r[0]?.password_hash ?? null;
}

export async function setPasswordHash(hash: string): Promise<void> {
  await ensureRow();
  await run("UPDATE settings SET password_hash = :hash WHERE id = 1", { hash });
}

export async function getSessionSecret(): Promise<string | null> {
  const r = await rows<{ session_secret: string | null }>("SELECT session_secret FROM settings WHERE id = 1");
  return r[0]?.session_secret ?? null;
}

export async function setSessionSecret(secret: string): Promise<void> {
  await ensureRow();
  await run("UPDATE settings SET session_secret = :secret WHERE id = 1", { secret });
}
