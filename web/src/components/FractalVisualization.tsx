'use client';

/**
 * FractalVisualization - Sacred Geometry Explorer for the 7430 Project
 *
 * Displays mathematical patterns in the Quran's Muqatta'at letters using
 * authentic Sufi mystical aesthetics and Islamic geometric principles.
 *
 * Visual Elements:
 * - 19-pointed stars (referencing Quran 74:30)
 * - Flower of Life sacred geometry
 * - Girih-inspired patterns (36°/72° angle systems)
 * - Light rays symbolizing divine illumination
 * - Aurora breathing background representing the infinite
 *
 * Color Symbolism (Sufi tradition):
 * - Gold: Divine glory, spiritual attainment (Tier 1)
 * - Teal/Cyan: Contemplation, inner journey (Tier 2)
 * - Deep Blue: The infinite, divine presence
 * - White: Purity, spiritual starting point
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GROUPS, TOTAL, NUM_GROUPS, type LetterGroup } from '@/lib/groups';
import { FlowField } from '@/lib/perlin';
import { useAudioAnalyzer, audioToVisual, type AudioData } from '@/hooks/useAudioAnalyzer';
import { AnimationController } from '@/lib/animationController';
import { gradientCache } from '@/lib/gradientCache';

type ViewMode = 'mandala' | 'fractal' | 'constellation' | 'flow';

interface GroupPosition {
  x: number;
  y: number;
  r: number;
  targetX: number;
  targetY: number;
  targetR: number;
  fromX: number;
  fromY: number;
  fromR: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  mode: string;
  // For spiral mode
  angle?: number;
  angleSpeed?: number;
  dist?: number;
}

const TAU = Math.PI * 2;
const MAX_PARTICLES = 400; // Increased for richer atmosphere

// Girih angles (traditional Islamic geometry)
const GIRIH_36 = Math.PI / 5;  // 36 degrees
const GIRIH_72 = Math.PI * 2 / 5;  // 72 degrees

function getGroupColor(g: LetterGroup, alpha = 1): string {
  if (g.tier === 1) {
    // Gold tones for Tier 1 - Divine glory
    const hue = 35 + (g.id / NUM_GROUPS) * 25;
    return `hsla(${hue}, 85%, 58%, ${alpha})`;
  } else {
    // Teal/cyan tones for Tier 2 - Contemplation
    const hue = 170 + (g.id / NUM_GROUPS) * 30;
    return `hsla(${hue}, 75%, 55%, ${alpha})`;
  }
}

interface FractalVisualizationProps {
  className?: string;
  initialView?: ViewMode;
  showControls?: boolean;
  onGroupSelect?: (group: LetterGroup | null) => void;
}

export default function FractalVisualization({
  className = '',
  initialView = 'mandala',
  showControls = true,
  onGroupSelect,
}: FractalVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const groupPositionsRef = useRef<GroupPosition[]>([]);
  const stateRef = useRef({
    currentView: initialView,
    transitionProgress: 1,
    hoveredGroup: null as number | null,
    lockedGroup: null as number | null,
    animTime: 0,
    W: 0,
    H: 0,
    cx: 0,
    cy: 0,
    radius: 0,
  });

  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [selectedGroup, setSelectedGroup] = useState<LetterGroup | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Advanced animation and effects modules
  const flowFieldRef = useRef<FlowField>(new FlowField(0.003, 0.0003));
  const animControllerRef = useRef<AnimationController | null>(null);
  const audioDataRef = useRef<AudioData | null>(null);

  // Audio analyzer hook
  const {
    isActive: audioActive,
    hasPermission: audioPermission,
    start: startAudio,
    stop: stopAudio,
    getData: getAudioData,
  } = useAudioAnalyzer();

  function resetParticle(p: Particle, state: typeof stateRef.current) {
    // Chromatic color selection for mystical effect
    const colorChoice = Math.random();
    if (colorChoice > 0.6) {
      // Gold particles (divine light)
      p.color = `rgba(201,168,76,${0.3 + Math.random() * 0.4})`;
    } else if (colorChoice > 0.3) {
      // Teal particles (contemplation)
      p.color = `rgba(96,245,224,${0.2 + Math.random() * 0.3})`;
    } else if (colorChoice > 0.15) {
      // White particles (purity)
      p.color = `rgba(255,255,255,${0.15 + Math.random() * 0.2})`;
    } else {
      // Subtle green (connection to Prophet in Sufi tradition)
      p.color = `rgba(120,200,140,${0.1 + Math.random() * 0.15})`;
    }

    if (p.mode === 'orbital') {
      const angle = Math.random() * TAU;
      const dist = state.radius * (0.3 + Math.random() * 0.8);
      p.x = state.cx + Math.cos(angle) * dist;
      p.y = state.cy + Math.sin(angle) * dist;
      const speed = 0.15 + Math.random() * 0.35;
      p.vx = Math.cos(angle + Math.PI / 2) * speed;
      p.vy = Math.sin(angle + Math.PI / 2) * speed;
      p.maxLife = 150 + Math.random() * 250;
    } else if (p.mode === 'nebula') {
      // Slow drifting cosmic dust
      p.x = state.cx + (Math.random() - 0.5) * state.W * 1.2;
      p.y = state.cy + (Math.random() - 0.5) * state.H * 1.2;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.vy = (Math.random() - 0.5) * 0.15;
      p.size = 2 + Math.random() * 4;
      p.maxLife = 400 + Math.random() * 400;
      p.color = `rgba(201,168,76,${0.04 + Math.random() * 0.06})`;
    } else if (p.mode === 'spark') {
      // Fast, bright, short-lived sparks
      const angle = Math.random() * TAU;
      p.x = state.cx + Math.cos(angle) * state.radius * 0.3;
      p.y = state.cy + Math.sin(angle) * state.radius * 0.3;
      const speed = 1 + Math.random() * 2;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 0.5 + Math.random() * 1;
      p.maxLife = 60 + Math.random() * 90;
      p.color = `rgba(255,240,200,${0.6 + Math.random() * 0.4})`;
    } else if (p.mode === 'spiral') {
      // Helical paths around center (sacred spiral)
      p.angle = Math.random() * TAU;
      p.angleSpeed = (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1);
      p.dist = state.radius * (0.2 + Math.random() * 0.6);
      p.x = state.cx + Math.cos(p.angle) * p.dist;
      p.y = state.cy + Math.sin(p.angle) * p.dist;
      p.vx = 0;
      p.vy = 0;
      p.maxLife = 300 + Math.random() * 300;
      p.size = 1 + Math.random() * 1.5;
    } else if (p.mode === 'drift') {
      p.x = Math.random() * state.W * 0.1;
      p.y = Math.random() * state.H;
      p.vx = 0.5 + Math.random() * 1.5;
      p.vy = (Math.random() - 0.5) * 0.3;
    } else {
      // float mode
      p.x = state.cx + (Math.random() - 0.5) * state.W * 0.8;
      p.y = state.cy + (Math.random() - 0.5) * state.H * 0.8;
      p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = (Math.random() - 0.5) * 0.3;
    }
    p.life = 0;
  }

  const createParticle = useCallback((mode: string): Particle => {
    const state = stateRef.current;
    const p: Particle = {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 120 + Math.random() * 200,
      size: 1 + Math.random() * 2,
      color: '',
      mode,
    };
    resetParticle(p, state);
    return p;
  }, []);

  // Initialize
  useEffect(() => {
    groupPositionsRef.current = GROUPS.map(() => ({
      x: 0, y: 0, r: 0,
      targetX: 0, targetY: 0, targetR: 0,
      fromX: 0, fromY: 0, fromR: 0,
    }));

    // Initialize enhanced particle system with multiple modes
    particlesRef.current = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const mode = i < 200 ? 'orbital' : i < 300 ? 'nebula' : i < 360 ? 'spark' : 'spiral';
      particlesRef.current.push(createParticle(mode));
    }
  }, [createParticle]);

  const computeTargetPositions = useCallback((view: ViewMode) => {
    const state = stateRef.current;
    GROUPS.forEach((g, i) => {
      const gp = groupPositionsRef.current[i];
      const proportion = g.count / TOTAL;

      if (view === 'mandala') {
        const angle = (i / NUM_GROUPS) * TAU - Math.PI / 2;
        const dist = state.radius * 0.65;
        gp.targetX = state.cx + Math.cos(angle) * dist;
        gp.targetY = state.cy + Math.sin(angle) * dist;
        gp.targetR = Math.max(12, Math.sqrt(proportion) * state.radius * 0.45);
      } else if (view === 'fractal') {
        const startAngle = GROUPS.slice(0, i).reduce((s, gg) => s + (gg.count / TOTAL) * TAU, 0) - Math.PI / 2;
        const sweep = proportion * TAU;
        const midAngle = startAngle + sweep / 2;
        gp.targetX = state.cx + Math.cos(midAngle) * state.radius * 0.6;
        gp.targetY = state.cy + Math.sin(midAngle) * state.radius * 0.6;
        gp.targetR = Math.max(10, proportion * state.radius * 1.2);
      } else if (view === 'constellation') {
        const angle = (i / NUM_GROUPS) * TAU - Math.PI / 2;
        const dist = state.radius * 0.4;
        gp.targetX = state.cx + Math.cos(angle) * dist;
        gp.targetY = state.cy + Math.sin(angle) * dist;
        gp.targetR = Math.max(10, Math.sqrt(proportion) * 35);
      } else if (view === 'flow') {
        const yStart = 60;
        const yRange = state.H - 120;
        const cumPropBefore = GROUPS.slice(0, i).reduce((s, gg) => s + gg.count / TOTAL, 0);
        const yCenter = yStart + (cumPropBefore + proportion / 2) * yRange;
        gp.targetX = state.W * 0.15;
        gp.targetY = yCenter;
        gp.targetR = Math.max(8, proportion * yRange * 0.45);
      }
    });
  }, []);

  const switchView = useCallback((name: ViewMode) => {
    const state = stateRef.current;
    if (name === state.currentView && state.transitionProgress >= 1) return;

    state.currentView = name;
    state.transitionProgress = 0;

    groupPositionsRef.current.forEach(gp => {
      gp.fromX = gp.x;
      gp.fromY = gp.y;
      gp.fromR = gp.r;
    });

    computeTargetPositions(name);

    // Update particle modes based on view
    particlesRef.current.forEach((p, i) => {
      if (name === 'flow') {
        p.mode = i % 3 === 0 ? 'drift' : 'nebula';
      } else if (name === 'constellation') {
        p.mode = i % 4 === 0 ? 'spark' : 'float';
      } else {
        p.mode = i < 200 ? 'orbital' : i < 300 ? 'nebula' : i < 360 ? 'spark' : 'spiral';
      }
    });

    setCurrentView(name);
  }, [computeTargetPositions]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;

      canvasRef.current.width = W * dpr;
      canvasRef.current.height = H * dpr;
      canvasRef.current.style.width = W + 'px';
      canvasRef.current.style.height = H + 'px';

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const state = stateRef.current;
      state.W = W;
      state.H = H;
      state.cx = W / 2;
      state.cy = H / 2;
      state.radius = Math.min(W, H) * 0.38;

      if (svgRef.current) {
        svgRef.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svgRef.current.setAttribute('width', String(W));
        svgRef.current.setAttribute('height', String(H));
      }

      computeTargetPositions(state.currentView);
      groupPositionsRef.current.forEach(gp => {
        gp.x = gp.targetX;
        gp.y = gp.targetY;
        gp.r = gp.targetR;
        gp.fromX = gp.targetX;
        gp.fromY = gp.targetY;
        gp.fromR = gp.targetR;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeTargetPositions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const views: ViewMode[] = ['mandala', 'fractal', 'constellation', 'flow'];
      const key = e.key;

      // Number keys 1-4 for direct view selection
      if (key >= '1' && key <= '4') {
        e.preventDefault();
        const index = parseInt(key) - 1;
        switchView(views[index]);
      }
      // Arrow keys for cycling
      else if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = views.indexOf(stateRef.current.currentView);
        const nextIndex = (currentIndex + 1) % views.length;
        switchView(views[nextIndex]);
      }
      else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = views.indexOf(stateRef.current.currentView);
        const prevIndex = (currentIndex - 1 + views.length) % views.length;
        switchView(views[prevIndex]);
      }
      // Escape to clear selection
      else if (key === 'Escape') {
        stateRef.current.lockedGroup = null;
        stateRef.current.hoveredGroup = null;
        setSelectedGroup(null);
        onGroupSelect?.(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchView, onGroupSelect]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // ═══════════════════════════════════════════
    // SACRED GEOMETRY DRAWING FUNCTIONS
    // ═══════════════════════════════════════════

    const drawStar = (
      c: CanvasRenderingContext2D,
      x: number, y: number,
      outerR: number, innerR: number,
      n: number,
      stroke: string | null,
      fill: string | null,
      lineWidth = 1
    ) => {
      c.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const angle = (i * Math.PI / n) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
    };

    // Enhanced Islamic pattern with deeper recursion
    const drawIslamicPattern = (
      c: CanvasRenderingContext2D,
      x: number, y: number,
      r: number, depth: number,
      color: string,
      maxDepth = 4
    ) => {
      if (depth <= 0 || r < 2) return;

      // Vary star points based on depth for richer patterns
      const points = depth === maxDepth ? 19 : depth === maxDepth - 1 ? 8 : 6;
      const innerRatio = 0.38 + (depth * 0.02); // Varying ratio for complexity

      drawStar(c, x, y, r, r * innerRatio, points, color, null, Math.max(0.3, 0.8 - depth * 0.15));

      if (depth > 1) {
        // Use girih-inspired angles for placement
        const branches = depth > 2 ? 6 : 5;
        const branchR = r * (0.32 + (maxDepth - depth) * 0.03);
        for (let i = 0; i < branches; i++) {
          const angle = (i / branches) * TAU - Math.PI / 2 + (depth % 2 === 0 ? GIRIH_36 / 2 : 0);
          const nx = x + Math.cos(angle) * r * 0.55;
          const ny = y + Math.sin(angle) * r * 0.55;
          drawIslamicPattern(c, nx, ny, branchR, depth - 1, color, maxDepth);
        }
      }
    };

    // Flower of Life - Sacred geometry pattern
    const drawFlowerOfLife = (
      c: CanvasRenderingContext2D,
      x: number, y: number,
      r: number,
      rings: number,
      color: string
    ) => {
      c.strokeStyle = color;
      c.lineWidth = 0.5;

      // Central circle
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.stroke();

      // Surrounding petals
      for (let ring = 1; ring <= rings; ring++) {
        const numCircles = ring === 1 ? 6 : ring * 6;
        for (let i = 0; i < numCircles; i++) {
          const angle = (i / numCircles) * TAU + (ring % 2 === 0 ? TAU / numCircles / 2 : 0);
          const dist = r * ring;
          const cx = x + Math.cos(angle) * dist;
          const cy = y + Math.sin(angle) * dist;
          c.beginPath();
          c.arc(cx, cy, r, 0, TAU);
          c.stroke();
        }
      }
    };

    // Light rays emanating from center (divine illumination)
    const drawLightRays = (
      c: CanvasRenderingContext2D,
      cx: number, cy: number,
      innerR: number, outerR: number,
      numRays: number,
      time: number
    ) => {
      const shimmer = 0.3 + Math.sin(time * 0.02) * 0.15;

      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * TAU - Math.PI / 2;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;

        // Create gradient for each ray
        const grad = c.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(255,255,255,${shimmer * 0.4})`);
        grad.addColorStop(0.3, `rgba(201,168,76,${shimmer * 0.3})`);
        grad.addColorStop(1, 'transparent');

        c.strokeStyle = grad;
        c.lineWidth = 1.5;
        c.setLineDash([5, 8]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.setLineDash([]);
      }
    };

    // Girih border pattern
    const drawGirihBorder = (
      c: CanvasRenderingContext2D,
      x: number, y: number,
      r: number,
      color: string,
      time: number
    ) => {
      const rotation = time * 0.001;
      c.save();
      c.translate(x, y);
      c.rotate(rotation);

      // Draw 10-fold girih pattern
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * TAU;
        const x1 = Math.cos(angle) * r;
        const y1 = Math.sin(angle) * r;
        const x2 = Math.cos(angle + GIRIH_72) * r;
        const y2 = Math.sin(angle + GIRIH_72) * r;

        c.strokeStyle = color;
        c.lineWidth = 0.5;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      }

      c.restore();
    };

    // ═══════════════════════════════════════════
    // VIEW RENDERERS
    // ═══════════════════════════════════════════

    const renderMandala = (c: CanvasRenderingContext2D) => {
      const state = stateRef.current;
      const pulse = 1 + Math.sin(state.animTime * 0.015) * 0.03;
      const breathe = 1 + Math.sin(state.animTime * 0.008) * 0.02;

      // Flower of Life background (sacred geometry)
      drawFlowerOfLife(
        c, state.cx, state.cy,
        state.radius * 0.15 * breathe,
        2,
        `rgba(201,168,76,${0.06 + Math.sin(state.animTime * 0.01) * 0.02})`
      );

      // Light rays (divine illumination)
      drawLightRays(
        c, state.cx, state.cy,
        state.radius * 0.1,
        state.radius * 1.1,
        12,
        state.animTime
      );

      // Central 19-pointed star (Quran 74:30)
      drawStar(c, state.cx, state.cy, state.radius * 0.28 * pulse, state.radius * 0.12 * pulse, 19, 'rgba(201,168,76,0.7)', 'rgba(201,168,76,0.08)', 2);
      drawStar(c, state.cx, state.cy, state.radius * 0.2 * pulse, state.radius * 0.09 * pulse, 19, 'rgba(201,168,76,0.4)', null, 0.8);

      // Connecting arabesque lines from center to groups
      GROUPS.forEach((g, i) => {
        const gp = groupPositionsRef.current[i];
        const color = getGroupColor(g, 0.2);

        // Curved arabesque connection
        const midX = (state.cx + gp.x) / 2;
        const midY = (state.cy + gp.y) / 2;
        const perpAngle = Math.atan2(gp.y - state.cy, gp.x - state.cx) + Math.PI / 2;
        const curve = 15 + Math.sin(state.animTime * 0.02 + i) * 8;
        const ctrlX = midX + Math.cos(perpAngle) * curve;
        const ctrlY = midY + Math.sin(perpAngle) * curve;

        c.beginPath();
        c.moveTo(state.cx, state.cy);
        c.quadraticCurveTo(ctrlX, ctrlY, gp.x, gp.y);
        c.strokeStyle = color;
        c.lineWidth = 1;
        c.stroke();
      });

      // Group nodes with enhanced Islamic patterns
      GROUPS.forEach((g, i) => {
        const gp = groupPositionsRef.current[i];
        const isHighlighted = state.hoveredGroup === i || state.lockedGroup === i;

        // Outer glow
        const grad = c.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, gp.r * 2.5);
        grad.addColorStop(0, getGroupColor(g, 0.2));
        grad.addColorStop(0.5, getGroupColor(g, 0.08));
        grad.addColorStop(1, 'transparent');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(gp.x, gp.y, gp.r * 2.5, 0, TAU);
        c.fill();

        // Girih border (subtle rotation)
        if (gp.r > 15) {
          drawGirihBorder(c, gp.x, gp.y, gp.r + 6, getGroupColor(g, 0.15), state.animTime);
        }

        // Deep recursive Islamic pattern
        const patternDepth = Math.min(4, Math.floor(gp.r / 10) + 2);
        drawIslamicPattern(c, gp.x, gp.y, gp.r, patternDepth, getGroupColor(g, 0.75), patternDepth);

        if (isHighlighted) {
          c.beginPath();
          c.arc(gp.x, gp.y, gp.r + 6, 0, TAU);
          c.strokeStyle = getGroupColor(g, 0.95);
          c.lineWidth = 2.5;
          c.stroke();

          // Inner glow pulse
          const glowPulse = 0.3 + Math.sin(state.animTime * 0.05) * 0.15;
          c.beginPath();
          c.arc(gp.x, gp.y, gp.r + 10, 0, TAU);
          c.strokeStyle = getGroupColor(g, glowPulse);
          c.lineWidth = 1;
          c.stroke();
        }
      });

      // Outer decorative ring
      c.beginPath();
      c.arc(state.cx, state.cy, state.radius, 0, TAU);
      c.strokeStyle = 'rgba(201,168,76,0.15)';
      c.lineWidth = 1.5;
      c.stroke();

      // Second outer ring with girih pattern
      for (let i = 0; i < 19; i++) {
        const a1 = (i / 19) * TAU - Math.PI / 2;
        const a2 = ((i + 1) / 19) * TAU - Math.PI / 2;
        c.beginPath();
        c.arc(state.cx, state.cy, state.radius * 1.05, a1, a2);
        c.strokeStyle = `rgba(201,168,76,${0.08 + Math.sin(state.animTime * 0.015 + i * 0.3) * 0.04})`;
        c.lineWidth = 2;
        c.stroke();
      }
    };

    const renderFractal = (c: CanvasRenderingContext2D) => {
      const state = stateRef.current;
      const pulse = 1 + Math.sin(state.animTime * 0.01) * 0.02;

      // Light rays in fractal view too
      drawLightRays(c, state.cx, state.cy, state.radius * 0.15, state.radius * 0.9, 8, state.animTime);

      // Pulsing wave rings from center
      for (let w = 0; w < 3; w++) {
        const wavePhase = (state.animTime * 0.005 + w * 0.33) % 1;
        const waveR = state.radius * 0.2 + wavePhase * state.radius * 0.8;
        const waveAlpha = 0.15 * (1 - wavePhase);
        c.beginPath();
        c.arc(state.cx, state.cy, waveR, 0, TAU);
        c.strokeStyle = `rgba(201,168,76,${waveAlpha})`;
        c.lineWidth = 1;
        c.stroke();
      }

      // Outer ring
      c.beginPath();
      c.arc(state.cx, state.cy, state.radius * pulse, 0, TAU);
      c.strokeStyle = 'rgba(201,168,76,0.2)';
      c.lineWidth = 2;
      c.stroke();

      // Inner 19 segments with depth shading (muqarnas-inspired)
      const innerR = state.radius * 0.25;
      for (let i = 0; i < 19; i++) {
        const a1 = (i / 19) * TAU - Math.PI / 2;
        const a2 = ((i + 1) / 19) * TAU - Math.PI / 2;

        // Depth shading
        const depthShade = 0.4 + (Math.sin(a1 * 2 + state.animTime * 0.01) * 0.1);
        c.beginPath();
        c.arc(state.cx, state.cy, innerR, a1, a2);
        c.strokeStyle = `hsla(${35 + i * 4}, 75%, ${50 + depthShade * 10}%, ${0.5 + depthShade * 0.2})`;
        c.lineWidth = 5;
        c.stroke();

        // Tick marks
        c.beginPath();
        c.moveTo(state.cx + Math.cos(a1) * (innerR - 8), state.cy + Math.sin(a1) * (innerR - 8));
        c.lineTo(state.cx + Math.cos(a1) * (innerR + 8), state.cy + Math.sin(a1) * (innerR + 8));
        c.strokeStyle = 'rgba(201,168,76,0.25)';
        c.lineWidth = 1;
        c.stroke();
      }

      // Center 19 label
      c.fillStyle = 'rgba(201,168,76,0.7)';
      c.font = '600 28px Inter, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('19', state.cx, state.cy);

      // Middle ring: 13 group arcs
      const midR = state.radius * 0.6;
      let cumAngle = -Math.PI / 2;
      GROUPS.forEach((g, i) => {
        const sweep = (g.count / TOTAL) * TAU;
        const isHighlighted = state.hoveredGroup === i || state.lockedGroup === i;

        c.beginPath();
        c.arc(state.cx, state.cy, midR, cumAngle, cumAngle + sweep);
        c.strokeStyle = getGroupColor(g, isHighlighted ? 1 : 0.75);
        c.lineWidth = isHighlighted ? 10 : 6;
        c.stroke();

        // Radial dividers
        c.beginPath();
        c.moveTo(state.cx + Math.cos(cumAngle) * (midR - 18), state.cy + Math.sin(cumAngle) * (midR - 18));
        c.lineTo(state.cx + Math.cos(cumAngle) * (midR + 18), state.cy + Math.sin(cumAngle) * (midR + 18));
        c.strokeStyle = getGroupColor(g, 0.35);
        c.lineWidth = 1;
        c.stroke();

        // Small decorative star at midpoint
        const midAngle = cumAngle + sweep / 2;
        const sx = state.cx + Math.cos(midAngle) * midR;
        const sy = state.cy + Math.sin(midAngle) * midR;
        drawStar(c, sx, sy, 7, 3, 6, getGroupColor(g, 0.7), null, 0.8);

        cumAngle += sweep;
      });

      // Outer ring: 361 (19²) fine segments
      for (let i = 0; i < 361; i++) {
        if (i % 19 === 0) {
          const a = (i / 361) * TAU - Math.PI / 2;
          c.beginPath();
          c.moveTo(state.cx + Math.cos(a) * (state.radius - 10), state.cy + Math.sin(a) * (state.radius - 10));
          c.lineTo(state.cx + Math.cos(a) * (state.radius + 5), state.cy + Math.sin(a) * (state.radius + 5));
          c.strokeStyle = 'rgba(201,168,76,0.3)';
          c.lineWidth = 1.5;
          c.stroke();
        }
      }

      // Formula labels
      c.fillStyle = 'rgba(201,168,76,0.5)';
      c.font = '300 14px Inter, sans-serif';
      c.fillText('19²', state.cx, state.cy + innerR + 22);
      c.fillText('× P(29)', state.cx, state.cy + innerR + 40);
    };

    const renderConstellation = (c: CanvasRenderingContext2D) => {
      const state = stateRef.current;

      // Subtle hexagonal background grid
      const gridSize = 40;
      c.strokeStyle = 'rgba(201,168,76,0.03)';
      c.lineWidth = 0.5;
      for (let y = 0; y < state.H + gridSize; y += gridSize * 0.866) {
        const offset = Math.floor(y / (gridSize * 0.866)) % 2 === 0 ? 0 : gridSize / 2;
        for (let x = offset; x < state.W + gridSize; x += gridSize) {
          c.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * TAU;
            const px = x + Math.cos(angle) * gridSize * 0.4;
            const py = y + Math.sin(angle) * gridSize * 0.4;
            if (i === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.stroke();
        }
      }

      // Chapter positions
      const allChapters: number[] = [];
      const chapterToGroups: Record<number, number[]> = {};
      GROUPS.forEach((g, gi) => {
        g.chapters.forEach(ch => {
          if (!chapterToGroups[ch]) { chapterToGroups[ch] = []; allChapters.push(ch); }
          chapterToGroups[ch].push(gi);
        });
      });

      const chapterPositions: Record<number, { x: number; y: number }> = {};
      allChapters.sort((a, b) => a - b);
      allChapters.forEach((ch, i) => {
        const angle = (i / allChapters.length) * TAU - Math.PI / 2;
        const dist = state.radius * 0.85;
        chapterPositions[ch] = { x: state.cx + Math.cos(angle) * dist, y: state.cy + Math.sin(angle) * dist };
      });

      // Animated connection traces
      GROUPS.forEach((g, gi) => {
        const gp = groupPositionsRef.current[gi];
        const isHighlighted = state.hoveredGroup === gi || state.lockedGroup === gi;
        g.chapters.forEach((ch, ci) => {
          const cp = chapterPositions[ch];
          if (!cp) return;

          if (isHighlighted) {
            // Animated trace effect
            const traceProgress = (state.animTime * 0.02 + ci * 0.2) % 1;
            const traceX = lerp(gp.x, cp.x, traceProgress);
            const traceY = lerp(gp.y, cp.y, traceProgress);

            c.beginPath();
            c.arc(traceX, traceY, 3, 0, TAU);
            c.fillStyle = getGroupColor(g, 0.8);
            c.fill();
          }

          c.beginPath();
          c.moveTo(gp.x, gp.y);
          c.lineTo(cp.x, cp.y);
          c.strokeStyle = getGroupColor(g, isHighlighted ? 0.65 : 0.12);
          c.lineWidth = isHighlighted ? 2 : 0.5;
          c.stroke();
        });
      });

      // Chapter nodes
      allChapters.forEach(ch => {
        const cp = chapterPositions[ch];
        const activeGroup = state.hoveredGroup !== null ? state.hoveredGroup : state.lockedGroup;
        const isConnected = activeGroup !== null && chapterToGroups[ch].includes(activeGroup);

        c.beginPath();
        c.arc(cp.x, cp.y, isConnected ? 7 : 4, 0, TAU);
        c.fillStyle = isConnected ? '#e0dcd0' : 'rgba(224,220,208,0.45)';
        c.fill();

        if (isConnected) {
          c.beginPath();
          c.arc(cp.x, cp.y, 12, 0, TAU);
          c.strokeStyle = 'rgba(201,168,76,0.4)';
          c.lineWidth = 1;
          c.stroke();
        }

        // Chapter number label
        c.fillStyle = isConnected ? '#e0dcd0' : 'rgba(224,220,208,0.35)';
        c.font = `${isConnected ? '600 12px' : '300 9px'} Inter, sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        const labelDist = state.radius * 0.96;
        const angle = Math.atan2(cp.y - state.cy, cp.x - state.cx);
        c.fillText(String(ch), state.cx + Math.cos(angle) * labelDist, state.cy + Math.sin(angle) * labelDist);
      });

      // Group nodes
      GROUPS.forEach((g, i) => {
        const gp = groupPositionsRef.current[i];
        const isHighlighted = state.hoveredGroup === i || state.lockedGroup === i;

        // Glow
        const grad = c.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, gp.r * 3);
        grad.addColorStop(0, getGroupColor(g, 0.3));
        grad.addColorStop(0.5, getGroupColor(g, 0.1));
        grad.addColorStop(1, 'transparent');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(gp.x, gp.y, gp.r * 3, 0, TAU);
        c.fill();

        // Node
        c.beginPath();
        c.arc(gp.x, gp.y, gp.r, 0, TAU);
        c.fillStyle = getGroupColor(g, 0.18);
        c.fill();
        c.strokeStyle = getGroupColor(g, isHighlighted ? 1 : 0.75);
        c.lineWidth = isHighlighted ? 3 : 1.5;
        c.stroke();

        // Inner star
        drawStar(c, gp.x, gp.y, gp.r * 0.7, gp.r * 0.3, 6, getGroupColor(g, 0.7), null, 1);
      });

      // Special marker for Ch 42 (dual membership: HM + ASQ)
      const ch42 = chapterPositions[42];
      if (ch42) {
        c.beginPath();
        c.arc(ch42.x, ch42.y, 10, 0, TAU);
        c.strokeStyle = 'rgba(245,208,96,0.55)';
        c.lineWidth = 1.5;
        c.setLineDash([4, 4]);
        c.stroke();
        c.setLineDash([]);
      }
    };

    const renderFlow = (c: CanvasRenderingContext2D) => {
      const state = stateRef.current;
      const xStart = state.W * 0.12;
      const xMerge = state.W * 0.88;
      const yStart = 60;
      const yRange = state.H - 120;
      const mergeY = state.cy;
      const flowTime = state.animTime * 0.015;

      let cumY = yStart;
      GROUPS.forEach((g, i) => {
        const streamH = Math.max(4, (g.count / TOTAL) * yRange);
        const streamCenterY = cumY + streamH / 2;
        const isHighlighted = state.hoveredGroup === i || state.lockedGroup === i;

        // Stream body with turbulence
        c.beginPath();
        c.moveTo(xStart, cumY);

        // Add subtle wave to top edge
        const wave1 = Math.sin(flowTime + i) * 2;
        c.bezierCurveTo(
          state.W * 0.82, cumY + wave1,
          state.W * 0.82, mergeY - streamH / 2,
          xMerge, mergeY - 2
        );
        c.lineTo(xMerge, mergeY + 2);
        c.bezierCurveTo(
          state.W * 0.82, mergeY + streamH / 2,
          state.W * 0.82, cumY + streamH - wave1,
          xStart, cumY + streamH
        );
        c.closePath();
        c.fillStyle = getGroupColor(g, isHighlighted ? 0.18 : 0.07);
        c.fill();
        c.strokeStyle = getGroupColor(g, isHighlighted ? 0.75 : 0.4);
        c.lineWidth = isHighlighted ? 1.5 : 0.5;
        c.stroke();

        // Flowing particles along stream
        const numDots = Math.max(4, Math.floor(g.div19 / 6));
        for (let d = 0; d < numDots; d++) {
          const t = ((d / numDots) + flowTime * (0.2 + i * 0.015)) % 1;
          const px = lerp(xStart, xMerge, t);
          const py = lerp(streamCenterY, mergeY, t * t);
          const dotR = (d % 19 === Math.floor(state.animTime * 0.08) % 19) ? 3.5 : 1.2;
          const dotAlpha = (d % 19 === Math.floor(state.animTime * 0.08) % 19) ? 0.85 : 0.35;

          c.beginPath();
          c.arc(px, py, dotR, 0, TAU);
          c.fillStyle = getGroupColor(g, dotAlpha);
          c.fill();
        }

        // Labels
        c.fillStyle = getGroupColor(g, 0.65);
        c.font = '600 11px Inter, sans-serif';
        c.textAlign = 'right';
        c.textBaseline = 'middle';
        c.fillText(g.latin, xStart - 10, streamCenterY);

        c.fillStyle = getGroupColor(g, 0.35);
        c.font = '300 9px Inter, sans-serif';
        c.textAlign = 'left';
        c.fillText(g.count.toLocaleString(), xStart + 5, streamCenterY);

        cumY += streamH;
      });

      // Vortex effect at merge point
      for (let v = 0; v < 3; v++) {
        const vortexR = 15 + v * 8;
        const vortexAlpha = 0.2 - v * 0.05;
        c.beginPath();
        c.arc(xMerge + 20, mergeY, vortexR, 0, TAU);
        c.strokeStyle = `rgba(201,168,76,${vortexAlpha})`;
        c.lineWidth = 1;
        c.stroke();
      }

      // Merge point star
      drawStar(c, xMerge + 20, mergeY, 22, 9, 19, 'rgba(201,168,76,0.45)', 'rgba(201,168,76,0.08)', 1);

      // Emanation glow
      const emanation = 0.4 + Math.sin(state.animTime * 0.03) * 0.15;
      const emanGrad = c.createRadialGradient(xMerge + 20, mergeY, 0, xMerge + 20, mergeY, 50);
      emanGrad.addColorStop(0, `rgba(201,168,76,${emanation * 0.3})`);
      emanGrad.addColorStop(1, 'transparent');
      c.fillStyle = emanGrad;
      c.beginPath();
      c.arc(xMerge + 20, mergeY, 50, 0, TAU);
      c.fill();

      c.fillStyle = 'rgba(201,168,76,0.85)';
      c.font = '600 14px Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText('39,349', xMerge + 20, mergeY + 38);
      c.fillStyle = 'rgba(201,168,76,0.5)';
      c.font = '300 11px Inter, sans-serif';
      c.fillText('÷19 = 2,071', xMerge + 20, mergeY + 54);
    };

    // ═══════════════════════════════════════════
    // PARTICLE SYSTEM
    // ═══════════════════════════════════════════

    const updateParticles = () => {
      const state = stateRef.current;
      particlesRef.current.forEach(p => {
        if (p.mode === 'spiral' && p.angle !== undefined && p.angleSpeed !== undefined && p.dist !== undefined) {
          // Spiral mode: helical path
          p.angle += p.angleSpeed;
          p.dist += 0.05; // Slowly expand outward
          p.x = state.cx + Math.cos(p.angle) * p.dist;
          p.y = state.cy + Math.sin(p.angle) * p.dist;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        p.life++;
        if (p.life > p.maxLife || p.x < -50 || p.x > state.W + 50 || p.y < -50 || p.y > state.H + 50) {
          resetParticle(p, state);
        }
      });
    };

    const renderParticles = (c: CanvasRenderingContext2D) => {
      const prevComp = c.globalCompositeOperation;
      c.globalCompositeOperation = 'lighter';
      particlesRef.current.forEach(p => {
        const alpha = 1 - p.life / p.maxLife;
        const r = p.size * alpha;
        if (r < 0.2) return;

        const grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(p.x, p.y, r * 3, 0, TAU);
        c.fill();
      });
      c.globalCompositeOperation = prevComp;
    };

    // ═══════════════════════════════════════════
    // MAIN ANIMATION FRAME
    // ═══════════════════════════════════════════

    const frame = () => {
      const state = stateRef.current;
      state.animTime++;

      // Transition animation
      if (state.transitionProgress < 1) {
        state.transitionProgress = Math.min(1, state.transitionProgress + 0.02);
        const t = easeInOut(state.transitionProgress);
        groupPositionsRef.current.forEach(gp => {
          gp.x = lerp(gp.fromX, gp.targetX, t);
          gp.y = lerp(gp.fromY, gp.targetY, t);
          gp.r = lerp(gp.fromR, gp.targetR, t);
        });
      }

      // Clear canvas
      ctx.clearRect(0, 0, state.W, state.H);

      // Aurora breathing background (Sufi: the infinite divine)
      const breathPhase = state.animTime * 0.0008;
      const warmth = 0.5 + Math.sin(breathPhase) * 0.5;

      const bgGrad = ctx.createRadialGradient(state.cx, state.cy, 0, state.cx, state.cy, state.radius * 1.8);
      // Interpolate between cool and warm tones
      const r1 = Math.floor(lerp(20, 26, warmth));
      const g1 = Math.floor(lerp(18, 15, warmth));
      const b1 = Math.floor(lerp(30, 37, warmth));
      const r2 = Math.floor(lerp(10, 15, warmth));
      const g2 = Math.floor(lerp(10, 10, warmth));
      const b2 = Math.floor(lerp(18, 26, warmth));

      bgGrad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      bgGrad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, state.W, state.H);

      // Render current view
      if (state.currentView === 'mandala') renderMandala(ctx);
      else if (state.currentView === 'fractal') renderFractal(ctx);
      else if (state.currentView === 'constellation') renderConstellation(ctx);
      else if (state.currentView === 'flow') renderFlow(ctx);

      // Particles (rendered on top)
      updateParticles();
      renderParticles(ctx);

      animationRef.current = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Mouse handlers
  const getGroupAtPoint = useCallback((mx: number, my: number): number | null => {
    for (let i = 0; i < NUM_GROUPS; i++) {
      const gp = groupPositionsRef.current[i];
      const dx = mx - gp.x;
      const dy = my - gp.y;
      const hitR = Math.max(gp.r + 5, 20);
      if (dx * dx + dy * dy < hitR * hitR) return i;
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hovered = getGroupAtPoint(mx, my);
    stateRef.current.hoveredGroup = hovered;
    canvas.style.cursor = hovered !== null ? 'pointer' : 'default';

    if (stateRef.current.lockedGroup === null && hovered !== null) {
      setSelectedGroup(GROUPS[hovered]);
      onGroupSelect?.(GROUPS[hovered]);
    } else if (stateRef.current.lockedGroup === null && hovered === null) {
      setSelectedGroup(null);
      onGroupSelect?.(null);
    }
  }, [getGroupAtPoint, onGroupSelect]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const clicked = getGroupAtPoint(mx, my);

    if (clicked !== null) {
      const wasLocked = stateRef.current.lockedGroup === clicked;
      stateRef.current.lockedGroup = wasLocked ? null : clicked;
      const group = wasLocked ? null : GROUPS[clicked];
      setSelectedGroup(group);
      onGroupSelect?.(group);
    } else {
      stateRef.current.lockedGroup = null;
      setSelectedGroup(null);
      onGroupSelect?.(null);
    }
  }, [getGroupAtPoint, onGroupSelect]);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.hoveredGroup = null;
    if (stateRef.current.lockedGroup === null) {
      setSelectedGroup(null);
      onGroupSelect?.(null);
    }
  }, [onGroupSelect]);

  // Touch handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;
      const touched = getGroupAtPoint(mx, my);

      if (touched !== null) {
        const wasLocked = stateRef.current.lockedGroup === touched;
        stateRef.current.lockedGroup = wasLocked ? null : touched;
        const group = wasLocked ? null : GROUPS[touched];
        setSelectedGroup(group);
        onGroupSelect?.(group);
      } else {
        stateRef.current.lockedGroup = null;
        setSelectedGroup(null);
        onGroupSelect?.(null);
      }
    }
  }, [getGroupAtPoint, onGroupSelect]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;
      const hovered = getGroupAtPoint(mx, my);
      stateRef.current.hoveredGroup = hovered;
    }
  }, [getGroupAtPoint]);

  return (
    <div className={`relative flex flex-col h-full bg-[#0a0a12] ${className}`}>
      {showControls && (
        <div className="flex items-center justify-between p-3 border-b border-amber-500/20 z-10 bg-[#0a0a12]/80 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-amber-400" style={{ textShadow: '0 0 20px rgba(201,168,76,0.3)' }}>
              7430 Project — Quran Fractal
            </h2>
            <p className="text-xs text-gray-500">Sacred geometry of the Muqatta&apos;at</p>
          </div>
          <div className="flex gap-2">
            {(['mandala', 'fractal', 'constellation', 'flow'] as const).map((view) => (
              <button
                key={view}
                onClick={() => switchView(view)}
                className={`px-4 py-2 text-sm rounded-md border transition-all ${
                  currentView === view
                    ? 'bg-amber-500/30 border-amber-400 text-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        />
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {selectedGroup && (
          <div className="absolute top-4 right-4 w-72 bg-[#0a0a12]/95 border border-amber-500/25 rounded-xl p-5 backdrop-blur-xl z-10">
            <div
              className="text-3xl text-amber-400 text-center font-serif mb-2"
              dir="rtl"
              style={{
                textShadow: selectedGroup.tier === 1
                  ? '0 0 20px rgba(201,168,76,0.6), 0 0 40px rgba(201,168,76,0.3)'
                  : '0 0 20px rgba(96,245,224,0.5), 0 0 40px rgba(96,245,224,0.2)'
              }}
            >
              {selectedGroup.arabic}
            </div>
            <div className="text-center font-semibold text-gray-200 mb-3">
              {selectedGroup.latin} — Group {selectedGroup.id + 1} of 13
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Chapters</span>
                <span className="font-semibold">{selectedGroup.chapters.join(', ')}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Letter Count</span>
                <span className="font-semibold">{selectedGroup.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">÷ 19</span>
                <span className="font-semibold">{selectedGroup.div19.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Proportion</span>
                <span className="font-semibold">{((selectedGroup.count / TOTAL) * 100).toFixed(1)}%</span>
              </div>
              <div className="text-center pt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedGroup.tier === 1
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  Tier {selectedGroup.tier} — {selectedGroup.tier === 1 ? 'Encoding Independent' : 'Encoding Dependent'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-3 text-xs text-gray-500 border-t border-amber-500/10 bg-[#0a0a12]/80 backdrop-blur-sm">
        <div className="text-amber-400 font-semibold mb-1" style={{ textShadow: '0 0 15px rgba(201,168,76,0.3)' }}>
          39,349 = 19² × P(29) — &quot;Don&apos;t believe me. Count.&quot;
        </div>
        <div className="text-gray-600 text-[10px] mb-1">Press 1-4 to switch views</div>
        <a href="https://github.com/7430project/quran-fractal" className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer">
          github.com/7430project/quran-fractal
        </a>
        {' · Data: Tanzil.net (CC-BY 3.0)'}
      </div>
    </div>
  );
}
