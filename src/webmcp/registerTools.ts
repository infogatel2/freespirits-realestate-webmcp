import { compareProperties, type ComparisonPriority, type PropertyComparison } from '../domain/comparison';
import { prepareEnquiryDraft, type EnquiryDraft } from '../domain/enquiry';
import type { PropertySearchCriteria, PropertySummary } from '../domain/property';
import { demoPropertyProvider } from '../services/demoPropertyProvider';
import { favoriteStore, type FavoriteResult } from '../state/favorites';

export interface WebMCPCallbacks {
  onActivity: (message: string) => void;
  onSearchResults: (results: PropertySummary[]) => void;
  onComparison: (comparison: PropertyComparison) => void;
  onFavorite: (result: FavoriteResult) => void;
  onEnquiry: (draft: EnquiryDraft) => void;
}

const textResult = (payload: unknown) => ({
  content: [{ type: 'text', text: JSON.stringify(payload) }],
});

const asOptionalString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const asOptionalNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const asOptionalBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined);
const asOptionalStringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
const allowedPriorities: ComparisonPriority[] = ['price', 'space', 'renovated', 'metro_access', 'university_access', 'outdoor_space'];

const parseSearchCriteria = (input: Record<string, unknown>): PropertySearchCriteria => {
  const minPrice = asOptionalNumber(input.minPrice);
  const maxPrice = asOptionalNumber(input.maxPrice);
  const minBedrooms = asOptionalNumber(input.minBedrooms);
  const maxBedrooms = asOptionalNumber(input.maxBedrooms);
  const requestedLimit = asOptionalNumber(input.limit);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) throw new Error('minPrice cannot be greater than maxPrice.');
  if (minBedrooms !== undefined && maxBedrooms !== undefined && minBedrooms > maxBedrooms) throw new Error('minBedrooms cannot be greater than maxBedrooms.');

  return {
    transactionType: input.transactionType === 'rent' || input.transactionType === 'sale' ? input.transactionType : undefined,
    location: asOptionalString(input.location),
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes: asOptionalStringArray(input.propertyTypes),
    renovated: asOptionalBoolean(input.renovated),
    features: asOptionalStringArray(input.features),
    limit: requestedLimit === undefined ? 10 : Math.max(1, Math.min(Math.trunc(requestedLimit), 20)),
  };
};

