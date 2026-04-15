'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useCountAlongStore, useCountAlongProgress } from '@/stores/count-along';
import { useGroup, useVerses } from '@/stores/quran-data';
import type { Verse } from '@/lib/types';

interface CountAlongModeProps {
  groupId: number;
  onClose: () => void;
}

export default function CountAlongMode({ groupId, onClose }: CountAlongModeProps) {
  const group = useGroup(groupId);
  const allVerses = useVerses();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentIndex,
    setCurrentIndex,
    submitCount,
    userCounts,
    verifiedCounts,
  } = useCountAlongStore();

  const { counted, correct } = useCountAlongProgress();

  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Get verses for this group's surahs that have letter counts
  const groupVerses = useMemo(() => {
    if (!group) return [];
    return allVerses.filter(
      (v: Verse) => group.surahs.includes(v.s) && v.lc && v.lc[String(groupId)] !== undefined
    );
  }, [allVerses, group, groupId]);

  const currentVerse = groupVerses[currentIndex];
  const expectedCount = currentVerse?.lc?.[String(groupId)] ?? 0;
  const verseKey = currentVerse ? `${currentVerse.s}:${currentVerse.a}` : '';
  const alreadyCounted = verseKey in userCounts;

  // Focus input when verse changes
  useEffect(() => {
    if (!showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, showResult]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, onClose]);

  const handleSubmit = () => {
    if (!currentVerse) return;
    const count = parseInt(userInput, 10);
    if (isNaN(count) || count < 0) return;

    submitCount(currentVerse.s, currentVerse.a, count, expectedCount);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < groupVerses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setShowResult(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserInput('');
      setShowResult(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  if (!group || groupVerses.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a12] border border-amber-500/30 rounded-xl p-6 text-center">
          <p className="text-gray-400">Loading verses...</p>
        </div>
      </div>
    );
  }

  const progressPercent = (counted / groupVerses.length) * 100;
  const isComplete = counted === groupVerses.length;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a12] border border-amber-500/30 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-amber-400">
              Count Along: <span className="font-arabic">{group.arabic}</span>
            </h2>
            <p className="text-gray-500 text-sm">
              {group.name} &mdash; Verify letter counts yourself
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl leading-none p-2"
            title="Close (Escape)"
          >
            &times;
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{counted} / {groupVerses.length} verses counted</span>
            <span className="text-green-400">{correct} correct</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {isComplete ? (
          // Completion screen
          <div className="text-center py-8">
            <div className="text-5xl mb-4">
              {correct === counted ? '🎉' : '📊'}
            </div>
            <h3 className="text-2xl text-amber-400 mb-2">
              {correct === counted ? 'Perfect Score!' : 'Session Complete'}
            </h3>
            <p className="text-gray-400 mb-4">
              You correctly counted {correct} out of {counted} verses
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Accuracy: {((correct / counted) * 100).toFixed(1)}%
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-amber-500/30 border border-amber-400 rounded-lg text-amber-300 font-semibold hover:bg-amber-500/40"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Verse display */}
            <div className="bg-black/50 rounded-lg p-4 mb-6">
              <div className="text-amber-400 text-sm mb-2 flex justify-between">
                <span>Surah {currentVerse.s}, Verse {currentVerse.a}</span>
                {alreadyCounted && !showResult && (
                  <span className={verifiedCounts[verseKey] ? 'text-green-400' : 'text-red-400'}>
                    {verifiedCounts[verseKey] ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>
              <div
                className="text-2xl text-white text-right leading-relaxed font-arabic"
                dir="rtl"
              >
                {currentVerse.t}
              </div>
              <div className="mt-4 text-gray-400 text-sm">
                Count these letters: <span className="text-amber-300 font-arabic text-lg">{group.arabic}</span>
                <span className="text-gray-600 ml-2">({group.name})</span>
              </div>
            </div>

            {/* Input area */}
            {!showResult ? (
              <div className="flex gap-4 items-center mb-6">
                <input
                  ref={inputRef}
                  type="number"
                  min="0"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your count"
                  className="flex-1 bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white text-center text-xl focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSubmit}
                  disabled={userInput === ''}
                  className="px-6 py-3 bg-amber-500/30 border border-amber-400 rounded-lg text-amber-300 font-semibold hover:bg-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div
                className={`text-center p-4 rounded-lg mb-6 ${
                  verifiedCounts[verseKey]
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                {verifiedCounts[verseKey] ? (
                  <div className="text-green-400 text-lg">
                    ✓ Correct! The count is <strong>{expectedCount}</strong>.
                  </div>
                ) : (
                  <div className="text-red-400 text-lg">
                    ✗ Not quite. You counted <strong>{userCounts[verseKey]}</strong>,
                    but the actual count is <strong>{expectedCount}</strong>.
                  </div>
                )}
                <button
                  onClick={handleNext}
                  className="mt-4 px-4 py-2 bg-white/10 rounded text-white hover:bg-white/20"
                >
                  Next Verse →
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center text-sm">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-gray-500">
                Verse {currentIndex + 1} of {groupVerses.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex >= groupVerses.length - 1}
                className="px-4 py-2 text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
