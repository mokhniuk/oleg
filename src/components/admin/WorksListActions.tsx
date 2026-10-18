"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import { useExclusive } from "./useExclusive";

type Props = { id: number; ids: number[]; show: boolean; featured: boolean };

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function WorksListActions({ id, ids, show, featured }: Props) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const { busy, exclusive } = useExclusive();
  const index = ids.indexOf(id);

  // ids is the list as rendered; a second click before the refresh lands would reuse stale ids
  const call = (url: string, init: RequestInit, failed: string, done?: string) =>
    exclusive(() => request(url, init, failed, done));
  async function request(url: string, init: RequestInit, failed: string, done?: string) {
    try {
      const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
      if (!res.ok) return toast(await apiError(res, failed), "error");
      if (done) toast(done);
      router.refresh();
    } catch {
      toast(`Network error: ${failed.toLowerCase()}`, "error");
    }
  }

  function move(delta: -1 | 1) {
    const next = [...ids];
    const [moved] = next.splice(index, 1);
    next.splice(index + delta, 0, moved);
    return call("/api/admin/works/reorder", { method: "POST", body: JSON.stringify({ ids: next }) }, "Reorder failed");
  }
  const flag = (patch: object, done: string) =>
    call(`/api/admin/works/${id}/flags`, { method: "PATCH", body: JSON.stringify(patch) }, "Update failed", done);

  async function del() {
    if (!(await confirm({ title: "Delete this work?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    await call(`/api/admin/works/${id}`, { method: "DELETE" }, "Delete failed", "Work deleted");
  }

  return (
    <>
      <button type="button" disabled={busy || index <= 0} onClick={() => move(-1)} aria-label="Move earlier" title="Move earlier">
        <svg viewBox="0 0 24 24" {...icon}><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button type="button" disabled={busy || index < 0 || index >= ids.length - 1} onClick={() => move(1)} aria-label="Move later" title="Move later">
        <svg viewBox="0 0 24 24" {...icon}><path d="M9 18l6-6-6-6" /></svg>
      </button>
      <button type="button" disabled={busy} onClick={() => flag({ show: !show }, show ? "Work hidden" : "Work shown")} aria-label={show ? "Hide work" : "Show work"} title={show ? "Hide" : "Show"}>
        {show ? (
          <svg viewBox="0 0 24 24" {...icon}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" {...icon}><path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" /></svg>
        )}
      </button>
      <button type="button" disabled={busy} onClick={() => flag({ featured: !featured }, featured ? "Removed from featured" : "Marked featured")} aria-label={featured ? "Unfeature work" : "Feature work"} title={featured ? "Unfeature" : "Feature"}>
        <svg viewBox="0 0 24 24" {...icon} fill={featured ? "currentColor" : "none"}><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" /></svg>
      </button>
      <button type="button" className={styles.del} disabled={busy} onClick={del} aria-label="Delete work" title="Delete">
        <svg viewBox="0 0 24 24" {...icon}>
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </>
  );
}
