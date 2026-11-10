import type { PropertyType } from "./properties";

// Hand-maintained contracts matching supabase/migrations/202611100001_phase4.sql.
// Regenerate from Supabase after applying migrations if adopting generated types.
export type DbPropertyStatus = "draft" | "available" | "reserved" | "sold";
export type DbSubmissionStatus = "new" | "contacted" | "reviewing" | "converted" | "closed";

export type PropertyRecord = {
  id: string; property_code: string; slug: string; title: string; description: string;
  property_type: PropertyType; price: string; province: string; district: string; subdistrict: string | null;
  land_area_sqm: string | null; usable_area_sqm: string | null;
  bedrooms: number | null; bathrooms: number | null; parking: number | null;
  latitude: string | null; longitude: string | null; status: DbPropertyStatus;
  is_featured: boolean; published_at: string | null; created_at: string; updated_at: string;
};
export type PropertyImageRecord = {
  id: string; property_id: string; storage_path: string; alt_text: string;
  sort_order: number; is_cover: boolean; created_at: string;
};
export type SubmissionRecord = {
  id: string; contact_name: string; phone: string; line_id: string | null;
  property_type: PropertyType; province: string; district: string; subdistrict: string | null;
  land_area_sqm: string; asking_price: string; description: string | null;
  consent_at: string; status: DbSubmissionStatus; created_at: string;
};
