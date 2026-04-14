import { create } from 'zustand';

export type ColorPalette = 'sufi' | 'gold' | 'ocean' | 'ember';

export interface VizConfig {
  particleDensity: number;
  animationSpeed: number;
  glowIntensity: number;
  patternDepth: number;
  colorPalette: ColorPalette;
  showParticles: boolean;
  showPatterns: boolean;
  trailLength: number;
}

interface VizConfigState extends VizConfig {
  set: <K extends keyof VizConfig>(key: K, value: VizConfig[K]) => void;
  reset: () => void;
}

const DEFAULTS: VizConfig = {
  particleDensity: 1.0,
  animationSpeed: 1.0,
  glowIntensity: 1.0,
  patternDepth: 1.0,
  colorPalette: 'sufi',
  showParticles: true,
  showPatterns: true,
  trailLength: 1.0,
};

export const useVizConfigStore = create<VizConfigState>((set) => ({
  ...DEFAULTS,
  set: (key, value) => set({ [key]: value }),
  reset: () => set(DEFAULTS),
}));

export const PALETTE_COLORS: Record<ColorPalette, { tier1Hue: number; tier2Hue: number; bg: string }> = {
  sufi:  { tier1Hue: 40,  tier2Hue: 180, bg: '#0a0a12' },
  gold:  { tier1Hue: 42,  tier2Hue: 42,  bg: '#0a0908' },
  ocean: { tier1Hue: 200, tier2Hue: 170, bg: '#060a10' },
  ember: { tier1Hue: 15,  tier2Hue: 280, bg: '#0c0808' },
};
