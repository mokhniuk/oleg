"use client";
import { useState } from "react";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";

export default function ImageUploader({
  value,
  slug,
  onChange,
  label = "Image",
}: {
  value?: string;
  slug: string;
  onChange: (path: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();
  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) return toast(await apiError(res, "Upload failed"), "error");
      onChange((await res.json()).path);
      toast("Image uploaded");
    } catch {
      toast("Network error, upload failed", "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.row}>
        {value && <img src={value} alt="" className={styles.thumb} />}
        <input
          type="file"
          accept="image/*"
          disabled={busy || !slug}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      {!slug && <span className={styles.help}>Set a slug first to enable uploads.</span>}
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="/projects/slug/image.webp" />
    </div>
  );
}
