import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin-auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { AdminLogin } from "@/components/admin-login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "เข้าสู่ระบบผู้ดูแล | TERVÉN", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <main className="admin-auth-page"><div className="admin-auth-card"><span className="section-kicker">TERVÉN ADMIN</span><h1>เข้าสู่ระบบผู้ดูแล</h1>{supabaseConfig() ? <AdminLogin /> : <p role="status">ยังไม่ได้ตั้งค่า Supabase โปรดใส่ค่าใน .env.local ตาม README แล้วรีสตาร์ตเซิร์ฟเวอร์</p>}</div></main>;
}
