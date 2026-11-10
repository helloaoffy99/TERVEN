import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/admin-validation";

type Context = { params: Promise<{ imageId: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { imageId } = await context.params;
  let body: { action?: string; other_id?: string; alt_text?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  const { data: image } = await admin.client.from("property_images").select("property_id").eq("id", imageId).single();
  if (!image) return NextResponse.json({ error: "ไม่พบภาพ" }, { status: 404 });
  if (body.action === "cover") {
    const clear = await admin.client.from("property_images").update({ is_cover: false }).eq("property_id", image.property_id).eq("is_cover", true);
    if (clear.error) return NextResponse.json({ error: "เปลี่ยนภาพปกไม่สำเร็จ" }, { status: 500 });
    const set = await admin.client.from("property_images").update({ is_cover: true }).eq("id", imageId);
    if (set.error) return NextResponse.json({ error: "เปลี่ยนภาพปกไม่สำเร็จ" }, { status: 500 });
  } else if (body.action === "swap" && typeof body.other_id === "string") {
    const updated = await admin.client.rpc("swap_property_images", { p_first: imageId, p_second: body.other_id });
    if (updated.error || !updated.data) return NextResponse.json({ error: "จัดลำดับไม่สำเร็จ" }, { status: 500 });
  } else if (body.action === "alt" && typeof body.alt_text === "string" && body.alt_text.length <= 160) {
    const updated = await admin.client.from("property_images").update({ alt_text: body.alt_text }).eq("id", imageId);
    if (updated.error) return NextResponse.json({ error: "บันทึกคำบรรยายไม่สำเร็จ" }, { status: 500 });
  } else return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  const { data: property } = await admin.client.from("properties").select("slug").eq("id", image.property_id).single();
  if (property) revalidatePath(`/properties/${property.slug}`); revalidatePath("/properties"); revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { imageId } = await context.params;
  const { data: image } = await admin.client.from("property_images").select("property_id,storage_path,is_cover").eq("id", imageId).single();
  if (!image) return NextResponse.json({ error: "ไม่พบภาพ" }, { status: 404 });
  const deleted = await admin.client.from("property_images").delete().eq("id", imageId);
  if (deleted.error) return NextResponse.json({ error: "ลบข้อมูลภาพไม่สำเร็จ" }, { status: 500 });
  const removed = await admin.client.storage.from("property-images").remove([image.storage_path]);
  if (image.is_cover) {
    const { data: next } = await admin.client.from("property_images").select("id").eq("property_id", image.property_id).order("sort_order").limit(1).maybeSingle();
    if (next) await admin.client.from("property_images").update({ is_cover: true }).eq("id", next.id);
  }
  const { data: property } = await admin.client.from("properties").select("slug").eq("id", image.property_id).single();
  if (property) revalidatePath(`/properties/${property.slug}`); revalidatePath("/properties"); revalidatePath("/");
  return NextResponse.json({ ok: true, warning: removed.error ? "ลบรายการภาพแล้ว แต่มีไฟล์ค้างใน Storage" : null });
}
