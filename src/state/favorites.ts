const STORAGE_KEY = 'freespirits-webmcp-favorites';

const readIds = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const writeIds = (ids: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be unavailable in restricted browser contexts; the tool still reports safely.
  }
};

export interface FavoriteResult {
  propertyId: string;
  saved: boolean;
  alreadySaved: boolean;
  favoriteCount: number;
}

export const favoriteStore = {
  getIds: readIds,
  save(propertyId: string): FavoriteResult {
    const current = readIds();
    const alreadySaved = current.includes(propertyId);
    const next = alreadySaved ? current : [...current, propertyId];
    if (!alreadySaved) writeIds(next);
    return { propertyId, saved: true, alreadySaved, favoriteCount: next.length };
  },
};
