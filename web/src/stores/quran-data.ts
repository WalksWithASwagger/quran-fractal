import { create } from 'zustand';
import type { QuranData, LetterGroup, SurahInfo, Verse } from '@/lib/types';

interface QuranDataState {
  data: QuranData | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useQuranDataStore = create<QuranDataState>((set, get) => ({
  data: null,
  loading: false,
  error: null,

  load: async () => {
    if (get().data || get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/data/quran-data.json');
      if (!res.ok) throw new Error(`Failed to load quran data: ${res.status}`);
      const data: QuranData = await res.json();
      set({ data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));

export function useQuranData(): QuranData | null {
  const data = useQuranDataStore((s) => s.data);
  return data;
}

export function useGroups(): LetterGroup[] {
  const data = useQuranDataStore((s) => s.data);
  return data?.groups ?? [];
}

export function useGroup(id: number): LetterGroup | null {
  const groups = useGroups();
  return groups[id] ?? null;
}

export function useSurahs(): SurahInfo[] {
  const data = useQuranDataStore((s) => s.data);
  return data?.surahs ?? [];
}

export function useSurah(number: number): SurahInfo | undefined {
  const surahs = useSurahs();
  return surahs.find((s) => s.number === number);
}

export function useVerses(surahNumber?: number): Verse[] {
  const data = useQuranDataStore((s) => s.data);
  if (!data) return [];
  if (surahNumber === undefined) return data.verses;
  return data.verses.filter((v) => v.s === surahNumber);
}
