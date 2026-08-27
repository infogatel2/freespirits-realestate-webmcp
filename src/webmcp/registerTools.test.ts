import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerWebMCPTools } from './registerTools';

type CapturedTool = {
  name: string;
  execute: (input: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
};

const parsePayload = (result: { content: Array<{ text: string }> }) => JSON.parse(result.content[0].text) as Record<string, unknown>;

const createLocalStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(globalThis, 'document');
  Reflect.deleteProperty(globalThis, 'window');
});

describe('WebMCP tool registration', () => {
  it('registers all five tools and completes the headline human-agent journey', async () => {
    const tools = new Map<string, CapturedTool>();
    const localStorage = createLocalStorage();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage },
    });

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        modelContext: {
          registerTool: async (tool: CapturedTool) => {
            tools.set(tool.name, tool);
          },
        },
      },
    });

    const activity: string[] = [];
    let searchCount = 0;
    let comparedPropertyId: string | undefined;
    let favoriteCount = 0;
    let enquiryRequiresConfirmation = false;

    const dispose = await registerWebMCPTools({
      onActivity: (message) => activity.push(message),
      onSearchResults: (results) => { searchCount = results.length; },
      onComparison: (comparison) => { comparedPropertyId = comparison.ranking[0]?.propertyId; },
      onFavorite: (favorite) => { favoriteCount = favorite.favoriteCount; },
      onEnquiry: (draft) => { enquiryRequiresConfirmation = draft.requiresHumanConfirmation; },
    });

    expect([...tools.keys()]).toEqual([
      'search_properties',
      'get_property_details',
      'compare_properties',
      'save_favorite',
      'prepare_enquiry',
    ]);

    const searchResult = parsePayload(await tools.get('search_properties')!.execute({
      transactionType: 'rent',
      location: 'Thessaloniki',
      maxPrice: 750,
      minBedrooms: 2,
      maxBedrooms: 3,
      renovated: true,
    }));

    expect(searchResult.ok).toBe(true);
    expect(searchCount).toBeGreaterThanOrEqual(3);

    const comparisonResult = parsePayload(await tools.get('compare_properties')!.execute({
      propertyIds: ['thess-001', 'thess-002', 'thess-003'],
      priorities: ['price', 'metro_access'],
    }));

    expect(comparisonResult.ok).toBe(true);
    expect(comparedPropertyId).toBe('thess-002');

    const favoriteResult = parsePayload(await tools.get('save_favorite')!.execute({ propertyId: 'thess-002' }));
    expect(favoriteResult.ok).toBe(true);
    expect(favoriteCount).toBe(1);

    const enquiryResult = parsePayload(await tools.get('prepare_enquiry')!.execute({
      propertyId: 'thess-002',
      name: 'Demo Judge',
      messageIntent: 'I would like to arrange a viewing this week.',
    }));

    expect(enquiryResult.ok).toBe(true);
    expect(enquiryRequiresConfirmation).toBe(true);
    expect(activity.some((item) => item.includes('human confirmation is required'))).toBe(true);

    dispose();
  });
});