export async function registerWebMCPTools(callbacks: WebMCPCallbacks) {
  if (!document.modelContext) {
    callbacks.onActivity('WebMCP is not available in this browser context.');
    return () => undefined;
  }

  const controller = new AbortController();

  await document.modelContext.registerTool({
    name: 'search_properties',
    title: 'Search properties',
    description: 'Use this first for property-discovery requests. Search available real-estate listings using structured criteria such as location, price, bedrooms, property type, renovation status, and features. Returned summaries already include enough facts for normal comparison: stable property ID, title, neighborhood, price, size, bedrooms, renovation status, features, and listing URL. If the user asks to compare the best options, pass the returned IDs directly to compare_properties; do not call get_property_details merely to compare them.',
    inputSchema: {
      type: 'object',
      properties: {
        transactionType: { type: 'string', enum: ['rent', 'sale'], description: 'Whether the user wants to rent or buy.' },
        location: { type: 'string', description: 'City or neighborhood, for example Thessaloniki or Toumba.' },
        minPrice: { type: 'number', minimum: 0 },
        maxPrice: { type: 'number', minimum: 0 },
        minBedrooms: { type: 'integer', minimum: 0 },
        maxBedrooms: { type: 'integer', minimum: 0 },
        propertyTypes: { type: 'array', items: { type: 'string' } },
        renovated: { type: 'boolean' },
        features: { type: 'array', items: { type: 'string' } },
        limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
      },
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    async execute(input) {
      try {
        const criteria = parseSearchCriteria(input);
        callbacks.onActivity(`Agent searched properties${criteria.location ? ` in ${criteria.location}` : ''}.`);
        const results = await demoPropertyProvider.search(criteria);
        callbacks.onSearchResults(results);
        return textResult({ ok: true, criteria, count: results.length, results });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown search error.';
        callbacks.onActivity(`Search rejected: ${message}`);
        return textResult({ ok: false, error: message });
      }
    },
  }, { signal: controller.signal });

  await document.modelContext.registerTool({
    name: 'get_property_details',
    title: 'Get property details',
    description: 'Optional deep-inspection tool for one property. Use only when the user explicitly asks for additional facts that are not already present in search_properties or compare_properties. Do NOT call this tool merely to choose the top-ranked property, save a favorite, or prepare an enquiry after a comparison; those steps can proceed directly from the comparison result.',
    inputSchema: {
      type: 'object',
      properties: { propertyId: { type: 'string', description: 'Stable property ID returned by search_properties.' } },
      required: ['propertyId'],
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    async execute(input) {
      const propertyId = asOptionalString(input.propertyId);
      if (!propertyId) return textResult({ ok: false, error: 'propertyId is required.' });
      const property = await demoPropertyProvider.getById(propertyId);
      if (!property) return textResult({ ok: false, error: `Property ${propertyId} was not found.` });
      callbacks.onActivity(`Agent inspected ${property.title}.`);
      return textResult({ ok: true, property });
    },
  }, { signal: controller.signal });

  await document.modelContext.registerTool({
    name: 'compare_properties',
    title: 'Compare properties',
    description: 'Use after search_properties when the user asks for the best options or a comparison. Compare 2–5 property IDs with a transparent deterministic score against priorities such as price, space, renovation, metro access, university access, or outdoor space. The result is sufficient to make the next decision: it returns ranked candidates with propertyId, title, score, strengths, tradeoffs, and score breakdown. If the user says save my favorite without naming one, treat rank #1 as the favorite and call save_favorite directly. If the user also asks for an enquiry, call prepare_enquiry on that same property next. Do not call get_property_details between these steps unless the user explicitly requests additional facts.',
    inputSchema: {
      type: 'object',
      properties: {
        propertyIds: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string' } },
        priorities: { type: 'array', items: { type: 'string', enum: allowedPriorities } },
      },
      required: ['propertyIds'],
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    async execute(input) {
      try {
        const propertyIds = asOptionalStringArray(input.propertyIds) ?? [];
        if (propertyIds.length < 2 || propertyIds.length > 5) throw new Error('propertyIds must contain between 2 and 5 IDs.');
        const requested = (asOptionalStringArray(input.priorities) ?? []).filter((value): value is ComparisonPriority => allowedPriorities.includes(value as ComparisonPriority));
        const properties = await Promise.all(propertyIds.map((id) => demoPropertyProvider.getById(id)));
        const missingIds = propertyIds.filter((_, index) => properties[index] === null);
        if (missingIds.length) throw new Error(`Unknown property IDs: ${missingIds.join(', ')}`);
        const comparison = compareProperties(properties.filter((property) => property !== null), requested);
        callbacks.onComparison(comparison);
        callbacks.onActivity(`Agent compared ${propertyIds.length} properties using ${comparison.priorities.join(', ')}.`);
        return textResult({ ok: true, comparison });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown comparison error.';
        callbacks.onActivity(`Comparison rejected: ${message}`);
        return textResult({ ok: false, error: message });
      }
    },
  }, { signal: controller.signal });

  await document.modelContext.registerTool({
    name: 'save_favorite',
    title: 'Save favorite',
    description: 'Save a specific property to the user\'s challenge-session favorites. Use only when the user asks to save or favorite a property. After compare_properties, if the user did not name a different preference, save rank #1 directly; no get_property_details call is needed. This changes session state but does not access private production account data. If the same user request also asks to prepare an enquiry, immediately call prepare_enquiry next with the same propertyId.',
    inputSchema: {
      type: 'object',
      properties: { propertyId: { type: 'string', description: 'Stable property ID to save.' } },
      required: ['propertyId'],
    },
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: false,
    },
    async execute(input) {
      const propertyId = asOptionalString(input.propertyId);
      if (!propertyId) return textResult({ ok: false, error: 'propertyId is required.' });
      const property = await demoPropertyProvider.getById(propertyId);
      if (!property) return textResult({ ok: false, error: `Property ${propertyId} was not found.` });
      const result = favoriteStore.save(propertyId);
      callbacks.onFavorite(result);
      callbacks.onActivity(result.alreadySaved ? `Agent confirmed ${property.title} was already a favorite.` : `Agent saved ${property.title} as a favorite.`);
      return textResult({ ok: true, result });
    },
  }, { signal: controller.signal });

  await document.modelContext.registerTool({
    name: 'prepare_enquiry',
    title: 'Prepare property enquiry',
    description: 'Final preparation step for a selected property. Create an enquiry draft for human review only. This tool can work from propertyId alone; do not call get_property_details first just to prepare the draft. If name, email, phone, or message intent were not supplied by the user, leave them absent and still create the reviewable draft. Never send, submit, or contact the advertiser. The returned draft always requires explicit human confirmation before any real-world contact can occur.',
    inputSchema: {
      type: 'object',
      properties: {
        propertyId: { type: 'string', description: 'Stable property ID for the enquiry.' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        messageIntent: { type: 'string', description: 'Optional user-provided request or question to include in the draft.' },
      },
      required: ['propertyId'],
    },
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: true,
    },
    async execute(input) {
      const propertyId = asOptionalString(input.propertyId);
      if (!propertyId) return textResult({ ok: false, error: 'propertyId is required.' });
      const property = await demoPropertyProvider.getById(propertyId);
      if (!property) return textResult({ ok: false, error: `Property ${propertyId} was not found.` });
      const draft = prepareEnquiryDraft(property, {
        name: asOptionalString(input.name),
        email: asOptionalString(input.email),
        phone: asOptionalString(input.phone),
        messageIntent: asOptionalString(input.messageIntent),
      });
      callbacks.onEnquiry(draft);
      callbacks.onActivity(`Agent prepared an enquiry for ${property.title}; human confirmation is required.`);
      return textResult({ ok: true, draft });
    },
  }, { signal: controller.signal });

  callbacks.onActivity('WebMCP ready: five challenge tools registered.');
  return () => controller.abort();
}
