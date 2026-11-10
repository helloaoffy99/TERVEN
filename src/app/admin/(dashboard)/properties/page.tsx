import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

const pageSize = 40;

export default async function AdminProperties({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { client } = await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 80);
  const safeQ = q.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  let query = client.from("properties")
    .select("id,property_code,title,province,district,status,published_at,is_featured,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false });
  if (safeQ) query = query.or(`title.ilike.%${safeQ}%,property_code.ilike.%${safeQ}%,province.ilike.%${safeQ}%,district.ilike.%${safeQ}%`);
  if (params.status === "draft") query = query.is("published_at", null);
  else if (["available", "reserved", "sold"].includes(params.status ?? "")) query = query.eq("status", params.status!);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  const pageUrl = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (params.status) search.set("status", params.status);
    search.set("page", String(target));
    return `/admin/properties?${search}`;
  };
  return <section className="admin-content">
    <div className="admin-title-row"><div><span className="section-kicker">PROPERTY MANAGEMENT</span><h1>จัดการประกาศ</h1></div><Link className="admin-primary" href="/admin/properties/new">เพิ่มประกาศ</Link></div>
    <form className="admin-search" method="get"><input name="q" defaultValue={q} placeholder="ค้นหาชื่อประกาศ" aria-label="ค้นหาประกาศ" /><select name="status" defaultValue={params.status ?? ""} aria-label="กรองสถานะ"><option value="">ทุกสถานะ</option><option value="draft">แบบร่าง</option><option value="available">พร้อมขาย</option><option value="reserved">จองแล้ว</option><option value="sold">ขายแล้ว</option></select><button type="submit">ค้นหา</button></form>
    {error ? <p role="alert">โหลดประกาศไม่สำเร็จ</p> : <>
      <div className="admin-table">{data?.map((item) => <Link key={item.id} href={`/admin/properties/${item.id}`} className="admin-property-row"><div><strong>{item.title}</strong><span>{item.property_code} · {item.district} {item.province}</span></div><div><span>{item.published_at ? "เผยแพร่" : "แบบร่าง"} · {item.status}{item.is_featured ? " · เด่น" : ""}</span><small>แก้ไขล่าสุด {new Date(item.updated_at).toLocaleDateString("th-TH")}</small></div></Link>)}{!data?.length && <p>ไม่พบประกาศ</p>}</div>
      {(count ?? 0) > pageSize && <nav className="admin-pagination" aria-label="หน้ารายการประกาศ"><span>หน้า {page} จาก {Math.ceil((count ?? 0) / pageSize)}</span><div>{page > 1 && <Link href={pageUrl(page - 1)}>ก่อนหน้า</Link>}{page * pageSize < (count ?? 0) && <Link href={pageUrl(page + 1)}>ถัดไป</Link>}</div></nav>}
    </>}
  </section>;
}
