import type Database from "better-sqlite3";
import { getDb } from "../db";

function ensureRow(db: Database.Database) {
  db.prepare("INSERT OR IGNORE INTO settings (id) VALUES (1)").run();
}

export function getPasswordHash(db: Database.Database = getDb()): string | null {
  const row = db.prepare("SELECT password_hash FROM settings WHERE id = 1").get() as
    | { password_hash: string | null }
    | undefined;
  return row?.password_hash ?? null;
}

export function setPasswordHash(hash: string, db: Database.Database = getDb()): void {
  ensureRow(db);
  db.prepare("UPDATE settings SET password_hash = ? WHERE id = 1").run(hash);
}

export function getSessionSecret(db: Database.Database = getDb()): string | null {
  const row = db.prepare("SELECT session_secret FROM settings WHERE id = 1").get() as
    | { session_secret: string | null }
    | undefined;
  return row?.session_secret ?? null;
}

export function setSessionSecret(secret: string, db: Database.Database = getDb()): void {
  ensureRow(db);
  db.prepare("UPDATE settings SET session_secret = ? WHERE id = 1").run(secret);
}
