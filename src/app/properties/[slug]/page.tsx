import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProperty, listPublicProperties } from "@/lib/live-properties";
import { getSiteUrl, siteShareImage } from "@/config/site";
import { PropertyDetailView } from "@/components/property-detail-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicProperty(slug);
  if (!property) return { title: "ไม่พบอสังหาริมทรัพย์ | TERVÉN", robots: { index: false } };
  const title = `${property.title} | TERVÉN`;
  const description = property.description || `อสังหาริมทรัพย์ใน${property.district} ${property.province}`;
  const canonical = new URL(`/properties/${property.slug}`, getSiteUrl()).toString();
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website", images: [siteShareImage] }, twitter: { card: "summary", title, description, images: [siteShareImage.url] } };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPublicProperty(slug);
  if (!property) notFound();
  const related = (await listPublicProperties()).filter((item) => item.id !== property.id && item.province === property.province).slice(0, 3);
  const canonical = new URL(`/properties/${property.slug}`, getSiteUrl()).toString();
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: property.title, description: property.description, url: canonical, isPartOf: { "@type": "WebSite", name: "TERVÉN", url: getSiteUrl().toString() } };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <PropertyDetailView property={property} related={related} />
  </main>;
}
