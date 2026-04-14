'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useVerses, useGroups } from '@/stores/quran-data';
import { useResearchStore } from '@/stores/research';
import { getLetterSetsForSurah } from '@/lib/letter-sets';
import type { Verse } from '@/lib/types';

function HighlightedText({
  text,
  highlightChars,
  tier,
}: {
  text: string;
  highlightChars: Set<string>;
  tier: 1 | 2;
}) {
  if (highlightChars.size === 0) return <span>{text}</span>;

  const segments: { text: string; highlighted: boolean }[] = [];
  let current = '';
  let currentHighlighted = false;

  for (const char of text) {
    const isHighlighted = highlightChars.has(char);
    if (isHighlighted !== currentHighlighted && current) {
      segments.push({ text: current, highlighted: currentHighlighted });
      current = '';
    }
    current += char;
    currentHighlighted = isHighlighted;
  }
  if (current) segments.push({ text: current, highlighted: currentHighlighted });

  return (
    <span>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <span
            key={i}
            className={
              tier === 1
                ? 'text-amber-400 bg-amber-500/10 rounded-sm'
                : 'text-cyan-400 bg-cyan-500/10 rounded-sm'
            }
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

function VerseRow({
  verse,
  highlightChars,
  tier,
  isSelected,
  onSelect,
}: {
  verse: Verse;
  highlightChars: Set<string>;
  tier: 1 | 2;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const totalCount = verse.lc
    ? Object.values(verse.lc).reduce((s, v) => s + v, 0)
    : 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-right px-4 py-3 border-b border-white/5 transition-all group ${
        isSelected
          ? 'bg-amber-500/10 border-l-2 border-l-amber-400'
          : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Ayah number */}
        <div className="flex-shrink-0 w-10 text-left">
          <span className="text-amber-400/40 text-xs font-mono">{verse.a}</span>
          {totalCount > 0 && (
            <div className="text-[10px] text-amber-400/30 mt-0.5">{totalCount}</div>
          )}
        </div>

        {/* Verse text */}
        <div
          className="flex-1 text-lg leading-loose text-gray-200"
          dir="rtl"
          style={{ fontFamily: 'Amiri, serif' }}
        >
          <HighlightedText
            text={verse.t}
            highlightChars={highlightChars}
            tier={tier}
          />
        </div>
      </div>
    </button>
  );
}

export default function VerseReader() {
  const { selectedSurah, selectedAyah, selectVerse, selectedGroupId } =
    useResearchStore();
  const groups = useGroups();
  const verses = useVerses(selectedSurah ?? undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const { highlightChars, primaryTier } = useMemo(() => {
    if (!selectedSurah) return { highlightChars: new Set<string>(), primaryTier: 1 as const };
    const sets = getLetterSetsForSurah(selectedSurah, groups);

    const relevant =
      selectedGroupId !== null
        ? sets.filter((s) => s.groupId === selectedGroupId)
        : sets;

    const merged = new Set<string>();
    for (const s of relevant) {
      for (const c of s.chars) merged.add(c);
    }

    const firstGroup = relevant[0]
      ? groups.find((g) => g.id === relevant[0].groupId)
      : null;
    const tier = (firstGroup?.tier ?? 1) as 1 | 2;

    return { highlightChars: merged, primaryTier: tier };
  }, [selectedSurah, selectedGroupId, groups]);

  useEffect(() => {
    if (selectedAyah && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedAyah]);

  const handleSelect = useCallback(
    (v: Verse) => {
      selectVerse(v.s, v.a);
    },
    [selectVerse]
  );

  if (!selectedSurah) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">&#xFD3F;</div>
          <p className="text-sm">Select a surah to begin reading</p>
        </div>
      </div>
    );
  }

  const surahGroups = groups.filter((g) => g.surahs.includes(selectedSurah));

  return (
    <div className="flex flex-col h-full">
      {/* Surah header */}
      <div className="px-4 py-3 border-b border-amber-500/15 bg-[#0d0d18]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-amber-400">
              Surah {selectedSurah}
            </h2>
            <p className="text-xs text-gray-500">{verses.length} verses</p>
          </div>
          <div className="flex gap-1.5">
            {surahGroups.map((g) => (
              <span
                key={g.id}
                className={`px-2 py-1 text-xs rounded-md border ${
                  g.tier === 1
                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                }`}
              >
                <span className="font-arabic">{g.arabic}</span>
                <span className="ml-1.5 opacity-60">{g.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Verses */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {verses.map((v) => {
          const isSelected = selectedAyah === v.a;
          return (
            <div key={`${v.s}:${v.a}`} ref={isSelected ? selectedRef : undefined}>
              <VerseRow
                verse={v}
                highlightChars={highlightChars}
                tier={primaryTier}
                isSelected={isSelected}
                onSelect={() => handleSelect(v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
