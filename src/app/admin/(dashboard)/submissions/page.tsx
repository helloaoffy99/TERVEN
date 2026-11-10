import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

const pageSize = 40;
const labels: Record<string, string> = { new: "ใหม่", contacted: "ติดต่อแล้ว", reviewing: "กำลังพิจารณา", converted: "แปลงเป็นแบบร่าง", closed: "ปิดคำขอ" };

export default async function AdminSubmissions({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { client } = await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { data, error, count } = await client.from("property_submissions")
    .select("id,contact_name,phone,province,property_type,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  return <section className="admin-content">
    <span className="section-kicker">SELLER REQUESTS</span><h1>คำขอฝากขาย</h1>
    {error ? <p role="alert">โหลดคำขอไม่สำเร็จ</p> : <>
      <div className="admin-table">{data?.map((item) => <Link className="admin-property-row" key={item.id} href={`/admin/submissions/${item.id}`}><div><strong>{item.contact_name}</strong><span>{item.property_type} · {item.province} · {item.phone}</span></div><div><span>{labels[item.status] ?? item.status}</span><small>{new Date(item.created_at).toLocaleString("th-TH")}</small></div></Link>)}{!data?.length && <p>ยังไม่มีคำขอฝากขาย</p>}</div>
      {(count ?? 0) > pageSize && <nav className="admin-pagination" aria-label="หน้าคำขอฝากขาย"><span>หน้า {page} จาก {Math.ceil((count ?? 0) / pageSize)}</span><div>{page > 1 && <Link href={`/admin/submissions?page=${page - 1}`}>ก่อนหน้า</Link>}{page * pageSize < (count ?? 0) && <Link href={`/admin/submissions?page=${page + 1}`}>ถัดไป</Link>}</div></nav>}
    </>}
  </section>;
}
