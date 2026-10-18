"use client";
import { useEffect, useRef, useState } from "react";
import { Bars2Icon, ChevronDownIcon, ChevronUpIcon, DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SortableItem, SortableList } from "./Sortable";
import styles from "@/components/admin/admin.module.scss";

/**
 * Collapsible, draggable list of structured entries (CV roles, riders, ...).
 * Rows start collapsed; click a row to edit its fields.
 */
export default function RowList<T extends object>({
  items, onChange, create, title, meta, render, addLabel, emptyText,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  title: (item: T, index: number) => string;
  meta?: (item: T) => string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel: string;
  emptyText?: string;
}) {
  // entries have no ids of their own; keep parallel client keys so reorder keeps each row's open state
  const counter = useRef(0);
  const newKey = () => `r${++counter.current}`;
  const [keys, setKeys] = useState<string[]>(() => items.map(newKey));
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (keys.length !== items.length) setKeys(items.map((_, i) => keys[i] ?? newKey()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);
  const ks = keys.length === items.length ? keys : items.map((_, i) => keys[i] ?? `tmp${i}`);

  const toggle = (k: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (!n.delete(k)) n.add(k);
      return n;
    });
  const update = (i: number, patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => {
    setKeys(ks.filter((_, j) => j !== i));
    onChange(items.filter((_, j) => j !== i));
  };
  const duplicate = (i: number) => {
    const k = newKey();
    setKeys([...ks.slice(0, i + 1), k, ...ks.slice(i + 1)]);
    onChange([...items.slice(0, i + 1), structuredClone(items[i]), ...items.slice(i + 1)]);
    setOpen((s) => new Set(s).add(k));
  };
  const add = () => {
    const k = newKey();
    setKeys([...ks, k]);
    onChange([...items, create()]);
    setOpen((s) => new Set(s).add(k));
  };
  const reorder = (ids: string[]) => {
    setKeys(ids);
    onChange(ids.map((k) => items[ks.indexOf(k)]));
  };

  return (
    <div>
      {items.length > 1 && (
        <div className={styles.blockTools}>
          <span className={styles.help}>Drag to reorder, click a row to edit.</span>
          <button type="button" className={`${styles.button} ${styles.ghost} ${styles.sm}`} onClick={() => setOpen(open.size ? new Set() : new Set(ks))}>
            {open.size ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}
      {items.length === 0 && emptyText && <p className={styles.empty} style={{ padding: "8px 0 16px" }}>{emptyText}</p>}
      <SortableList ids={ks} onReorder={reorder}>
        {items.map((item, i) => {
          const k = ks[i];
          const isOpen = open.has(k);
          const m = meta?.(item);
          return (
            <SortableItem key={k} id={k}>
              {(handle) => (
                <div className={`${styles.brow} ${isOpen ? styles.browOpen : ""}`}>
                  <div className={styles.browHead}>
                    <button type="button" className={styles.bgrip} aria-label="Drag to reorder" {...handle}><Bars2Icon /></button>
                    <button type="button" className={styles.browMain} aria-expanded={isOpen} onClick={() => toggle(k)}>
                      <span className={styles.browText}>{title(item, i) || <span className={styles.help}>Untitled</span>}</span>
                      {m && <span className={styles.browMeta}>{m}</span>}
                    </button>
                    <button type="button" className={styles.blockBtn} onClick={() => duplicate(i)} aria-label="Duplicate" title="Duplicate"><DocumentDuplicateIcon /></button>
                    <button type="button" className={`${styles.blockBtn} ${styles.del}`} onClick={() => remove(i)} aria-label="Delete" title="Delete"><TrashIcon /></button>
                    <button type="button" className={styles.blockBtn} onClick={() => toggle(k)} aria-label={isOpen ? "Collapse" : "Expand"}>
                      {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>
                  {isOpen && <div className={styles.browBody}>{render(item, (patch) => update(i, patch), i)}</div>}
                </div>
              )}
            </SortableItem>
          );
        })}
      </SortableList>
      <div className={styles.addrow}>
        <button type="button" className={styles.chip} onClick={add}>+ {addLabel}</button>
      </div>
    </div>
  );
}
