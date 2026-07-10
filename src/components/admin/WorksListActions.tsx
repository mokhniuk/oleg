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
    <button className={`${styles.button} ${styles.danger}`} onClick={del}>Delete</button>
  );
}
