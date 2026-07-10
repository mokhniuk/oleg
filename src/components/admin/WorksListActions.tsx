"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function WorksListActions({ id }: { id: number }) {
  const router = useRouter();
  async function del() {
    if (!confirm("Delete this work?")) return;
    const res = await fetch(`/api/admin/works/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Delete failed");
  }
  return (
    <button type="button" className={styles.del} onClick={del} aria-label="Delete work">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
    </button>
  );
}
