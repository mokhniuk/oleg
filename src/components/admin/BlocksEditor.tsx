"use client";
import type { CaseStudyBlock } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import ImageListEditor from "./ImageListEditor";
import styles from "@/components/admin/admin.module.scss";

const BLOCK_TYPES: CaseStudyBlock["type"][] = [
  "section",
  "image",
  "video",
  "gallery",
  "testimonial",
  "screens-grid",
];

function emptyBlock(type: CaseStudyBlock["type"]): CaseStudyBlock {
  switch (type) {
    case "section": return { type, content: "" };
    case "image": return { type, url: "" };
    case "video": return { type, url: "" };
    case "gallery": return { type, images: [] };
    case "testimonial": return { type, quote: "", author: "", position: "" };
    case "screens-grid": return { type, images: [] };
  }
}

export default function BlocksEditor({
  blocks,
  slug,
  onChange,
}: {
  blocks: CaseStudyBlock[];
  slug: string;
  onChange: (blocks: CaseStudyBlock[]) => void;
}) {
  const update = (i: number, patch: Partial<CaseStudyBlock>) =>
    onChange(blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as CaseStudyBlock) : b)));
  const remove = (i: number) => onChange(blocks.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const copy = [...blocks];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = (type: CaseStudyBlock["type"]) => onChange([...blocks, emptyBlock(type)]);

  return (
    <div>
      <h3>Case study blocks</h3>
      {blocks.map((b, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.blockHead}>
            <strong>{b.type}</strong>
            <span className={styles.row}>
              <button type="button" className={styles.button} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className={styles.button} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => remove(i)}>Delete</button>
            </span>
          </div>

          {b.type === "section" && (
            <>
              <div className={styles.field}><label>Title</label>
                <input value={b.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} /></div>
              <div className={styles.field}><label>Content</label>
                <textarea rows={4} value={b.content} onChange={(e) => update(i, { content: e.target.value })} /></div>
              <div className={styles.field}><label>Background color</label>
                <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              <div className={styles.field}><label>Title color</label>
                <select value={b.titleColor ?? ""} onChange={(e) => update(i, { titleColor: (e.target.value || undefined) as any })}>
                  <option value="">default</option><option value="primary">primary</option><option value="contrast">contrast</option>
                </select></div>
              <ImageUploader value={b.image} slug={slug} onChange={(p) => update(i, { image: p })} label="Section image (optional)" />
            </>
          )}

          {b.type === "image" && (
            <>
              <ImageUploader value={b.url} slug={slug} onChange={(p) => update(i, { url: p })} />
              <div className={styles.field}><label>Caption</label>
                <input value={b.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} /></div>
            </>
          )}

          {b.type === "video" && (
            <>
              <div className={styles.field}><label>Video URL (path under /public)</label>
                <input value={b.url} onChange={(e) => update(i, { url: e.target.value })} /></div>
              <div className={styles.field}><label>Caption</label>
                <input value={b.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value })} /></div>
            </>
          )}

          {b.type === "testimonial" && (
            <>
              <div className={styles.field}><label>Quote</label>
                <textarea rows={3} value={b.quote} onChange={(e) => update(i, { quote: e.target.value })} /></div>
              <div className={styles.field}><label>Author</label>
                <input value={b.author} onChange={(e) => update(i, { author: e.target.value })} /></div>
              <div className={styles.field}><label>Position</label>
                <input value={b.position} onChange={(e) => update(i, { position: e.target.value })} /></div>
            </>
          )}

          {(b.type === "gallery" || b.type === "screens-grid") && (
            <>
              <ImageListEditor values={b.images} slug={slug} onChange={(imgs) => update(i, { images: imgs })} />
              <div className={styles.field}><label>Columns</label>
                <input type="number" value={b.columns ?? ""} onChange={(e) => update(i, { columns: Number(e.target.value) as any })} /></div>
              {b.type === "screens-grid" && (
                <div className={styles.field}><label>Background color</label>
                  <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              )}
            </>
          )}
        </div>
      ))}

      <div className={styles.row}>
        {BLOCK_TYPES.map((t) => (
          <button type="button" key={t} className={`${styles.button} ${styles.secondary}`} onClick={() => add(t)}>
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}
