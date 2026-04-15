import { create } from 'zustand';

interface CountAlongState {
  active: boolean;
  groupId: number | null;
  currentIndex: number;
  userCounts: Record<string, number>; // "surah:ayah" -> user count
  verifiedCounts: Record<string, boolean>; // "surah:ayah" -> matches expected

  // Actions
  start: (groupId: number) => void;
  stop: () => void;
  submitCount: (surah: number, ayah: number, count: number, expected: number) => void;
  setCurrentIndex: (index: number) => void;
  reset: () => void;
}

export const useCountAlongStore = create<CountAlongState>((set) => ({
  active: false,
  groupId: null,
  currentIndex: 0,
  userCounts: {},
  verifiedCounts: {},

  start: (groupId) =>
    set({
      active: true,
      groupId,
      currentIndex: 0,
      userCounts: {},
      verifiedCounts: {},
    }),

  stop: () =>
    set({
      active: false,
      groupId: null,
    }),

  submitCount: (surah, ayah, count, expected) => {
    const key = `${surah}:${ayah}`;
    set((state) => ({
      userCounts: { ...state.userCounts, [key]: count },
      verifiedCounts: { ...state.verifiedCounts, [key]: count === expected },
    }));
  },

  setCurrentIndex: (index) =>
    set({ currentIndex: index }),

  reset: () =>
    set({
      active: false,
      groupId: null,
      currentIndex: 0,
      userCounts: {},
      verifiedCounts: {},
    }),
}));

// Selector for progress stats
export function useCountAlongProgress() {
  const userCounts = useCountAlongStore((s) => s.userCounts);
  const verifiedCounts = useCountAlongStore((s) => s.verifiedCounts);

  const counted = Object.keys(userCounts).length;
  const correct = Object.values(verifiedCounts).filter(Boolean).length;

  return { counted, correct };
}
