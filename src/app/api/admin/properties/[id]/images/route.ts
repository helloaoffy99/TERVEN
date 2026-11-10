import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/admin-validation";

type Context = { params: Promise<{ id: string }> };
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
function matchesMagic(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 4).every((v, i) => v === [137, 80, 78, 71][i]);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}
export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await context.params;
  const { data: property } = await admin.client.from("properties").select("id,slug").eq("id", id).single();
  if (!property) return NextResponse.json({ error: "ไม่พบประกาศ" }, { status: 404 });
  const form = await request.formData(); const file = form.get("image");
  if (!(file instanceof File) || !extensions[file.type] || file.size === 0 || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "รองรับ JPG, PNG, WebP ขนาดไม่เกิน 10 MB" }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesMagic(bytes, file.type)) return NextResponse.json({ error: "ไฟล์ภาพไม่ถูกต้อง" }, { status: 400 });
  const path = `${id}/${randomUUID()}.${extensions[file.type]}`;
  const { error: uploadError } = await admin.client.storage.from("property-images").upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "อัปโหลดภาพไม่สำเร็จ" }, { status: 500 });
  const { count } = await admin.client.from("property_images").select("id", { count: "exact", head: true }).eq("property_id", id);
  const { data: image, error } = await admin.client.from("property_images").insert({ property_id: id, storage_path: path, alt_text: file.name.slice(0, 160), sort_order: count ?? 0, is_cover: !count }).select("*").single();
  if (error) { await admin.client.storage.from("property-images").remove([path]); return NextResponse.json({ error: "บันทึกข้อมูลภาพไม่สำเร็จ" }, { status: 500 }); }
  revalidatePath(`/properties/${property.slug}`); revalidatePath("/properties"); revalidatePath("/");
  return NextResponse.json(image, { status: 201 });
}
