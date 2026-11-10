"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const client = createBrowserSupabaseClient();
    const result = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (result.error) { setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัญชี"); setBusy(false); return; }
    const role = await client.from("admin_users").select("role").eq("user_id", result.data.user.id).maybeSingle();
    if (!role.data || !["owner", "editor"].includes(role.data.role)) {
      await client.auth.signOut(); setError("บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลเว็บไซต์"); setBusy(false); return;
    }
    router.replace("/admin"); router.refresh();
  }
  return <form className="admin-form" onSubmit={submit}><label>อีเมล<input type="email" name="email" required autoComplete="username" /></label><label>รหัสผ่าน<input type="password" name="password" required autoComplete="current-password" /></label>{error && <p className="field-error" role="alert">{error}</p>}<button type="submit" disabled={busy}>{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button></form>;
}
