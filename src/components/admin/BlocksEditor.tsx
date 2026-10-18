"use client";
import { useEffect, useRef, useState } from "react";
import type { CaseStudyBlock } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import ImageListEditor from "./ImageListEditor";
import { SortableItem, SortableList } from "./Sortable";
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

function summary(b: CaseStudyBlock): string {
  switch (b.type) {
    case "section": return b.title || b.content.slice(0, 60) || "Empty section";
    case "image": return b.caption || b.url.split("/").pop() || "No image yet";
    case "video": return b.caption || b.url.split("/").pop() || "No video yet";
    case "gallery":
    case "screens-grid": return `${b.images.length} image${b.images.length === 1 ? "" : "s"}`;
    case "testimonial": return b.author ? `${b.author}: ${b.quote.slice(0, 40)}` : b.quote.slice(0, 60) || "Empty quote";
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
  // Blocks have no ids of their own; keep parallel client keys so reorder keeps each block's open state.
  const counter = useRef(0);
  const newKey = () => `b${++counter.current}`;
  const [keys, setKeys] = useState<string[]>(() => blocks.map(newKey));
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (keys.length !== blocks.length) setKeys(blocks.map((_, i) => keys[i] ?? newKey()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length]);
  const ks = keys.length === blocks.length ? keys : blocks.map((_, i) => keys[i] ?? `tmp${i}`);

  const toggle = (k: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (!n.delete(k)) n.add(k);
      return n;
    });
  const update = (i: number, patch: Partial<CaseStudyBlock>) =>
    onChange(blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as CaseStudyBlock) : b)));
  const remove = (i: number) => {
    setKeys(ks.filter((_, j) => j !== i));
    onChange(blocks.filter((_, j) => j !== i));
  };
  const duplicate = (i: number) => {
    const k = newKey();
    setKeys([...ks.slice(0, i + 1), k, ...ks.slice(i + 1)]);
    onChange([...blocks.slice(0, i + 1), structuredClone(blocks[i]), ...blocks.slice(i + 1)]);
    setOpen((s) => new Set(s).add(k));
  };
  const add = (type: CaseStudyBlock["type"]) => {
    const k = newKey();
    setKeys([...ks, k]);
    onChange([...blocks, emptyBlock(type)]);
    setOpen((s) => new Set(s).add(k));
  };
  const reorder = (ids: string[]) => {
    setKeys(ids);
    onChange(ids.map((k) => blocks[ks.indexOf(k)]));
  };

  function fields(b: CaseStudyBlock, i: number) {
    return (
      <>
        {b.type === "section" && (
          <>
            <div className={styles.field}><label>Title</label>
              <input value={b.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} /></div>
            <div className={styles.field}><label>Content</label>
              <textarea rows={4} value={b.content} onChange={(e) => update(i, { content: e.target.value })} /></div>
            <div className={styles.grid2}>
              <div className={styles.field}><label>Background color</label>
                <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              <div className={styles.field}><label>Title color</label>
                <select value={b.titleColor ?? ""} onChange={(e) => update(i, { titleColor: (e.target.value || undefined) as any })}>
                  <option value="">default</option><option value="primary">primary</option><option value="contrast">contrast</option>
                </select></div>
            </div>
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
            <div className={styles.grid2}>
              <div className={styles.field}><label>Author</label>
                <input value={b.author} onChange={(e) => update(i, { author: e.target.value })} /></div>
              <div className={styles.field}><label>Position</label>
                <input value={b.position} onChange={(e) => update(i, { position: e.target.value })} /></div>
            </div>
          </>
        )}

        {(b.type === "gallery" || b.type === "screens-grid") && (
          <>
            <ImageListEditor values={b.images} slug={slug} onChange={(imgs) => update(i, { images: imgs })} />
            <div className={styles.grid2}>
              <div className={styles.field}><label>Columns</label>
                <input type="number" value={b.columns ?? ""} onChange={(e) => update(i, { columns: Number(e.target.value) as any })} /></div>
              {b.type === "screens-grid" && (
                <div className={styles.field}><label>Background color</label>
                  <input value={b.bgColor ?? ""} onChange={(e) => update(i, { bgColor: e.target.value })} /></div>
              )}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div>
      {blocks.length > 0 && (
        <div className={styles.blockTools}>
          <span className={styles.help}>{blocks.length} block{blocks.length === 1 ? "" : "s"}. Drag to reorder, click a row to edit.</span>
          <button type="button" className={`${styles.button} ${styles.ghost} ${styles.sm}`} onClick={() => setOpen(open.size ? new Set() : new Set(ks))}>
            {open.size ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}
      <SortableList ids={ks} onReorder={reorder}>
        {blocks.map((b, i) => {
          const k = ks[i];
          const isOpen = open.has(k);
          return (
            <SortableItem key={k} id={k}>
              {(handle) => (
                <div className={`${styles.brow} ${isOpen ? styles.browOpen : ""}`}>
                  <div className={styles.browHead}>
                    <button type="button" className={styles.bgrip} aria-label="Drag block" {...handle}>⋮⋮</button>
                    <button type="button" className={styles.browMain} aria-expanded={isOpen} onClick={() => toggle(k)}>
                      <span className={styles.kind}>{b.type}</span>
                      <span className={styles.browText}>{summary(b)}</span>
                    </button>
                    <button type="button" className={styles.blockBtn} onClick={() => duplicate(i)} aria-label="Duplicate block" title="Duplicate">⧉</button>
                    <button type="button" className={`${styles.blockBtn} ${styles.del}`} onClick={() => remove(i)} aria-label="Delete block" title="Delete">✕</button>
                    <button type="button" className={styles.blockBtn} onClick={() => toggle(k)} aria-label={isOpen ? "Collapse" : "Expand"}>{isOpen ? "▴" : "▾"}</button>
                  </div>
                  {isOpen && <div className={styles.browBody}>{fields(b, i)}</div>}
                </div>
              )}
            </SortableItem>
          );
        })}
      </SortableList>

      <div className={styles.addrow}>
        <span className={styles.addLbl}>Add block</span>
        {BLOCK_TYPES.map((t) => (
          <button type="button" key={t} className={styles.chip} onClick={() => add(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
