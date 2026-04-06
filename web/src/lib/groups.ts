// The 13 Muqatta'at letter groups from the Quran
// Total: 39,349 = 19² × P(29) where P(29) = 109 is the 29th prime

export interface LetterGroup {
  id: number;
  latin: string;
  arabic: string;
  chapters: number[];
  count: number;
  div19: number;
  tier: 1 | 2;
}

export const GROUPS: readonly LetterGroup[] = Object.freeze([
  { id: 0, latin: 'ALM', arabic: 'الم', chapters: [2, 3, 29, 30, 31, 32], count: 18012, div19: 948, tier: 1 },
  { id: 1, latin: 'ALR', arabic: 'الر', chapters: [10, 11, 12, 14, 15], count: 7828, div19: 412, tier: 2 },
  { id: 2, latin: 'ALMR', arabic: 'المر', chapters: [13], count: 1178, div19: 62, tier: 2 },
  { id: 3, latin: 'ALMS', arabic: 'المص', chapters: [7, 38], count: 4997, div19: 263, tier: 1 },
  { id: 4, latin: 'HM', arabic: 'حم', chapters: [40, 41, 42, 43, 44, 45, 46], count: 2147, div19: 113, tier: 1 },
  { id: 5, latin: 'ASQ', arabic: 'عسق', chapters: [42], count: 209, div19: 11, tier: 1 },
  { id: 6, latin: 'Q', arabic: 'ق', chapters: [50], count: 57, div19: 3, tier: 1 },
  { id: 7, latin: 'KHYAS', arabic: 'كهيعص', chapters: [19], count: 798, div19: 42, tier: 1 },
  { id: 8, latin: 'TSM', arabic: 'طسم', chapters: [26, 28], count: 1178, div19: 62, tier: 1 },
  { id: 9, latin: 'YS', arabic: 'يس', chapters: [36], count: 285, div19: 15, tier: 1 },
  { id: 10, latin: 'N', arabic: 'ن', chapters: [68], count: 361, div19: 19, tier: 2 },
  { id: 11, latin: 'TH', arabic: 'طه', chapters: [20], count: 1292, div19: 68, tier: 2 },
  { id: 12, latin: 'TS', arabic: 'طس', chapters: [27], count: 1007, div19: 53, tier: 2 },
]);

// Mathematical constants
export const TOTAL = 39349;
export const FACTOR_19SQ = 361; // 19²
export const PRIME_29 = 109; // P(29), the 29th prime
export const NUM_CHAPTERS = 29;
export const NUM_GROUPS = 13;

// Tier descriptions
export const TIER_DESCRIPTIONS = {
  1: 'Encoding Independent — same count regardless of text edition',
  2: 'Encoding Dependent — requires specific orthographic variants',
} as const;

// Get group color based on tier
export function getGroupColor(tier: 1 | 2, alpha = 1): string {
  if (tier === 1) {
    return `rgba(245, 208, 96, ${alpha})`; // Gold
  }
  return `rgba(96, 245, 224, ${alpha})`; // Teal
}

// Format number with commas
export function formatNumber(n: number): string {
  return n.toLocaleString();
}
