"use client";
import { useState } from "react";
import type { CvContent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";

export default function CvEditor({ initial }: { initial: CvContent }) {
  const [text, setText] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState("");

  async function save() {
    let parsed: CvContent;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      return;
    }
    setError("");
    const res = await fetch("/api/admin/cv", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed),
    });
    if (res.ok) alert("CV saved");
    else setError("Save failed");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>CV</h1>
            <p className={styles.sub}>Edit the CV as JSON</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} onClick={save}>Save CV</button>
          </div>
        </div>
      </div>
      <p className={styles.help} style={{ marginBottom: 12 }}>
        Keys: topSkills, personalInfo, summary, experience[], stack, languages[], education[].
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%", minHeight: "60vh", fontFamily: "var(--font-mono, monospace)", fontSize: 13,
          lineHeight: 1.6, background: "var(--field)", color: "var(--ink)", border: 0, borderRadius: 14, padding: 16,
        }}
      />
      {error && <p className={styles.error} style={{ marginTop: 12 }}>{error}</p>}
    </div>
  );
}
