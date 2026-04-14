/**
 * View Registry — pluggable visualization mode system.
 *
 * Each view module exports a ViewDefinition. To add a new visualization:
 * 1. Create a file in this directory exporting a ViewDefinition
 * 2. Import and register it here
 *
 * The existing FractalVisualization component uses its built-in renderers
 * for mandala/fractal/constellation/flow. This registry enables future
 * standalone views without modifying the monolithic component.
 */

import type { LetterGroup } from '@/lib/groups';

export interface ViewState {
  animTime: number;
  W: number;
  H: number;
  cx: number;
  cy: number;
  radius: number;
  hoveredGroup: number | null;
  lockedGroup: number | null;
}

export interface GroupPosition {
  x: number;
  y: number;
  r: number;
}

export interface ViewConfig {
  animationSpeed: number;
  glowIntensity: number;
  patternDepth: number;
  colorPalette: string;
}

export interface ViewDefinition {
  id: string;
  name: string;
  description: string;
  render: (
    ctx: CanvasRenderingContext2D,
    state: ViewState,
    groups: LetterGroup[],
    positions: GroupPosition[],
    config: ViewConfig
  ) => void;
  computePositions?: (
    state: ViewState,
    groups: LetterGroup[],
    total: number
  ) => { targetX: number; targetY: number; targetR: number }[];
}

const views: Map<string, ViewDefinition> = new Map();

export function registerView(view: ViewDefinition): void {
  views.set(view.id, view);
}

export function getView(id: string): ViewDefinition | undefined {
  return views.get(id);
}

export function getAllViews(): ViewDefinition[] {
  return Array.from(views.values());
}

export const BUILT_IN_VIEWS = ['mandala', 'fractal', 'constellation', 'flow'] as const;
export type BuiltInView = (typeof BUILT_IN_VIEWS)[number];
