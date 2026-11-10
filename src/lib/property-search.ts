import type { Property, PropertyStatus, PropertyType } from "../data/properties";

export type PropertySort = "newest" | "oldest" | "price-asc" | "price-desc";
export type PropertyFilters = {
  q: string; province: string; district: string; type: PropertyType | "";
  minPrice: string; maxPrice: string; status: PropertyStatus | "";
  sort: PropertySort; page: number;
};

export const defaultFilters: PropertyFilters = {
  q: "", province: "", district: "", type: "", minPrice: "", maxPrice: "", status: "", sort: "newest", page: 1,
};

function validMoney(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function readFilters(params: URLSearchParams): PropertyFilters {
  const rawPage = Number(params.get("page"));
  const rawSort = params.get("sort");
  return {
    q: params.get("q")?.trim() ?? "",
    province: params.get("province") ?? "",
    district: params.get("district") ?? "",
    type: (params.get("type") ?? "") as PropertyFilters["type"],
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    status: (params.get("status") ?? "") as PropertyFilters["status"],
    sort: rawSort === "oldest" || rawSort === "price-asc" || rawSort === "price-desc" ? rawSort : "newest",
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export function writeFilters(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ["q", "province", "district", "type", "minPrice", "maxPrice", "status"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function getDistricts(properties: Property[], province: string): string[] {
  return [...new Set(properties.filter((property) => !province || property.province === province).map((property) => property.district))].sort((a, b) => a.localeCompare(b, "th"));
}

export function searchProperties(properties: Property[], filters: PropertyFilters, pageSize = 6) {
  const query = filters.q.trim().toLocaleLowerCase("th");
  const min = validMoney(filters.minPrice);
  const max = validMoney(filters.maxPrice);
  const matching = properties.filter((property) => {
    const text = `${property.title} ${property.propertyCode} ${property.description} ${property.province} ${property.district} ${property.subdistrict ?? ""}`.toLocaleLowerCase("th");
    return (!query || text.includes(query)) &&
      (!filters.province || property.province === filters.province) &&
      (!filters.district || property.district === filters.district) &&
      (!filters.type || property.propertyType === filters.type) &&
      (!filters.status || property.status === filters.status) &&
      (min === null || property.price >= min) &&
      (max === null || property.price <= max);
  });
  matching.sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    const dates = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return filters.sort === "oldest" ? -dates : dates;
  });
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(filters.page, totalPages);
  return { items: matching.slice((page - 1) * pageSize, page * pageSize), total: matching.length, page, totalPages };
}
