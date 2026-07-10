import { rows, run } from "../db";
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

export async function getAllDjEvents(): Promise<DjEvent[]> {
  return (await rows<Row>("SELECT * FROM dj_events ORDER BY sort_order, id")).map(toEvent);
}

export async function createDjEvent(input: DjEvent): Promise<number> {
  const [{ n }] = await rows<{ n: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM dj_events",
  );
  const res = await run(
    "INSERT INTO dj_events (`date`, venue, city, link, sort_order) VALUES (:date, :venue, :city, :link, :sort_order)",
    {
      date: input.date,
      venue: input.venue,
      city: input.city ?? "",
      link: input.link ?? null,
      sort_order: input.sortOrder ?? n,
    },
  );
  return res.insertId;
}

export async function updateDjEvent(id: number, input: DjEvent): Promise<void> {
  await run(
    "UPDATE dj_events SET `date`=:date, venue=:venue, city=:city, link=:link WHERE id=:id",
    {
      id,
      date: input.date,
      venue: input.venue,
      city: input.city ?? "",
      link: input.link ?? null,
    },
  );
}

export async function deleteDjEvent(id: number): Promise<void> {
  await run("DELETE FROM dj_events WHERE id = :id", { id });
}

export async function reorderDjEvents(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await run("UPDATE dj_events SET sort_order = :o WHERE id = :id", { o: i, id: ids[i] });
  }
}
