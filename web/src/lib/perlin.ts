/**
 * Simplex Noise and Flow Field implementation
 *
 * Creates organic, flowing motion for particles using
 * coherent noise. Based on Stefan Gustavson's simplex noise.
 *
 * The flow field creates a mystical, living atmosphere
 * that enhances the sacred geometry visualization.
 */

// Gradient vectors for 2D simplex noise
const GRAD3 = [
  { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 },
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
  { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 },
];

// Skewing and unskewing factors for 2D
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export class SimplexNoise {
  private perm: Uint8Array;
  private gradP: Array<{ x: number; y: number }>;

  constructor(seed = Math.random() * 65536) {
    this.perm = new Uint8Array(512);
    this.gradP = new Array(512);

    // Initialize permutation table with seed
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Fisher-Yates shuffle with seeded random
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }

    // Extend and create gradient lookup
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.gradP[i] = GRAD3[this.perm[i] % 12];
    }
  }

  /**
   * 2D Simplex noise
   * Returns a value between -1 and 1
   */
  noise2D(x: number, y: number): number {
    // Skew input space to determine simplex cell
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    // Unskew back to (x, y) space
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;

    // Distances from cell origin
    const x0 = x - X0;
    const y0 = y - Y0;

    // Determine which simplex we're in
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;

    // Offsets for corners
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    // Hash coordinates for gradient lookup
    const ii = i & 255;
    const jj = j & 255;

    // Calculate contributions from corners
    let n0 = 0, n1 = 0, n2 = 0;

    // Corner 0
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = this.gradP[ii + this.perm[jj]];
      t0 *= t0;
      n0 = t0 * t0 * (gi0.x * x0 + gi0.y * y0);
    }

    // Corner 1
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = this.gradP[ii + i1 + this.perm[jj + j1]];
      t1 *= t1;
      n1 = t1 * t1 * (gi1.x * x1 + gi1.y * y1);
    }

    // Corner 2
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = this.gradP[ii + 1 + this.perm[jj + 1]];
      t2 *= t2;
      n2 = t2 * t2 * (gi2.x * x2 + gi2.y * y2);
    }

    // Scale to [-1, 1]
    return 70 * (n0 + n1 + n2);
  }

  /**
   * Fractal/octave noise for more detail
   * Combines multiple scales of noise
   */
  fractalNoise2D(
    x: number,
    y: number,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

/**
 * FlowField - Creates vector fields for organic particle motion
 *
 * The flow field uses simplex noise to generate smooth,
 * coherent force vectors that guide particles along
 * mystical-looking paths.
 */
export class FlowField {
  private noise: SimplexNoise;
  private spatialScale: number;
  private timeScale: number;

  /**
   * @param spatialScale - How "zoomed in" the noise is (smaller = larger patterns)
   * @param timeScale - How fast the field evolves (smaller = slower)
   * @param seed - Random seed for reproducibility
   */
  constructor(
    spatialScale = 0.003,
    timeScale = 0.0003,
    seed?: number
  ) {
    this.noise = new SimplexNoise(seed);
    this.spatialScale = spatialScale;
    this.timeScale = timeScale;
  }

  /**
   * Get force vector at a point in space and time
   * Returns normalized force with variable magnitude
   */
  getForce(
    x: number,
    y: number,
    time: number
  ): { fx: number; fy: number; magnitude: number } {
    // Use noise to determine angle
    const angle = this.noise.noise2D(
      x * this.spatialScale + time * this.timeScale,
      y * this.spatialScale
    ) * Math.PI * 2;

    // Use a different noise sample for magnitude
    const magnitude = 0.3 + this.noise.noise2D(
      x * this.spatialScale * 0.5 + 1000, // Offset to decorrelate
      y * this.spatialScale * 0.5 + time * this.timeScale * 0.5
    ) * 0.7;

    return {
      fx: Math.cos(angle) * magnitude,
      fy: Math.sin(angle) * magnitude,
      magnitude,
    };
  }

  /**
   * Get curl/vortex-like force (useful for swirling effects)
   */
  getCurlForce(
    x: number,
    y: number,
    time: number,
    epsilon = 0.01
  ): { fx: number; fy: number } {
    // Approximate curl using finite differences
    const n1 = this.noise.noise2D(
      x * this.spatialScale,
      (y + epsilon) * this.spatialScale + time * this.timeScale
    );
    const n2 = this.noise.noise2D(
      x * this.spatialScale,
      (y - epsilon) * this.spatialScale + time * this.timeScale
    );
    const n3 = this.noise.noise2D(
      (x + epsilon) * this.spatialScale,
      y * this.spatialScale + time * this.timeScale
    );
    const n4 = this.noise.noise2D(
      (x - epsilon) * this.spatialScale,
      y * this.spatialScale + time * this.timeScale
    );

    // Curl components (perpendicular to gradient)
    return {
      fx: (n1 - n2) / (2 * epsilon),
      fy: -(n3 - n4) / (2 * epsilon),
    };
  }

  /**
   * Update scales for dynamic field behavior
   */
  setScales(spatialScale: number, timeScale: number): void {
    this.spatialScale = spatialScale;
    this.timeScale = timeScale;
  }
}

// Default flow field instance
export const defaultFlowField = new FlowField();
