import { it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "./settings";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("stores password hash and session secret independently", () => {
  expect(getPasswordHash(db)).toBeNull();
  setPasswordHash("hash1", db);
  expect(getPasswordHash(db)).toBe("hash1");
  setSessionSecret("secret1", db);
  expect(getSessionSecret(db)).toBe("secret1");
  expect(getPasswordHash(db)).toBe("hash1"); // unaffected
  setPasswordHash("hash2", db);
  expect(getPasswordHash(db)).toBe("hash2");
});
