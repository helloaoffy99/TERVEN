import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin-auth";
import { propertyInputSchema, sameOrigin } from "@/lib/admin-validation";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await context.params;
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { data: old, error: readError } = await admin.client.from("properties").select("slug,published_at").eq("id", id).single();
  if (readError || !old) return NextResponse.json({ error: "ไม่พบประกาศ" }, { status: 404 });
  const { publish, ...data } = parsed.data;
  const { error } = await admin.client.from("properties").update({ ...data, status: publish && data.status === "draft" ? "available" : data.status, published_at: publish ? old.published_at ?? new Date().toISOString() : null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.code === "23505" ? "รหัสทรัพย์หรือ slug ซ้ำ" : "บันทึกประกาศไม่สำเร็จ" }, { status: 400 });
  revalidatePath("/"); revalidatePath("/properties"); revalidatePath(`/properties/${old.slug}`); revalidatePath(`/properties/${data.slug}`);
  return NextResponse.json({ id, slug: data.slug });
}

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  if (admin.role !== "owner") return NextResponse.json({ error: "เฉพาะเจ้าของระบบที่ลบประกาศได้" }, { status: 403 });
  const { id } = await context.params;
  const { data: old } = await admin.client.from("properties").select("slug").eq("id", id).single();
  if (!old) return NextResponse.json({ error: "ไม่พบประกาศ" }, { status: 404 });
  const { data: images, error: imageError } = await admin.client.from("property_images").select("storage_path").eq("property_id", id);
  if (imageError) return NextResponse.json({ error: "ไม่สามารถตรวจภาพประกาศได้" }, { status: 500 });
  const { error } = await admin.client.from("properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "ลบประกาศไม่สำเร็จ" }, { status: 500 });
  const removed = images?.length ? await admin.client.storage.from("property-images").remove(images.map((x) => x.storage_path)) : null;
  revalidatePath("/"); revalidatePath("/properties"); revalidatePath(`/properties/${old.slug}`);
  return NextResponse.json({ ok: true, warning: removed?.error ? "ลบประกาศแล้ว แต่มีไฟล์ภาพค้างใน Storage โปรดตรวจสอบ" : null });
}
