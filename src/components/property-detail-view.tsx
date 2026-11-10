import Link from "next/link";
import { Bath, BedDouble, CarFront, MapPin, Ruler, ScanLine } from "lucide-react";
import type { Property } from "@/data/properties";
import { formatLandArea, landAreaToSquareMeters } from "@/data/properties";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyCard } from "@/components/property-card";
import { ShareActions } from "@/components/share-actions";

export function PropertyDetailView({ property, related = [], preview = false, unpublished = false }: { property: Property; related?: Property[]; preview?: boolean; unpublished?: boolean }) {
  const facts = [
    property.landArea && landAreaToSquareMeters(property.landArea) > 0 && { label: "ขนาดที่ดิน", value: `${formatLandArea(property.landArea)} (${landAreaToSquareMeters(property.landArea).toLocaleString("th-TH")} ตร.ม.)`, icon: Ruler },
    property.usableAreaSqm && { label: "พื้นที่ใช้สอย", value: `${property.usableAreaSqm.toLocaleString("th-TH")} ตร.ม.`, icon: ScanLine },
    property.bedrooms && { label: "ห้องนอน", value: `${property.bedrooms} ห้อง`, icon: BedDouble },
    property.bathrooms && { label: "ห้องน้ำ", value: `${property.bathrooms} ห้อง`, icon: Bath },
    property.parking && { label: "ที่จอดรถ", value: `${property.parking} คัน`, icon: CarFront },
  ].filter((value): value is { label: string; value: string; icon: typeof Ruler } => Boolean(value));

  return <div className="inner-page property-detail-page">
    {preview && <div className="admin-preview-banner" role="status"><strong>ตัวอย่างประกาศสำหรับผู้ดูแล</strong><span>{unpublished ? "ประกาศยังไม่เผยแพร่ และหน้านี้เปิดได้เฉพาะผู้ดูแล" : "หน้านี้เปิดได้เฉพาะผู้ดูแล"}</span><Link href={`/admin/properties/${property.id}`}>กลับไปแก้ไขประกาศ</Link></div>}
    <div className="container detail-top"><nav className="breadcrumbs" aria-label="ตำแหน่งหน้า"><Link href="/">หน้าแรก</Link><span>/</span><Link href="/properties">อสังหาริมทรัพย์</Link><span>/</span><span>{property.title}</span></nav></div>
    <section className="container detail-layout">
      <div className="detail-main">
        <PropertyGallery images={property.images} title={property.title} />
        <div className="detail-title"><div><span className="section-kicker">{property.propertyCode} / PROPERTY</span><h1>{property.title}</h1><p><MapPin size={18} /> {property.subdistrict ? `${property.subdistrict} · ` : ""}{property.district} · {property.province}</p></div><span className="detail-status">{unpublished ? "แบบร่าง" : property.status}</span></div>
        {facts.length > 0 && <div className={`detail-facts${facts.length === 1 ? " detail-facts-single" : ""}`}>{facts.map(({ label, value, icon: Icon }) => <div key={label}><Icon size={22} strokeWidth={1.5} /><span>{label}</span><strong>{value}</strong></div>)}</div>}
        <section className="detail-copy"><span className="section-kicker">PROPERTY STORY</span><h2>รายละเอียดทรัพย์</h2><p>{property.description}</p><p className="detail-type-line">ประเภททรัพย์: <strong>{property.propertyType}</strong></p></section>
        {property.highlights.length > 0 && <section className="detail-copy"><span className="section-kicker">THE HIGHLIGHTS</span><h2>จุดเด่น</h2><ul>{property.highlights.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        {property.amenities.length > 0 && <section className="detail-copy"><span className="section-kicker">AMENITIES</span><h2>สิ่งอำนวยความสะดวก</h2><ul>{property.amenities.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      </div>
      <aside className="detail-sidebar"><div className="price-panel"><span>ราคาเสนอขาย</span><strong>฿{property.priceLabel}</strong><p>สถานะ: {unpublished ? "แบบร่าง" : property.status}</p><ShareActions property={property} preview={preview} /></div></aside>
    </section>
    {related.length > 0 && <section className="related-section"><div className="container"><span className="section-kicker">EXPLORE MORE</span><h2>อสังหาริมทรัพย์ในจังหวัดเดียวกัน</h2><div className="property-grid">{related.map((item) => <PropertyCard key={item.id} property={item} />)}</div></div></section>}
  </div>;
}
