import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { propertyTypes } from "@/data/properties";
import { sameOrigin } from "@/lib/admin-validation";
import { createPrivateSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  contactName: z.string().trim().min(2).max(120), phone: z.string().regex(/^0\d{8,9}$/),
  lineId: z.string().trim().max(100).optional(), propertyType: z.enum(propertyTypes),
  province: z.string().trim().min(1).max(100), district: z.string().trim().min(1).max(100),
  subdistrict: z.string().trim().max(100).optional(), landAreaSqm: z.number().positive().max(9999999999),
  askingPrice: z.number().positive().max(9999999999999), description: z.string().trim().max(5000).optional(),
  consent: z.literal(true), website: z.string().max(0).optional(),
});
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  if (process.env.SUBMISSIONS_ENABLED !== "true" || !process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL) return NextResponse.json({ error: "ระบบรับฝากขายยังไม่เปิดใช้งาน" }, { status: 503 });
  const client = createPrivateSupabaseClient(); const secret = process.env.SUBMISSION_RATE_LIMIT_SECRET;
  if (!client || !secret || secret.length < 32) return NextResponse.json({ error: "ระบบยังตั้งค่าไม่ครบ" }, { status: 503 });
  if (Number(request.headers.get("content-length") ?? 0) > 15000) return NextResponse.json({ error: "ข้อมูลมีขนาดใหญ่เกินไป" }, { status: 413 });
  let body: unknown;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error("empty");
    const decoder = new TextDecoder(); let text = ""; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 15000) { await reader.cancel(); return NextResponse.json({ error: "ข้อมูลมีขนาดใหญ่เกินไป" }, { status: 413 }); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "กรุณาตรวจสอบข้อมูลที่กรอก" }, { status: 400 });
  const input = parsed.data;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const hash = (value: string) => createHmac("sha256", secret).update(value).digest("hex");
  const { data: allowed, error: limitError } = await client.rpc("claim_submission_slot", { p_hash: hash(`ip:${ip}`) });
  if (limitError) return NextResponse.json({ error: "ระบบรับข้อมูลขัดข้อง" }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: "ส่งข้อมูลบ่อยเกินไป กรุณารอ 1 ชั่วโมง" }, { status: 429 });
  const dedupeKey = hash(`phone:${input.phone}:${new Date().toISOString().slice(0, 10)}`);
  const { error } = await client.from("property_submissions").insert({
    contact_name: input.contactName, phone: input.phone, line_id: input.lineId || null,
    property_type: input.propertyType, province: input.province, district: input.district,
    subdistrict: input.subdistrict || null, land_area_sqm: input.landAreaSqm,
    asking_price: input.askingPrice, description: input.description || null,
    consent_at: new Date().toISOString(), status: "new", dedupe_key: dedupeKey,
  });
  if (error?.code === "23505") return NextResponse.json({ error: "ได้รับคำขอจากเบอร์นี้แล้ว กรุณารอการติดต่อกลับ" }, { status: 409 });
  if (error) return NextResponse.json({ error: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
