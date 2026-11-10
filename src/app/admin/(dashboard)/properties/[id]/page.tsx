import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { PropertyEditor } from "@/components/property-editor";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { client, role } = await requireAdmin(); const { id } = await params;
  const { data, error } = await client.from("properties").select("*,property_images(*)").eq("id", id).single();
  if (error || !data) notFound();
  return <section className="admin-content"><div className="admin-title-row"><div><span className="section-kicker">EDIT PROPERTY</span><h1>แก้ไขประกาศ</h1></div><Link className="admin-primary" href={`/preview/properties/${id}`}>ดูตัวอย่างก่อนเผยแพร่</Link></div><PropertyEditor initial={data} canDelete={role === "owner"} /></section>;
}
