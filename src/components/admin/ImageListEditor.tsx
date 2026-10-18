"use client";
import ImageUploader from "./ImageUploader";
import styles from "@/components/admin/admin.module.scss";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ImageListEditor({
  values,
  slug,
  onChange,
  label = "Images",
}: {
  values: string[];
  slug: string;
  onChange: (paths: string[]) => void;
  label?: string;
}) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= values.length) return;
    const copy = [...values];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <div className={styles.block}>
      <div className={styles.blockHead}><strong>{label}</strong></div>
      {values.map((v, i) => (
        <div key={i} className={styles.row}>
          <ImageUploader value={v} slug={slug} onChange={(p) => set(i, p)} label={`#${i + 1}`} />
          <button type="button" className={styles.button} onClick={() => move(i, -1)} aria-label="Move up" title="Move up"><ArrowUpIcon /></button>
          <button type="button" className={styles.button} onClick={() => move(i, 1)} aria-label="Move down" title="Move down"><ArrowDownIcon /></button>
          <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => remove(i)} aria-label="Remove image" title="Remove"><TrashIcon /></button>
        </div>
      ))}
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => onChange([...values, ""])}>
        + Add image
      </button>
    </div>
  );
}
