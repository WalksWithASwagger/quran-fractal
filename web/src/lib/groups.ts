export interface LetterGroup {
  id: number;
  latin: string;
  arabic: string;
  chapters: number[];
  count: number;
  div19: number;
  tier: 1 | 2;
}

export const GROUPS: LetterGroup[] = [
  { id: 0,  latin: 'ALM',   arabic: 'الم',      chapters: [2, 3, 29, 30, 31, 32],        count: 18_012, div19: 948,  tier: 1 },
  { id: 1,  latin: 'ALR',   arabic: 'الر',      chapters: [10, 11, 12, 14, 15],           count: 7_828,  div19: 412,  tier: 2 },
  { id: 2,  latin: 'ALMR',  arabic: 'المر',     chapters: [13],                            count: 1_178,  div19: 62,   tier: 2 },
  { id: 3,  latin: 'ALMS',  arabic: 'المص',     chapters: [7, 38],                         count: 4_997,  div19: 263,  tier: 1 },
  { id: 4,  latin: 'HM',    arabic: 'حم',       chapters: [40, 41, 42, 43, 44, 45, 46],   count: 2_147,  div19: 113,  tier: 1 },
  { id: 5,  latin: 'ASQ',   arabic: 'عسق',      chapters: [42],                            count: 209,    div19: 11,   tier: 1 },
  { id: 6,  latin: 'Q',     arabic: 'ق',        chapters: [50],                            count: 57,     div19: 3,    tier: 1 },
  { id: 7,  latin: 'KHYAS', arabic: 'كهيعص',    chapters: [19],                            count: 798,    div19: 42,   tier: 1 },
  { id: 8,  latin: 'TSM',   arabic: 'طسم',      chapters: [26, 28],                        count: 1_178,  div19: 62,   tier: 1 },
  { id: 9,  latin: 'YS',    arabic: 'يس',       chapters: [36],                            count: 285,    div19: 15,   tier: 1 },
  { id: 10, latin: 'N',     arabic: 'ن',        chapters: [68],                            count: 361,    div19: 19,   tier: 2 },
  { id: 11, latin: 'TH',    arabic: 'طه',       chapters: [20],                            count: 1_292,  div19: 68,   tier: 2 },
  { id: 12, latin: 'TS',    arabic: 'طس',       chapters: [27],                            count: 1_007,  div19: 53,   tier: 2 },
];

export const NUM_GROUPS = GROUPS.length; // 13
export const TOTAL = GROUPS.reduce((sum, g) => sum + g.count, 0); // 39,349
