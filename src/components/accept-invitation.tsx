"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AcceptInvitation() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "code" | "ready" | "done">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const query = new URLSearchParams(window.location.search);
        // Remove one-time credentials from the visible URL before making requests.
        window.history.replaceState(null, "", "/auth/accept");
        const client = createBrowserSupabaseClient();
        if (fragment.has("error")) {
          if (active) setLinkExpired(true);
          throw new Error("invite_error");
        }
        if (fragment.has("access_token") && fragment.has("refresh_token")) {
          const { error: sessionError } = await client.auth.setSession({
            access_token: fragment.get("access_token")!,
            refresh_token: fragment.get("refresh_token")!,
          });
          if (sessionError) throw sessionError;
        } else if (query.has("token_hash") && query.get("type") === "invite") {
          const { error: verifyError } = await client.auth.verifyOtp({ token_hash: query.get("token_hash")!, type: "invite" });
          if (verifyError) throw verifyError;
        } else if (query.has("code")) {
          const { data: existing } = await client.auth.getSession();
          if (!existing.session) {
            const { error: exchangeError } = await client.auth.exchangeCodeForSession(query.get("code")!);
            if (exchangeError) throw exchangeError;
          }
        }
        const { data, error: userError } = await client.auth.getUser();
        if (userError || !data.user) throw userError || new Error("no_user");
        if (active) setStatus("ready");
      } catch {
        if (active) setStatus("code");
      }
    }
    void prepare();
    return () => { active = false; };
  }, []);

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const token = String(form.get("token") || "").trim();
    if (!email || !/^\d{6}$/.test(token)) {
      setError("กรุณากรอกอีเมลและรหัส 6 หลักจากอีเมลฉบับล่าสุด");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const client = createBrowserSupabaseClient();
      const { data, error: verifyError } = await client.auth.verifyOtp({ email, token, type: "recovery" });
      if (verifyError || !data.user || !data.session) throw verifyError || new Error("no_session");
      setStatus("ready");
    } catch {
      setError("รหัสไม่ถูกต้องหรือหมดอายุ กรุณาใช้รหัสจากอีเมลรีเซ็ตรหัสผ่านฉบับล่าสุด");
    } finally {
      setBusy(false);
    }
  }

  async function setPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password.length < 12) { setError("รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร"); return; }
    if (password !== form.get("confirm")) { setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน"); return; }
    setBusy(true); setError("");
    const client = createBrowserSupabaseClient();
    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) { setError("ตั้งรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง"); setBusy(false); return; }
    await client.auth.signOut();
    setStatus("done");
    router.refresh();
  }

  if (status === "loading") return <p role="status">กำลังตรวจสอบข้อมูล…</p>;
  if (status === "code") return <form className="admin-form" onSubmit={verifyCode}>
    <p>{linkExpired ? "ลิงก์เดิมหมดอายุแล้ว กรุณาใช้รหัส 6 หลักจากอีเมลรีเซ็ตรหัสผ่านฉบับล่าสุด" : "กรอกอีเมลและรหัส 6 หลักจากอีเมลรีเซ็ตรหัสผ่านฉบับล่าสุด"}</p>
    <label>อีเมลผู้ดูแล<input type="email" name="email" required autoComplete="email" /></label>
    <label>รหัส 6 หลัก<input type="text" name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" /></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "กำลังตรวจสอบ…" : "ยืนยันรหัส"}</button>
  </form>;
  if (status === "done") return <p role="status">ตั้งรหัสผ่านเรียบร้อยแล้ว <a href="/admin/login">เข้าสู่ระบบผู้ดูแล</a></p>;
  return <form className="admin-form" onSubmit={setPassword}>
    <p>กรอกรหัสผ่านใหม่สำหรับบัญชีผู้ดูแล TERVÉN</p>
    <label>รหัสผ่านใหม่<input type="password" name="password" minLength={12} required autoComplete="new-password" /></label>
    <label>ยืนยันรหัสผ่าน<input type="password" name="confirm" minLength={12} required autoComplete="new-password" /></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "กำลังบันทึก…" : "ตั้งรหัสผ่าน"}</button>
  </form>;
}
