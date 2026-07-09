import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { DjEvent } from "../types";

type Row = {
  id: number;
  date: string;
  venue: string;
  city: string;
  link: string | null;
  sort_order: number;
};

const toEvent = (r: Row): DjEvent => ({
  id: r.id,
  date: r.date,
  venue: r.venue,
  city: r.city,
  link: r.link ?? undefined,
  sortOrder: r.sort_order,
});

export function getAllDjEvents(db: Database.Database = getDb()): DjEvent[] {
  return (db.prepare("SELECT * FROM dj_events ORDER BY sort_order, id").all() as Row[]).map(toEvent);
}

export function createDjEvent(input: DjEvent, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM dj_events").get() as { m: number }).m + 1;
  const info = db
    .prepare(
      `INSERT INTO dj_events (date, venue, city, link, sort_order)
       VALUES (@date, @venue, @city, @link, @sort_order)`
    )
    .run({
      date: input.date,
      venue: input.venue,
      city: input.city ?? "",
      link: input.link ?? null,
      sort_order: input.sortOrder ?? nextOrder,
    });
  return Number(info.lastInsertRowid);
}

export function updateDjEvent(id: number, input: DjEvent, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE dj_events SET date=@date, venue=@venue, city=@city, link=@link WHERE id=@id`
  ).run({
    id,
    date: input.date,
    venue: input.venue,
    city: input.city ?? "",
    link: input.link ?? null,
  });
}

export function deleteDjEvent(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM dj_events WHERE id = ?").run(id);
}

export function reorderDjEvents(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE dj_events SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => list.forEach((id, i) => stmt.run(i, id)));
  tx(ids);
}
