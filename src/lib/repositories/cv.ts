import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { CvContent } from "../types";

export function getCv(db: Database.Database = getDb()): CvContent | null {
  const row = db.prepare("SELECT content FROM cv WHERE id = 1").get() as
    | { content: string }
    | undefined;
  return row ? (JSON.parse(row.content) as CvContent) : null;
}

export function saveCv(content: CvContent, db: Database.Database = getDb()): void {
  db.prepare(
    `INSERT INTO cv (id, content) VALUES (1, @content)
     ON CONFLICT(id) DO UPDATE SET content=@content`
  ).run({ content: JSON.stringify(content) });
}
