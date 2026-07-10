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
    <div>
      <h1>CV</h1>
      <p>Edit the CV JSON. Keys: topSkills, personalInfo, summary, experience[], stack, languages[], education[].</p>
      <textarea style={{ width: "100%", minHeight: "60vh", fontFamily: "monospace" }}
        value={text} onChange={(e) => setText(e.target.value)} />
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} onClick={save}>Save</button>
    </div>
  );
}
