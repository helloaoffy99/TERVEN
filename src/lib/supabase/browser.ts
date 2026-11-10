"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export function createBrowserSupabaseClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  return createBrowserClient(config.url, config.key);
}
