import { describe, expect, it } from 'vitest';
import { demoProperties } from '../data/demo-properties';
import { compareProperties } from './comparison';

describe('compareProperties', () => {
  it('ranks deterministically against explicit priorities', () => {
    const properties = demoProperties.filter((property) => ['thess-001', 'thess-002', 'thess-003'].includes(property.id));
    const comparison = compareProperties(properties, ['price', 'metro_access']);

    expect(comparison.ranking).toHaveLength(3);
    expect(comparison.ranking[0].propertyId).toBe('thess-002');
    expect(comparison.priorities).toEqual(['price', 'metro_access']);
  });

  it('refuses an invalid comparison size', () => {
    expect(() => compareProperties([demoProperties[0]])).toThrow(/between 2 and 5/);
  });
});
