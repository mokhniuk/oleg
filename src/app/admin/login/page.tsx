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
    <form className={styles.login} onSubmit={submit}>
      <h1>Admin</h1>
      <div className={styles.field}>
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit">Log in</button>
    </form>
  );
}
