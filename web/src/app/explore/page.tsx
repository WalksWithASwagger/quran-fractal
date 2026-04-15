'use client';

import { useState, useCallback } from 'react';
import { DataLoader } from '@/lib/data-provider';
import FractalVisualization from '@/components/FractalVisualization';
import SurahBrowser from '@/components/SurahBrowser';
import VerseReader from '@/components/VerseReader';
import GroupDetailPanel from '@/components/GroupDetailPanel';
import VizConfigPanel from '@/components/VizConfigPanel';
import { useResearchStore } from '@/stores/research';
import type { LetterGroup } from '@/lib/types';

function ExploreLayout() {
  const [vizCollapsed, setVizCollapsed] = useState(false);
  const { selectedGroupId, selectGroup, selectSurah } = useResearchStore();

  const handleGroupSelect = useCallback(
    (group: LetterGroup | null) => {
      selectGroup(group?.id ?? null);
      if (group && group.surahs.length > 0) {
        selectSurah(group.surahs[0]);
      }
    },
    [selectGroup, selectSurah]
  );

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-[#0a0a12] text-gray-200 overflow-hidden">
      {/* Left: Surah browser */}
      <div className="h-48 lg:h-auto lg:w-56 flex-shrink-0 overflow-hidden border-b lg:border-b-0 border-amber-500/10">
        <SurahBrowser />
      </div>

      {/* Center: Verse reader */}
      <div className="flex-1 min-h-0 flex flex-col min-w-0 lg:border-x border-amber-500/10">
        <VerseReader />
      </div>

      {/* Right: Viz + Group detail */}
      <div
        className={`flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-amber-500/10 transition-all ${
          vizCollapsed ? 'h-10 lg:h-auto lg:w-10' : 'h-[45vh] lg:h-auto lg:w-[420px]'
        }`}
      >
        {vizCollapsed ? (
          <button
            onClick={() => setVizCollapsed(false)}
            className="h-full w-full flex items-center justify-center text-amber-400/50 hover:text-amber-400 transition-colors"
            title="Expand visualization"
          >
            <svg className="w-4 h-4 lg:rotate-0 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <>
            {/* Viz panel */}
            <div className="relative h-[45%] border-b border-amber-500/10">
              <button
                onClick={() => setVizCollapsed(true)}
                className="absolute top-2 left-2 z-20 p-1 rounded bg-black/50 text-gray-500 hover:text-amber-400 transition-colors"
                title="Collapse visualization"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <FractalVisualization
                showControls={false}
                className="h-full"
                onGroupSelect={handleGroupSelect}
              />
            </div>

            {/* Group detail panel */}
            <div className="flex-1 overflow-y-auto relative">
              {selectedGroupId !== null ? (
                <GroupDetailPanel />
              ) : (
                <div className="p-6 text-center text-gray-600 text-sm space-y-3">
                  <div
                    className="text-3xl text-amber-400/20 font-arabic"
                  >
                    ١٩
                  </div>
                  <p>Click a group chip or visualization node to see its breakdown</p>
                  <div className="pt-4 space-y-1 text-xs text-gray-700">
                    <div>39,349 = 19&sup2; &times; P(29)</div>
                    <div className="text-amber-400/30">&ldquo;Don&apos;t believe me. Count.&rdquo;</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <VizConfigPanel />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <DataLoader>
      <ExploreLayout />
    </DataLoader>
  );
}
