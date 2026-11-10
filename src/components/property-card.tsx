"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Property } from "@/data/properties";

export function PropertyCard({ property, onView }: { property: Property; onView?: (property: Property) => void }) {
  const label = `ดูรายละเอียด ${property.title} ${property.badge}`;
  const media = <>
    {property.image ? <Image src={property.image} unoptimized={property.image.startsWith("http")} alt={property.title} fill sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1100px) 50vw, 33vw" /> : <span className="card-image-fallback">ยังไม่มีภาพ</span>}
    <span className="property-status">{property.badge}</span>
  </>;
  return <article className="property-card">
    {onView ? <button className="property-image-button" onClick={() => onView(property)} aria-label={label}>{media}</button> : <Link className="property-image-button" href={`/properties/${property.slug}`} aria-label={label}>{media}</Link>}
    <div className="property-content">
      <p className="property-type">{property.type}</p>
      <h3>{property.title}</h3>
      <div className="property-location"><MapPin size={16} strokeWidth={1.7} />{property.location}</div>
      <div className="property-divider" />
      <div className="property-bottom"><div><span className="property-price-label">ราคาเสนอขาย</span><strong>฿{property.priceLabel}</strong></div><span className="property-area">{property.area}</span></div>
      {onView ? <button className="property-link" onClick={() => onView(property)}>ดูรายละเอียด <ArrowUpRight size={17} /></button> : <Link className="property-link" href={`/properties/${property.slug}`}>ดูรายละเอียด <ArrowUpRight size={17} /></Link>}
    </div>
  </article>;
}
