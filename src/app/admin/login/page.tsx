"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin");
    else setError("Invalid password");
  }

  return (
    <div className={styles.auth}>
      <form className={styles.authbox} onSubmit={submit}>
        <h1>Sign in.</h1>
        <p className={styles.authSub}>Manage works, projects, events and your CV.</p>
        <div className={styles.field}>
          <label htmlFor="pw">Password</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.button}
          type="submit"
          style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: 14 }}
        >
          Log in
        </button>
      </form>
    </div>
  );
}
