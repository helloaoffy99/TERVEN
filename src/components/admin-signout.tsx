"use client";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
export function AdminSignOut() {
  const router = useRouter();
  return <button className="admin-signout" onClick={async () => { await createBrowserSupabaseClient().auth.signOut(); router.replace("/admin/login"); router.refresh(); }}>ออกจากระบบ</button>;
}
