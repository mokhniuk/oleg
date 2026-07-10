"use client";
import { useState } from "react";
import styles from "@/components/admin/admin.module.scss";

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
  async function upload(file: File) {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug || "misc");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setBusy(false);
    if (res.ok) onChange((await res.json()).path);
    else alert("Upload failed");
  }
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.row}>
        {value && <img src={value} alt="" className={styles.thumb} />}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="/projects/slug/image.webp" />
    </div>
  );
}
