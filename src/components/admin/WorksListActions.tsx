"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import { useExclusive } from "./useExclusive";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, StarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

type Props = { id: number; ids: number[]; show: boolean; featured: boolean };

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
        <ChevronLeftIcon />
      </button>
      <button type="button" disabled={busy || index < 0 || index >= ids.length - 1} onClick={() => move(1)} aria-label="Move later" title="Move later">
        <ChevronRightIcon />
      </button>
      <button type="button" disabled={busy} onClick={() => flag({ show: !show }, show ? "Work hidden" : "Work shown")} aria-label={show ? "Hide work" : "Show work"} title={show ? "Hide" : "Show"}>
        {show ? <EyeIcon /> : <EyeSlashIcon />}
      </button>
      <button type="button" disabled={busy} onClick={() => flag({ featured: !featured }, featured ? "Removed from featured" : "Marked featured")} aria-label={featured ? "Unfeature work" : "Feature work"} title={featured ? "Unfeature" : "Feature"}>
        {featured ? <StarSolid /> : <StarIcon />}
      </button>
      <button type="button" className={styles.del} disabled={busy} onClick={del} aria-label="Delete work" title="Delete">
        <TrashIcon />
      </button>
    </>
  );
}
