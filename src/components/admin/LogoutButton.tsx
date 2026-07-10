"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }
  return (
    <button className={`${styles.button} ${styles.secondary}`} onClick={logout}>
      Log out
    </button>
  );
}
