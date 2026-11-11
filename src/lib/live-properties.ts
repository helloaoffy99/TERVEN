import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { Property, PropertyImage, PropertyStatus, PropertyType } from "@/data/properties";
import { formatPrice } from "@/data/properties";
import { curatedProperties } from "@/data/curated-properties";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Row = Record<string, unknown> & { property_images?: Record<string, unknown>[] };
const statuses: Record<string, PropertyStatus> = { available: "พร้อมขาย", reserved: "จองแล้ว", sold: "ขายแล้ว" };

function areaFromSqm(value: number | null) {
  if (!value || value <= 0) return undefined;
  const squareWa = value / 4;
  const rai = Math.floor(squareWa / 400);
  const ngan = Math.floor((squareWa - rai * 400) / 100);
  return { rai, ngan, squareWa: Number((squareWa - rai * 400 - ngan * 100).toFixed(2)) };
}

export function mapPropertyRow(row: Row, url: string): Property {
  const images: PropertyImage[] = (row.property_images ?? []).map((image) => ({
    id: String(image.id), propertyId: String(row.id),
    imageUrl: `${url}/storage/v1/object/public/property-images/${String(image.storage_path).split("/").map(encodeURIComponent).join("/")}`,
    altText: String(image.alt_text || row.title), sortOrder: Number(image.sort_order), isCover: Boolean(image.is_cover),
  })).sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder);
  const landArea = areaFromSqm(row.land_area_sqm == null ? null : Number(row.land_area_sqm));
  const usableAreaSqm = row.usable_area_sqm == null ? undefined : Number(row.usable_area_sqm);
  const price = Number(row.price);
  const district = String(row.district);
  const province = String(row.province);
  const status = statuses[String(row.status)] ?? "พร้อมขาย";
  return {
    id: String(row.id), propertyCode: String(row.property_code), slug: String(row.slug), title: String(row.title),
    description: String(row.description ?? ""), propertyType: String(row.property_type) as PropertyType, price,
    province, district, subdistrict: row.subdistrict ? String(row.subdistrict) : undefined,
    landArea, usableAreaSqm, bedrooms: row.bedrooms == null ? undefined : Number(row.bedrooms),
    bathrooms: row.bathrooms == null ? undefined : Number(row.bathrooms), parking: row.parking == null ? undefined : Number(row.parking),
    latitude: row.latitude == null ? undefined : Number(row.latitude), longitude: row.longitude == null ? undefined : Number(row.longitude),
    status, isFeatured: Boolean(row.is_featured), images, highlights: [], amenities: [],
    createdAt: String(row.created_at), updatedAt: String(row.updated_at), location: `${district} ${province}`,
    type: String(row.property_type) as PropertyType, priceLabel: formatPrice(price),
    area: landArea ? [landArea.rai && `${landArea.rai} ไร่`, landArea.ngan && `${landArea.ngan} งาน`, landArea.squareWa && `${landArea.squareWa} ตร.ว.`].filter(Boolean).join(" ") : usableAreaSqm ? `${usableAreaSqm} ตร.ม.` : "ไม่ระบุพื้นที่",
    image: images[0]?.imageUrl ?? "", badge: status,
  };
}

const select = "*, property_images(id,storage_path,alt_text,sort_order,is_cover)";
export async function listPublicProperties(): Promise<Property[]> {
  noStore();
  const client = await createServerSupabaseClient();
  if (!client) return curatedProperties;
  const rows: Row[] = [];
  const pageSize = 500;
  const now = new Date().toISOString();
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await client.from("properties").select(select)
      .not("published_at", "is", null).neq("status", "draft").lte("published_at", now)
      .order("published_at", { ascending: false }).order("id", { ascending: false })
      .range(start, start + pageSize - 1);
    if (error) throw new Error("ไม่สามารถโหลดรายการอสังหาริมทรัพย์ได้");
    rows.push(...(data ?? []) as Row[]);
    if (!data || data.length < pageSize) break;
  }
  const live = rows.map((row) => mapPropertyRow(row, process.env.NEXT_PUBLIC_SUPABASE_URL!));
  const liveSlugs = new Set(live.map((property) => property.slug));
  return [...curatedProperties.filter((property) => !liveSlugs.has(property.slug)), ...live];
}

export async function getPublicProperty(slug: string): Promise<Property | null> {
  noStore();
  const client = await createServerSupabaseClient();
  if (!client) return curatedProperties.find((property) => property.slug === slug) ?? null;
  const { data, error } = await client.from("properties").select(select).eq("slug", slug).not("published_at", "is", null).neq("status", "draft").lte("published_at", new Date().toISOString()).maybeSingle();
  if (error) throw new Error("ไม่สามารถโหลดรายละเอียดอสังหาริมทรัพย์ได้");
  return data ? mapPropertyRow(data as Row, process.env.NEXT_PUBLIC_SUPABASE_URL!) : curatedProperties.find((property) => property.slug === slug) ?? null;
}
