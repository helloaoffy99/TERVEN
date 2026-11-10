import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboard() {
  const { client } = await requireAdmin();
  const [all, published, drafts, reserved, sold, newLeads, recentProperties, recentLeads] = await Promise.all([
    client.from("properties").select("id", { count: "exact", head: true }),
    client.from("properties").select("id", { count: "exact", head: true }).not("published_at", "is", null),
    client.from("properties").select("id", { count: "exact", head: true }).is("published_at", null),
    client.from("properties").select("id", { count: "exact", head: true }).eq("status", "reserved"),
    client.from("properties").select("id", { count: "exact", head: true }).eq("status", "sold"),
    client.from("property_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("properties").select("id,title,status,published_at,updated_at").order("updated_at", { ascending: false }).limit(6),
    client.from("property_submissions").select("id,contact_name,status,created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const results = [all, published, drafts, reserved, sold, newLeads, recentProperties, recentLeads];
  if (results.some((result) => result.error)) return <section className="admin-content"><h1>ภาพรวม</h1><p role="alert">ไม่สามารถโหลดข้อมูลได้ โปรดตรวจ Migration และสิทธิ์บัญชี</p></section>;
  const cards = [
    ["ประกาศทั้งหมด", all.count], ["เผยแพร่", published.count],
    ["แบบร่าง", drafts.count], ["จองแล้ว", reserved.count],
    ["ขายแล้ว", sold.count], ["คำขอใหม่", newLeads.count],
  ] as const;
  return <section className="admin-content"><div className="admin-title-row"><div><span className="section-kicker">OVERVIEW</span><h1>ภาพรวมเว็บไซต์</h1></div><Link className="admin-primary" href="/admin/properties/new">เพิ่มประกาศ</Link></div><div className="admin-stats">{cards.map(([label, count]) => <article key={label}><span>{label}</span><strong>{count ?? 0}</strong></article>)}</div><div className="admin-columns"><section><h2>ประกาศล่าสุด</h2>{recentProperties.data?.map((item) => <Link key={item.id} href={`/admin/properties/${item.id}`} className="admin-list-item"><span>{item.title}</span><small>{item.published_at ? "เผยแพร่" : "แบบร่าง"}</small></Link>)}{!recentProperties.data?.length && <p>ยังไม่มีประกาศ</p>}</section><section><h2>คำขอล่าสุด</h2>{recentLeads.data?.map((item) => <Link key={item.id} href={`/admin/submissions/${item.id}`} className="admin-list-item"><span>{item.contact_name}</span><small>{item.status}</small></Link>)}{!recentLeads.data?.length && <p>ยังไม่มีคำขอ</p>}</section></div></section>;
}
