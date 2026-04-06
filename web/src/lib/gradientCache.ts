/**
 * GradientCache - LRU cache for canvas gradients
 *
 * Canvas gradient creation is expensive (~65 gradients/frame at 60fps = 3,900/sec).
 * This cache reduces CPU load by reusing gradients with similar parameters.
 *
 * Target: 80%+ cache hit rate, 30-40% CPU reduction
 */

type GradientKey = string;

interface CacheEntry {
  gradient: CanvasGradient;
  lastUsed: number;
}

export class GradientCache {
  private cache: Map<GradientKey, CacheEntry> = new Map();
  private ctx: CanvasRenderingContext2D | null = null;
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Set the canvas context for gradient creation
   * Must be called when canvas context changes
   */
  setContext(ctx: CanvasRenderingContext2D): void {
    // If context changes, clear cache (gradients are context-bound)
    if (this.ctx !== ctx) {
      this.cache.clear();
      this.ctx = ctx;
    }
  }

  /**
   * Get or create a radial gradient
   * Coordinates are rounded to reduce cache misses
   */
  getRadialGradient(
    x: number,
    y: number,
    innerR: number,
    outerR: number,
    stops: Array<[number, string]>
  ): CanvasGradient | null {
    if (!this.ctx) return null;

    // Round coordinates to reduce cache misses from floating point drift
    const rx = Math.round(x);
    const ry = Math.round(y);
    const ri = Math.round(innerR * 10) / 10;
    const ro = Math.round(outerR * 10) / 10;

    // Create cache key
    const stopsKey = stops.map(([offset, color]) => `${offset.toFixed(2)}:${color}`).join('|');
    const key = `r:${rx},${ry},${ri},${ro}:${stopsKey}`;

    // Check cache
    const cached = this.cache.get(key);
    if (cached) {
      this.hits++;
      cached.lastUsed = Date.now();
      return cached.gradient;
    }

    // Create new gradient
    this.misses++;
    const gradient = this.ctx.createRadialGradient(x, y, innerR, x, y, outerR);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));

    // Add to cache with LRU eviction
    this.addToCache(key, gradient);

    return gradient;
  }

  /**
   * Get or create a linear gradient
   */
  getLinearGradient(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: Array<[number, string]>
  ): CanvasGradient | null {
    if (!this.ctx) return null;

    // Round coordinates
    const rx1 = Math.round(x1);
    const ry1 = Math.round(y1);
    const rx2 = Math.round(x2);
    const ry2 = Math.round(y2);

    // Create cache key
    const stopsKey = stops.map(([offset, color]) => `${offset.toFixed(2)}:${color}`).join('|');
    const key = `l:${rx1},${ry1},${rx2},${ry2}:${stopsKey}`;

    // Check cache
    const cached = this.cache.get(key);
    if (cached) {
      this.hits++;
      cached.lastUsed = Date.now();
      return cached.gradient;
    }

    // Create new gradient
    this.misses++;
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));

    // Add to cache
    this.addToCache(key, gradient);

    return gradient;
  }

  /**
   * Add entry to cache with LRU eviction
   */
  private addToCache(key: GradientKey, gradient: CanvasGradient): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      let oldestKey: GradientKey | null = null;
      let oldestTime = Infinity;

      for (const [k, entry] of this.cache) {
        if (entry.lastUsed < oldestTime) {
          oldestTime = entry.lastUsed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      gradient,
      lastUsed: Date.now(),
    });
  }

  /**
   * Clear the entire cache
   * Call when viewport/geometry changes significantly
   */
  invalidate(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

// Singleton instance for the visualization
export const gradientCache = new GradientCache(150);

/**
 * Helper to create common gradient patterns used in the visualization
 */
export const gradientPatterns = {
  /**
   * Glow effect gradient (center bright, fading edges)
   */
  glow: (
    cache: GradientCache,
    x: number,
    y: number,
    radius: number,
    color: string,
    alpha = 0.5
  ): CanvasGradient | null => {
    // Parse color to extract RGB
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return null;

    const [, r, g, b] = rgbMatch;

    return cache.getRadialGradient(x, y, 0, radius, [
      [0, `rgba(${r},${g},${b},${alpha})`],
      [0.5, `rgba(${r},${g},${b},${alpha * 0.5})`],
      [1, `rgba(${r},${g},${b},0)`],
    ]);
  },

  /**
   * Aurora-style gradient (deep blue to warm purple)
   */
  aurora: (
    cache: GradientCache,
    cx: number,
    cy: number,
    radius: number,
    warmth: number // 0-1, how warm the colors should be
  ): CanvasGradient | null => {
    const coolColor = `rgba(10,10,18,1)`;
    const warmColor = `rgba(${26 + warmth * 10},${15 + warmth * 5},${37 + warmth * 8},1)`;

    return cache.getRadialGradient(cx, cy, 0, radius, [
      [0, warmColor],
      [0.5, `rgba(15,15,25,1)`],
      [1, coolColor],
    ]);
  },

  /**
   * Tier 1 gold glow
   */
  tier1Glow: (
    cache: GradientCache,
    x: number,
    y: number,
    radius: number,
    intensity = 1
  ): CanvasGradient | null => {
    return cache.getRadialGradient(x, y, 0, radius, [
      [0, `rgba(245,208,96,${0.6 * intensity})`],
      [0.4, `rgba(201,168,76,${0.3 * intensity})`],
      [1, `rgba(201,168,76,0)`],
    ]);
  },

  /**
   * Tier 2 teal glow
   */
  tier2Glow: (
    cache: GradientCache,
    x: number,
    y: number,
    radius: number,
    intensity = 1
  ): CanvasGradient | null => {
    return cache.getRadialGradient(x, y, 0, radius, [
      [0, `rgba(96,245,224,${0.5 * intensity})`],
      [0.4, `rgba(96,245,224,${0.25 * intensity})`],
      [1, `rgba(96,245,224,0)`],
    ]);
  },
};
