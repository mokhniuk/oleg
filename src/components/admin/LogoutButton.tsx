"use client";
import { useRouter } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";
import { useFeedback } from "./Feedback";

export default function LogoutButton() {
  const router = useRouter();
  const { toast } = useFeedback();
  async function logout() {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) return toast("Logout failed", "error");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast("Network error, still logged in", "error");
    }
  }
  return (
    <button className={styles.logout} onClick={logout}>
      Log out
    </button>
  );
}
