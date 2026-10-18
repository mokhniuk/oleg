"use client";
import styles from "@/components/admin/admin.module.scss";

/** Floating bar shown while a form has unsaved changes. */
export default function SaveBar({
  dirty, saving, onSave, onDiscard, label = "Save",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  label?: string;
}) {
  if (!dirty && !saving) return null;
  return (
    <div className={styles.savebar} role="region" aria-label="Unsaved changes">
      <span>{saving ? "Saving…" : "Unsaved changes"}</span>
      <button type="button" className={`${styles.button} ${styles.ghost}`} disabled={saving} onClick={onDiscard}>Discard</button>
      <button type="button" className={styles.button} disabled={saving} onClick={onSave}>
        {label} <kbd>⌘S</kbd>
      </button>
    </div>
  );
}
