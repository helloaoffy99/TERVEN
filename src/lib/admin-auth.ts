import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const client = await createServerSupabaseClient();
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: admin, error: roleError } = await client.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (roleError || !admin || !["owner", "editor"].includes(admin.role)) return null;
  return { client, user, role: admin.role as "owner" | "editor" };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
