import { create } from 'zustand';

interface ResearchState {
  selectedGroupId: number | null;
  selectedSurah: number | null;
  selectedAyah: number | null;
  enabledGroups: Set<number>;
  hoveredGroupId: number | null;

  selectGroup: (id: number | null) => void;
  selectSurah: (surah: number | null) => void;
  selectVerse: (surah: number, ayah: number) => void;
  clearSelection: () => void;
  toggleGroup: (id: number) => void;
  setAllGroups: (ids: number[]) => void;
  setHoveredGroup: (id: number | null) => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  selectedGroupId: null,
  selectedSurah: null,
  selectedAyah: null,
  enabledGroups: new Set(Array.from({ length: 13 }, (_, i) => i)),
  hoveredGroupId: null,

  selectGroup: (id) =>
    set((s) => {
      if (id === s.selectedGroupId) return { selectedGroupId: null };
      return { selectedGroupId: id };
    }),

  selectSurah: (surah) =>
    set({ selectedSurah: surah, selectedAyah: null }),

  selectVerse: (surah, ayah) =>
    set({ selectedSurah: surah, selectedAyah: ayah }),

  clearSelection: () =>
    set({ selectedGroupId: null, selectedSurah: null, selectedAyah: null }),

  toggleGroup: (id) =>
    set((s) => {
      const next = new Set(s.enabledGroups);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { enabledGroups: next };
    }),

  setAllGroups: (ids) =>
    set({ enabledGroups: new Set(ids) }),

  setHoveredGroup: (id) =>
    set({ hoveredGroupId: id }),
}));
