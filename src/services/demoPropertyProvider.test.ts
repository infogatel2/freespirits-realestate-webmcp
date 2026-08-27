import { describe, expect, it } from 'vitest';
import { demoPropertyProvider } from './demoPropertyProvider';

describe('demoPropertyProvider', () => {
  it('returns at least three renovated 2–3 bedroom rentals in Thessaloniki under 750', async () => {
    const results = await demoPropertyProvider.search({
      transactionType: 'rent',
      location: 'Thessaloniki',
      maxPrice: 750,
      minBedrooms: 2,
      maxBedrooms: 3,
      renovated: true,
    });

    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.every((property) => property.price <= 750)).toBe(true);
    expect(results.every((property) => property.bedrooms >= 2 && property.bedrooms <= 3)).toBe(true);
    expect(results.every((property) => property.renovated)).toBe(true);
  });

  it('looks up a property by stable id', async () => {
    const property = await demoPropertyProvider.getById('thess-002');
    expect(property?.neighborhood).toBe('Voulgari');
  });
});
