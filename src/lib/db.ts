import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      synopsis TEXT,
      bg_color TEXT NOT NULL DEFAULT '#ffffff',
      categories TEXT NOT NULL DEFAULT '[]',
      link TEXT,
      link2 TEXT,
      show INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      in_progress INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      case_study TEXT
    );

    CREATE TABLE IF NOT EXISTS pet_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dj_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      link TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dj_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      summary TEXT NOT NULL DEFAULT '',
      technical_rider TEXT NOT NULL DEFAULT '[]',
      booking_email TEXT NOT NULL DEFAULT '',
      photos TEXT NOT NULL DEFAULT '[]',
      partners TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS cv (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT,
      session_secret TEXT
    );
  `);
}

export function createDb(dbPath: string): Database.Database {
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

// Singleton — survives Next.js dev hot-reload via globalThis.
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__db) {
    const dbPath = process.env.DATABASE_PATH || "data/portfolio.db";
    globalForDb.__db = createDb(dbPath);
  }
  return globalForDb.__db;
}
