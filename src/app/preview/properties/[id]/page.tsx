import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailView } from "@/components/property-detail-view";
import { requireAdmin } from "@/lib/admin-auth";
import { mapPropertyRow } from "@/lib/live-properties";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ตัวอย่างประกาศ | TERVÉN Admin", robots: { index: false, follow: false } };

export default async function PreviewPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireAdmin();
  const { id } = await params;
  const { data, error } = await client.from("properties").select("*,property_images(id,storage_path,alt_text,sort_order,is_cover)").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  const property = mapPropertyRow(data, process.env.NEXT_PUBLIC_SUPABASE_URL!);
  return <main><PropertyDetailView property={property} preview unpublished={!data.published_at} /></main>;
}
