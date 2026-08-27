import type { Property } from './property';

export type ComparisonPriority = 'price' | 'space' | 'renovated' | 'metro_access' | 'university_access' | 'outdoor_space';

export interface ComparisonItem {
  propertyId: string;
  title: string;
  score: number;
  scoreBreakdown: Partial<Record<ComparisonPriority, number | null>>;
  strengths: string[];
  tradeoffs: string[];
}

export interface PropertyComparison {
  priorities: ComparisonPriority[];
  ranking: ComparisonItem[];
  missingDataWarnings: string[];
}

const normalizeHigherIsBetter = (value: number, values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max === min ? 1 : (value - min) / (max - min);
};

const normalizeLowerIsBetter = (value: number, values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max === min ? 1 : (max - value) / (max - min);
};

const hasOutdoorSpace = (property: Property) =>
  property.features.some((feature) => /balcony|terrace|garden|yard/i.test(feature));

export function compareProperties(properties: Property[], requestedPriorities: ComparisonPriority[] = ['price', 'space', 'renovated']): PropertyComparison {
  if (properties.length < 2 || properties.length > 5) throw new Error('compare_properties requires between 2 and 5 properties.');

  const priorities = [...new Set(requestedPriorities.length ? requestedPriorities : ['price', 'space', 'renovated'])];
  const prices = properties.map((property) => property.price);
  const areas = properties.map((property) => property.areaSqm);
  const metroValues = properties.flatMap((property) => property.distanceMetroM === undefined ? [] : [property.distanceMetroM]);
  const universityValues = properties.flatMap((property) => property.distanceUniversityM === undefined ? [] : [property.distanceUniversityM]);
  const missingDataWarnings: string[] = [];

  const ranking = properties.map<ComparisonItem>((property) => {
    const breakdown: Partial<Record<ComparisonPriority, number | null>> = {};
    const strengths: string[] = [];
    const tradeoffs: string[] = [];

    for (const priority of priorities) {
      let score: number | null = null;
      if (priority === 'price') score = normalizeLowerIsBetter(property.price, prices);
      if (priority === 'space') score = normalizeHigherIsBetter(property.areaSqm, areas);
      if (priority === 'renovated') score = property.renovated ? 1 : 0;
      if (priority === 'metro_access') score = property.distanceMetroM === undefined ? null : normalizeLowerIsBetter(property.distanceMetroM, metroValues);
      if (priority === 'university_access') score = property.distanceUniversityM === undefined ? null : normalizeLowerIsBetter(property.distanceUniversityM, universityValues);
      if (priority === 'outdoor_space') score = hasOutdoorSpace(property) ? 1 : 0;
      breakdown[priority] = score;

      if (score === null) {
        missingDataWarnings.push(`${property.id}: missing data for ${priority}.`);
      } else if (score >= 0.85) {
        strengths.push(priority.replaceAll('_', ' '));
      } else if (score <= 0.2) {
        tradeoffs.push(priority.replaceAll('_', ' '));
      }
    }

    const knownScores = Object.values(breakdown).filter((value): value is number => typeof value === 'number');
    const score = knownScores.length ? Math.round((knownScores.reduce((sum, value) => sum + value, 0) / knownScores.length) * 100) : 0;

    return { propertyId: property.id, title: property.title, score, scoreBreakdown: breakdown, strengths, tradeoffs };
  }).sort((a, b) => b.score - a.score || a.propertyId.localeCompare(b.propertyId));

  return { priorities, ranking, missingDataWarnings: [...new Set(missingDataWarnings)] };
}
