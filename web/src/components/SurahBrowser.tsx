'use client';

import { useMemo, useState } from 'react';
import { useQuranData, useGroups } from '@/stores/quran-data';
import { useResearchStore } from '@/stores/research';

export default function SurahBrowser() {
  const data = useQuranData();
  const groups = useGroups();
  const { selectedSurah, selectSurah, selectedGroupId, selectGroup } = useResearchStore();
  const [filterMuqattaat, setFilterMuqattaat] = useState(true);

  const surahs = useMemo(() => {
    if (!data) return [];
    return filterMuqattaat
      ? data.surahs.filter((s) => s.isMuqattaat)
      : data.surahs;
  }, [data, filterMuqattaat]);

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-[#0d0d18] border-r border-amber-500/15">
      {/* Group filter chips */}
      <div className="p-3 border-b border-amber-500/10">
        <h3 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-2">Groups</h3>
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g) => {
            const active = selectedGroupId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => selectGroup(active ? null : g.id)}
                className={`px-2 py-1 text-xs rounded-md border transition-all ${
                  active
                    ? g.tier === 1
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                      : 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-amber-500/30'
                }`}
                title={`${g.name} — ${g.arabic}`}
              >
                <span className="font-arabic">{g.arabic}</span>
                <span className="ml-1 text-[10px] opacity-70">{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="px-3 py-2 border-b border-amber-500/10 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {surahs.length} surah{surahs.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setFilterMuqattaat(!filterMuqattaat)}
          className={`text-xs px-2 py-0.5 rounded border transition-all ${
            filterMuqattaat
              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
              : 'border-white/10 text-gray-500'
          }`}
        >
          Muqatta&apos;at only
        </button>
      </div>

      {/* Surah list */}
      <div className="flex-1 overflow-y-auto">
        {surahs.map((s) => {
          const surahGroups = groups.filter((g) => g.surahs.includes(s.number));
          const isSelected = selectedSurah === s.number;
          const isGroupFiltered =
            selectedGroupId !== null &&
            !surahGroups.some((g) => g.id === selectedGroupId);

          if (isGroupFiltered) return null;

          return (
            <button
              key={s.number}
              onClick={() => selectSurah(s.number)}
              className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-l-2 border-l-amber-400'
                  : 'hover:bg-white/5 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400/50 text-xs font-mono w-6 text-right">
                    {s.number}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-amber-300' : 'text-gray-300'}`}>
                    Surah {s.number}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{s.verseCount}v</span>
              </div>
              {surahGroups.length > 0 && (
                <div className="flex gap-1 mt-1 ml-8">
                  {surahGroups.map((g) => (
                    <span
                      key={g.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        g.tier === 1
                          ? 'bg-amber-500/15 text-amber-400/80'
                          : 'bg-cyan-500/15 text-cyan-400/80'
                      }`}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
