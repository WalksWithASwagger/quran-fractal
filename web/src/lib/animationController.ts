/**
 * AnimationController - GSAP-powered animation management for the visualization
 *
 * Provides smooth spring-physics transitions with staggered animations
 * for the sacred geometry visualization.
 */

import gsap from 'gsap';

export interface GroupPosition {
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

export interface AnimationState {
  viewTransitionActive: boolean;
  transitionProgress: number;
}

export class AnimationController {
  private timeline: gsap.core.Timeline | null = null;
  private state: AnimationState;
  private groupPositions: GroupPosition[];

  constructor(groupPositions: GroupPosition[]) {
    this.groupPositions = groupPositions;
    this.state = {
      viewTransitionActive: false,
      transitionProgress: 1,
    };
  }

  /**
   * Animate groups to new positions with spring physics
   * @param duration - Animation duration in seconds
   * @param onUpdate - Callback fired on each animation frame
   */
  transitionToView(
    duration = 0.8,
    onUpdate?: () => void,
    onComplete?: () => void
  ): gsap.core.Timeline {
    // Kill existing transition
    if (this.timeline) {
      this.timeline.kill();
    }

    this.state.viewTransitionActive = true;
    this.state.transitionProgress = 0;

    this.timeline = gsap.timeline({
      onUpdate: () => {
        onUpdate?.();
      },
      onComplete: () => {
        this.state.viewTransitionActive = false;
        this.state.transitionProgress = 1;
        onComplete?.();
      }
    });

    // Staggered group animations with spring physics
    this.groupPositions.forEach((gp, i) => {
      const staggerDelay = i * 0.03; // 30ms stagger per group

      // Animate position and radius
      this.timeline!.to(gp, {
        x: gp.targetX,
        y: gp.targetY,
        r: gp.targetR,
        duration,
        delay: staggerDelay,
        ease: 'elastic.out(1, 0.75)', // Spring bounce
      }, 0);
    });

    // Also animate the transition progress for any legacy code
    this.timeline.to(this.state, {
      transitionProgress: 1,
      duration: duration * 0.8,
      ease: 'power2.out',
    }, 0);

    return this.timeline;
  }

  /**
   * Pulse a group (e.g., on selection)
   */
  pulseGroup(groupIndex: number, scale = 1.2, duration = 0.3): gsap.core.Tween {
    const gp = this.groupPositions[groupIndex];
    const originalR = gp.targetR;

    return gsap.to(gp, {
      r: originalR * scale,
      duration: duration / 2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gp.r = originalR;
      }
    });
  }

  /**
   * Animate a shimmer/glow effect
   */
  shimmer(element: { opacity: number }, duration = 0.5): gsap.core.Tween {
    return gsap.to(element, {
      opacity: 1,
      duration: duration / 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });
  }

  /**
   * Get current animation state
   */
  getState(): AnimationState {
    return { ...this.state };
  }

  /**
   * Check if animation is in progress
   */
  isAnimating(): boolean {
    return this.state.viewTransitionActive;
  }

  /**
   * Update group positions reference (e.g., after initialization)
   */
  setGroupPositions(positions: GroupPosition[]): void {
    this.groupPositions = positions;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
  }
}

// Singleton factory for easy use
let instance: AnimationController | null = null;

export function getAnimationController(groupPositions?: GroupPosition[]): AnimationController {
  if (!instance && groupPositions) {
    instance = new AnimationController(groupPositions);
  }
  if (!instance) {
    throw new Error('AnimationController not initialized. Pass groupPositions first.');
  }
  return instance;
}

export function destroyAnimationController(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
