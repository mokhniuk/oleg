"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "./Feedback";

/** Stable JSON with empty values dropped, so typing and clearing a field is not a change. */
function normalize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) {
      const n = normalize((v as Record<string, unknown>)[k]);
      const empty = n === undefined || n === null || n === "" || (typeof n === "object" && !Array.isArray(n) && !Object.keys(n as object).length);
      if (!empty) out[k] = n;
    }
    return out;
  }
  return v;
}
const snapshot = (v: unknown) => JSON.stringify(normalize(v));

/**
 * Tracks whether `value` differs from the last saved snapshot and guards the edit:
 * browser "leave site?" prompt on reload/close, a confirm dialog when clicking an in-app link,
 * and Cmd/Ctrl+S to save. Browser back/forward is not intercepted (App Router has no hook for it).
 */
export function useDirtyForm<T>(value: T, onSave: () => void | Promise<void>) {
  const router = useRouter();
  const { confirm } = useFeedback();
  const [saved, setSaved] = useState<{ raw: T; snap: string }>(() => ({ raw: structuredClone(value), snap: snapshot(value) }));
  const dirty = snapshot(value) !== saved.snap;

  const save = useRef(onSave);
  save.current = onSave;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const running = useRef(false);

  /** Save once at a time (Cmd+S held down or pressed twice must not fire overlapping requests). */
  const runSave = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      await save.current();
    } finally {
      running.current = false;
    }
  }, []);

  const markSaved = useCallback((v: T) => setSaved({ raw: structuredClone(v), snap: snapshot(v) }), []);
  const revert = useCallback(() => structuredClone(saved.raw), [saved]);
  const baseline = useMemo(() => saved.raw, [saved]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        // let inputs commit pending text (e.g. a half-typed chip) and React re-render first
        setTimeout(() => { if (dirtyRef.current) void runSave(); }, 0);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.origin !== location.origin || (a.pathname === location.pathname && a.search === location.search)) return;
      e.preventDefault();
      e.stopPropagation();
      void confirm({
        title: "Leave without saving?",
        message: "You have unsaved changes on this page.",
        confirmLabel: "Leave",
        danger: true,
      }).then((ok) => {
        if (ok) {
          dirtyRef.current = false;
          router.push(a.pathname + a.search + a.hash);
        }
      });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [confirm, router, runSave]);

  return { dirty, baseline, markSaved, revert, runSave };
}
