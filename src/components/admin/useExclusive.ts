"use client";
import { useRef, useState } from "react";

/**
 * Runs one async action at a time. While one is in flight, further calls are ignored and
 * `busy` is true (use it to disable buttons), so rows can't be saved twice, moved or deleted
 * while a create is still waiting for its new id.
 */
export function useExclusive() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  async function exclusive(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, exclusive };
}
