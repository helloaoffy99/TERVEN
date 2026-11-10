import { z } from "zod";
import { propertyTypes } from "@/data/properties";

const optionalNumber = (max: number) => z.union([z.number().min(0).max(max), z.null()]);
const optionalCount = z.union([z.number().int().min(0).max(1000), z.null()]);
export const propertyInputSchema = z.object({
  property_code: z.string().trim().min(3).max(40),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().max(10000),
  property_type: z.enum(propertyTypes),
  price: z.number().positive().max(9999999999999),
  province: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  subdistrict: z.string().trim().max(100).nullable(),
  land_area_sqm: optionalNumber(9999999999),
  usable_area_sqm: optionalNumber(9999999999),
  bedrooms: optionalCount, bathrooms: optionalCount, parking: optionalCount,
  latitude: z.number().min(-90).max(90).nullable(), longitude: z.number().min(-180).max(180).nullable(),
  status: z.enum(["draft", "available", "reserved", "sold"]),
  is_featured: z.boolean(), publish: z.boolean(),
}).refine((value) => (value.latitude === null) === (value.longitude === null), { message: "ต้องระบุพิกัดทั้งละติจูดและลองจิจูด" });

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("host") || request.headers.get("x-forwarded-host") || new URL(request.url).host;
    return new URL(origin).host === host;
  } catch { return false; }
}
