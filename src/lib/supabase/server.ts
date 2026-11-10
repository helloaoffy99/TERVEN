import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  const config = supabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(items) {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot set cookies; middleware refreshes them. */ }
      },
    },
  });
}

export function createPrivateSupabaseClient() {
  const config = supabaseConfig();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!config || !key) return null;
  return createClient(config.url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
