import { rows, run } from "../db";
import type { CvContent } from "../types";

export async function getCv(): Promise<CvContent | null> {
  const r = await rows<{ content: string }>("SELECT content FROM cv WHERE id = 1");
  return r.length ? (JSON.parse(r[0].content) as CvContent) : null;
}

export async function saveCv(content: CvContent): Promise<void> {
  await run(
    `INSERT INTO cv (id, content) VALUES (1, :content)
     ON DUPLICATE KEY UPDATE content=:content`,
    { content: JSON.stringify(content) },
  );
}
