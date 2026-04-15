'use client';

import { useState } from 'react';
import { useGroup } from '@/stores/quran-data';
import { useResearchStore } from '@/stores/research';
import { useCountAlongStore } from '@/stores/count-along';
import CountAlongMode from './CountAlongMode';

export default function GroupDetailPanel() {
  const [showCountAlong, setShowCountAlong] = useState(false);
  const { selectedGroupId, selectSurah, selectGroup } = useResearchStore();
  const group = useGroup(selectedGroupId ?? -1);
  const startCountAlong = useCountAlongStore((s) => s.start);

  const handleStartCountAlong = () => {
    if (group) {
      startCountAlong(group.id);
      setShowCountAlong(true);
    }
  };

  const handleCloseCountAlong = () => {
    setShowCountAlong(false);
  };

  if (!group) {
    return (
      <div className="p-4 text-center text-gray-600 text-sm">
        Select a group to see its breakdown
      </div>
    );
  }

  const tierColor = group.tier === 1;

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center">
        <button
          onClick={() => selectGroup(null)}
          className="absolute top-2 right-3 text-gray-600 hover:text-gray-400 text-sm"
        >
          &times;
        </button>
        <div
          className="text-4xl mb-1 font-arabic"
          dir="rtl"
          style={{
            color: tierColor ? '#c9a84c' : '#60f5e0',
            textShadow: tierColor
              ? '0 0 20px rgba(201,168,76,0.4)'
              : '0 0 20px rgba(96,245,224,0.4)',
          }}
        >
          {group.arabic}
        </div>
        <div className="text-sm font-semibold text-gray-300">
          {group.name} — Group {group.id + 1} of 13
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Letter Count" value={group.count.toLocaleString()} />
        <Stat label="÷ 19" value={group.div19.toLocaleString()} />
        <Stat
          label="Tier"
          value={`${group.tier} — ${group.tier === 1 ? 'Independent' : 'Dependent'}`}
        />
        <Stat label="Edition" value={group.edition} />
      </div>

      {/* Per-surah breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-2">
          Per-Surah Breakdown
        </h4>
        <div className="space-y-1">
          {group.perSurah.map((ps) => {
            const pct = (ps.total / group.count) * 100;
            return (
              <button
                key={ps.surah}
                onClick={() => selectSurah(ps.surah)}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    Surah {ps.surah}
                  </span>
                  <span className="text-xs text-gray-500">
                    {ps.total.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tierColor ? 'bg-amber-500/60' : 'bg-cyan-500/60'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                  <span>{pct.toFixed(1)}%</span>
                  {ps.alif > 0 && (
                    <span>
                      alif: {ps.alif} · cons: {ps.consonants}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification badge */}
      <div className="text-center pt-2">
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
            group.verified
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}
        >
          {group.verified
            ? `✓ Verified: ${group.count.toLocaleString()} ÷ 19 = ${group.div19.toLocaleString()}`
            : '✗ Verification failed'}
        </span>
      </div>

      {/* Count Along button */}
      <button
        onClick={handleStartCountAlong}
        className="w-full mt-2 px-4 py-2.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Count Along Mode
      </button>

      {/* Count Along modal */}
      {showCountAlong && group && (
        <CountAlongMode groupId={group.id} onClose={handleCloseCountAlong} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-2.5">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-gray-200 mt-0.5">{value}</div>
    </div>
  );
}
