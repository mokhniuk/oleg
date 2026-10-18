"use client";
import styles from "@/components/admin/admin.module.scss";

export type TabDef<Id extends string> = { id: Id; label: string; count?: number; dirty?: boolean };

/** Accessible tab strip (arrow keys move between tabs). Panels are rendered by the caller. */
export default function Tabs<Id extends string>({
  tabs, active, onChange, label = "Sections",
}: {
  tabs: TabDef<Id>[];
  active: Id;
  onChange: (id: Id) => void;
  label?: string;
}) {
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length].id;
    onChange(t);
    document.getElementById(`tab-${t}`)?.focus();
  };
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`} tabIndex={active === t.id ? 0 : -1}
          onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
          {t.count !== undefined && <span className={styles.tabCount}>{t.count}</span>}
          {t.dirty && <span className={styles.tabDot} title="Unsaved changes" />}
        </button>
      ))}
    </div>
  );
}
