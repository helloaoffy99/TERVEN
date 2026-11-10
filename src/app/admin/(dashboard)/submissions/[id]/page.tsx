import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { SubmissionActions } from "@/components/submission-actions";

export default async function SubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireAdmin(); const { id } = await params;
  const { data, error } = await client.from("property_submissions").select("*").eq("id", id).single();
  if (error || !data) notFound();
  return <section className="admin-content"><span className="section-kicker">SELLER REQUEST</span><h1>คำขอฝากขาย</h1><div className="admin-lead-card"><dl><div><dt>ชื่อ</dt><dd>{data.contact_name}</dd></div><div><dt>โทรศัพท์</dt><dd><a href={`tel:${data.phone}`}>{data.phone}</a></dd></div><div><dt>LINE ID</dt><dd>{data.line_id || "ไม่ระบุ"}</dd></div><div><dt>ประเภท</dt><dd>{data.property_type}</dd></div><div><dt>ทำเล</dt><dd>{[data.subdistrict, data.district, data.province].filter(Boolean).join(" · ")}</dd></div><div><dt>พื้นที่</dt><dd>{Number(data.land_area_sqm).toLocaleString("th-TH")} ตร.ม.</dd></div><div><dt>ราคาเสนอ</dt><dd>฿{Number(data.asking_price).toLocaleString("th-TH")}</dd></div><div><dt>รายละเอียด</dt><dd>{data.description || "ไม่ระบุ"}</dd></div><div><dt>วันที่ยินยอม</dt><dd>{new Date(data.consent_at).toLocaleString("th-TH")}</dd></div></dl><SubmissionActions id={id} status={data.status} /></div></section>;
}
