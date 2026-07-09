import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { DjInfo } from "../types";

type Row = {
  summary: string;
  technical_rider: string;
  booking_email: string;
  photos: string;
  partners: string;
};

export function getDjInfo(db: Database.Database = getDb()): DjInfo | null {
  const row = db.prepare("SELECT * FROM dj_info WHERE id = 1").get() as Row | undefined;
  if (!row) return null;
  return {
    summary: row.summary,
    technicalRider: JSON.parse(row.technical_rider),
    bookingEmail: row.booking_email,
    photos: JSON.parse(row.photos),
    partners: JSON.parse(row.partners),
  };
}

export function saveDjInfo(info: DjInfo, db: Database.Database = getDb()): void {
  db.prepare(
    `INSERT INTO dj_info (id, summary, technical_rider, booking_email, photos, partners)
     VALUES (1, @summary, @rider, @email, @photos, @partners)
     ON CONFLICT(id) DO UPDATE SET
       summary=@summary, technical_rider=@rider, booking_email=@email, photos=@photos, partners=@partners`
  ).run({
    summary: info.summary,
    rider: JSON.stringify(info.technicalRider ?? []),
    email: info.bookingEmail,
    photos: JSON.stringify(info.photos ?? []),
    partners: JSON.stringify(info.partners ?? []),
  });
}
