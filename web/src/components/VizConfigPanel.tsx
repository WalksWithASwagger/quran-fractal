'use client';

import { useState } from 'react';
import { useVizConfigStore, type ColorPalette } from '@/stores/viz-config';

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 2,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-amber-400/70 font-mono">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-amber-400"
      />
    </div>
  );
}

const PALETTES: { id: ColorPalette; label: string; preview: string }[] = [
  { id: 'sufi', label: 'Sufi', preview: 'bg-gradient-to-r from-amber-500 to-cyan-400' },
  { id: 'gold', label: 'Gold', preview: 'bg-gradient-to-r from-amber-600 to-yellow-400' },
  { id: 'ocean', label: 'Ocean', preview: 'bg-gradient-to-r from-blue-500 to-teal-400' },
  { id: 'ember', label: 'Ember', preview: 'bg-gradient-to-r from-orange-600 to-purple-500' },
];

export default function VizConfigPanel() {
  const [open, setOpen] = useState(false);
  const config = useVizConfigStore();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-4 right-4 z-50 p-2.5 rounded-full border transition-all ${
          open
            ? 'bg-amber-500/20 border-amber-400 text-amber-400'
            : 'bg-black/60 border-white/10 text-gray-500 hover:text-amber-400'
        }`}
        title="Visual settings"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-14 right-4 z-50 w-72 bg-[#0d0d18]/95 border border-amber-500/20 rounded-xl p-4 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-400">Visual Settings</h3>
            <button
              onClick={() => config.reset()}
              className="text-[10px] text-gray-500 hover:text-amber-400 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Color palette */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Palette</div>
            <div className="grid grid-cols-4 gap-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => config.set('colorPalette', p.id)}
                  className={`p-1.5 rounded-md border text-center transition-all ${
                    config.colorPalette === p.id
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <div className={`h-2 rounded-full mb-1 ${p.preview}`} />
                  <span className="text-[10px] text-gray-400">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <Slider
            label="Particle Density"
            value={config.particleDensity}
            onChange={(v) => config.set('particleDensity', v)}
          />
          <Slider
            label="Animation Speed"
            value={config.animationSpeed}
            onChange={(v) => config.set('animationSpeed', v)}
          />
          <Slider
            label="Glow Intensity"
            value={config.glowIntensity}
            onChange={(v) => config.set('glowIntensity', v)}
          />
          <Slider
            label="Pattern Depth"
            value={config.patternDepth}
            onChange={(v) => config.set('patternDepth', v)}
            max={3}
          />
          <Slider
            label="Trail Length"
            value={config.trailLength}
            onChange={(v) => config.set('trailLength', v)}
          />

          {/* Toggles */}
          <div className="flex gap-3">
            <Toggle
              label="Particles"
              value={config.showParticles}
              onChange={(v) => config.set('showParticles', v)}
            />
            <Toggle
              label="Patterns"
              value={config.showPatterns}
              onChange={(v) => config.set('showPatterns', v)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex-1 px-3 py-1.5 text-xs rounded-md border transition-all ${
        value
          ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
          : 'border-white/10 text-gray-600'
      }`}
    >
      {label}
    </button>
  );
}
