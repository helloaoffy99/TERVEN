import { Property, sampleProperties } from "@/data/properties";

// Swap this repository implementation when a real data source is introduced.
export interface PropertyRepository {
  list(): Promise<Property[]>;
  bySlug(slug: string): Promise<Property | null>;
  featured(): Promise<Property[]>;
}

export const mockPropertyRepository: PropertyRepository = {
  async list() { return sampleProperties; },
  async bySlug(slug) { return sampleProperties.find((property) => property.slug === slug) ?? null; },
  async featured() { return sampleProperties.filter((property) => property.isFeatured); },
};

export function getPropertyBySlug(slug: string): Property | null {
  return sampleProperties.find((property) => property.slug === slug) ?? null;
}

export function getFeaturedProperties(): Property[] {
  return sampleProperties.filter((property) => property.isFeatured);
}
