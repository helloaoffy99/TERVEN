import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/admin-validation";

type Context = { params: Promise<{ id: string }> };
const statuses = ["new", "contacted", "reviewing", "converted", "closed"];
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await context.params;
  let body: { status?: string }; try { body = await request.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  if (!statuses.includes(body.status ?? "") || body.status === "converted") return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  const { data: existing } = await admin.client.from("property_submissions").select("status").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 404 });
  if (existing.status === "converted") return NextResponse.json({ error: "คำขอนี้แปลงเป็นประกาศแล้ว" }, { status: 409 });
  const { error } = await admin.client.from("property_submissions").update({ status: body.status }).eq("id", id);
  if (error) return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 500 });
  revalidatePath("/admin/submissions"); revalidatePath("/admin"); return NextResponse.json({ ok: true });
}
export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await context.params;
  const { data: propertyId, error } = await admin.client.rpc("convert_submission_to_draft", { p_submission_id: id });
  if (error) return NextResponse.json({ error: "สร้างแบบร่างไม่สำเร็จ" }, { status: 500 });
  if (!propertyId) return NextResponse.json({ error: "ไม่พบคำขอหรือแปลงเป็นแบบร่างแล้ว" }, { status: 409 });
  revalidatePath("/admin/submissions"); revalidatePath("/admin/properties"); revalidatePath("/admin");
  return NextResponse.json({ propertyId }, { status: 201 });
}
