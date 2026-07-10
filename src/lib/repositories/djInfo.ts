import { rows, run } from "../db";
import type { DjInfo } from "../types";

type Row = {
  summary: string;
  technical_rider: string;
  booking_email: string;
  photos: string;
  partners: string;
};

export async function getDjInfo(): Promise<DjInfo | null> {
  const r = await rows<Row>("SELECT * FROM dj_info WHERE id = 1");
  if (!r.length) return null;
  const row = r[0];
  return {
    summary: row.summary,
    technicalRider: JSON.parse(row.technical_rider),
    bookingEmail: row.booking_email,
    photos: JSON.parse(row.photos),
    partners: JSON.parse(row.partners),
  };
}

export async function saveDjInfo(info: DjInfo): Promise<void> {
  await run(
    `INSERT INTO dj_info (id, summary, technical_rider, booking_email, photos, partners)
     VALUES (1, :summary, :rider, :email, :photos, :partners)
     ON DUPLICATE KEY UPDATE
       summary=:summary, technical_rider=:rider, booking_email=:email, photos=:photos, partners=:partners`,
    {
      summary: info.summary,
      rider: JSON.stringify(info.technicalRider ?? []),
      email: info.bookingEmail,
      photos: JSON.stringify(info.photos ?? []),
      partners: JSON.stringify(info.partners ?? []),
    },
  );
}
