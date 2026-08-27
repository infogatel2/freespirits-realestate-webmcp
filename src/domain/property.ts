export type TransactionType = 'rent' | 'sale';

export interface Property {
  id: string;
  title: string;
  transactionType: TransactionType;
  propertyType: string;
  neighborhood: string;
  city: string;
  price: number;
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  renovated: boolean;
  renovationYear?: number;
  floor?: number;
  features: string[];
  distanceMetroM?: number;
  distanceUniversityM?: number;
  description: string;
  listingUrl: string;
}

export interface PropertySearchCriteria {
  transactionType?: TransactionType;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyTypes?: string[];
  renovated?: boolean;
  features?: string[];
  limit?: number;
}

export interface PropertySummary {
  id: string;
  title: string;
  transactionType: TransactionType;
  propertyType: string;
  neighborhood: string;
  city: string;
  price: number;
  areaSqm: number;
  bedrooms: number;
  renovated: boolean;
  features: string[];
  listingUrl: string;
}

export const toSummary = (property: Property): PropertySummary => ({
  id: property.id,
  title: property.title,
  transactionType: property.transactionType,
  propertyType: property.propertyType,
  neighborhood: property.neighborhood,
  city: property.city,
  price: property.price,
  areaSqm: property.areaSqm,
  bedrooms: property.bedrooms,
  renovated: property.renovated,
  features: property.features,
  listingUrl: property.listingUrl,
});
