"use client";
import { useId, useState } from "react";
import styles from "@/components/admin/admin.module.scss";
import { SortableItem, SortableList } from "./Sortable";

/**
 * Chip input: type and press Enter or comma to add, Backspace on an empty field removes the
 * last chip, drag chips to reorder. Duplicates are ignored (case-insensitively).
 */
export default function TagsInput({
  value, onChange, placeholder = "Type and press Enter", suggestions = [], lowercase = false, label,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  lowercase?: boolean;
  label?: string;
}) {
  const [text, setText] = useState("");
  const listId = useId();

  function commit(raw: string) {
    const parts = raw.split(",").map((s) => (lowercase ? s.trim().toLowerCase() : s.trim())).filter(Boolean);
    if (!parts.length) return;
    const seen = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    for (const p of parts) {
      if (!seen.has(p.toLowerCase())) {
        seen.add(p.toLowerCase());
        next.push(p);
      }
    }
    if (next.length !== value.length) onChange(next);
    setText("");
  }

  const available = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div className={styles.chips} onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
      <SortableList
        ids={value.map((_, i) => `t${i}`)} layout="horizontal"
        onReorder={(ids) => onChange(ids.map((id) => value[Number(id.slice(1))]))}
      >
        {value.map((tag, i) => (
          <SortableItem key={`t${i}`} id={`t${i}`} as="span">
            {(handle) => (
              <span className={styles.tagChip}>
                <span className={styles.tagGrip} {...handle} aria-label={`Drag ${tag}`}>{tag}</span>
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={(e) => { e.stopPropagation(); onChange(value.filter((_, j) => j !== i)); }}
                >×</button>
              </span>
            )}
          </SortableItem>
        ))}
      </SortableList>
      <input
        className={styles.chipsInput}
        aria-label={label ?? placeholder}
        value={text}
        placeholder={value.length ? "Add" : placeholder}
        list={available.length ? listId : undefined}
        onChange={(e) => (e.target.value.includes(",") ? commit(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(text); }
          else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") commit(text);
          else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => commit(text)}
      />
      {available.length > 0 && <datalist id={listId}>{available.map((s) => <option key={s} value={s} />)}</datalist>}
    </div>
  );
}
