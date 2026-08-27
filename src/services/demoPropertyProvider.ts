import { demoProperties } from '../data/demo-properties';
import type { Property, PropertySearchCriteria, PropertySummary } from '../domain/property';
import { toSummary } from '../domain/property';

const includesText = (value: string, query: string) =>
  value.toLocaleLowerCase().includes(query.toLocaleLowerCase());

export const demoPropertyProvider = {
  async search(criteria: PropertySearchCriteria): Promise<PropertySummary[]> {
    const limit = Math.max(1, Math.min(criteria.limit ?? 10, 20));

    return demoProperties
      .filter((property) => {
        if (criteria.transactionType && property.transactionType !== criteria.transactionType) return false;
        if (criteria.location) {
          const locationMatch = includesText(property.city, criteria.location) || includesText(property.neighborhood, criteria.location);
          if (!locationMatch) return false;
        }
        if (criteria.minPrice !== undefined && property.price < criteria.minPrice) return false;
        if (criteria.maxPrice !== undefined && property.price > criteria.maxPrice) return false;
        if (criteria.minBedrooms !== undefined && property.bedrooms < criteria.minBedrooms) return false;
        if (criteria.maxBedrooms !== undefined && property.bedrooms > criteria.maxBedrooms) return false;
        if (criteria.renovated !== undefined && property.renovated !== criteria.renovated) return false;
        if (criteria.propertyTypes?.length && !criteria.propertyTypes.some((type) => includesText(property.propertyType, type))) return false;
        if (criteria.features?.length) {
          const haystack = property.features.join(' ').toLocaleLowerCase();
          if (!criteria.features.every((feature) => haystack.includes(feature.toLocaleLowerCase()))) return false;
        }
        return true;
      })
      .slice(0, limit)
      .map(toSummary);
  },

  async getById(id: string): Promise<Property | null> {
    return demoProperties.find((property) => property.id === id) ?? null;
  },
};
