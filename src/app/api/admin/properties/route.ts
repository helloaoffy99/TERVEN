import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin-auth";
import { propertyInputSchema, sameOrigin } from "@/lib/admin-validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { publish, ...data } = parsed.data;
  const { data: saved, error } = await admin.client.from("properties").insert({ ...data, status: publish && data.status === "draft" ? "available" : data.status, published_at: publish ? new Date().toISOString() : null }).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "รหัสทรัพย์หรือ slug ซ้ำ" : "บันทึกประกาศไม่สำเร็จ" }, { status: 400 });
  revalidatePath("/"); revalidatePath("/properties");
  return NextResponse.json(saved, { status: 201 });
}
