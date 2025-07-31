export type AnimationType = "fade-in" | "pulse" | "cross-dissolve";
export type ElementAnimationType = "none" | "fade-in" | "block-reveal" | "zoom-in" | "test-sweep" | "stick-on";

export interface AnimationConfig {
  name: string;
  description: string;
  duration: number;
  className: string;
}

export const animations: Record<AnimationType, AnimationConfig> = {
  "fade-in": {
    name: "Fade In",
    description: "Smooth fade-in effect",
    duration: 2000,
    className: "animate-fade-in",
  },
  "pulse": {
    name: "Pulse",
    description: "Gentle pulsing effect",
    duration: 2000,
    className: "animate-pulse-custom",
  },
  "cross-dissolve": {
    name: "Cross Dissolve",
    description: "Elegant cross-dissolve transition",
    duration: 2000,
    className: "animate-cross-dissolve",
  },
};

export const elementAnimations: Record<ElementAnimationType, AnimationConfig> = {
  "none": {
    name: "None",
    description: "No animation",
    duration: 0,
    className: "",
  },
  "fade-in": {
    name: "Fade In",
    description: "Smooth fade-in effect",
    duration: 1500,
    className: "animate-fade-in",
  },
  "block-reveal": {
    name: "Block Reveal",
    description: "Element slides in with color block reveal",
    duration: 1000,
    className: "animate-block-reveal",
  },
  "zoom-in": {
    name: "Zoom In",
    description: "Scale up from small",
    duration: 2500,
    className: "animate-zoom-in",
  },
  "test-sweep": {
    name: "L-R Sweep",
    description: "Color sweep overlay effect",
    duration: 5000,
    className: "animate-test-sweep",
  },
  "stick-on": {
    name: "Stick-on",
    description: "3D rotation with clipping reveal effect",
    duration: 2000,
    className: "animate-stick-on",
  },
};

export function getAnimationClass(animationType: AnimationType): string {
  return animations[animationType]?.className || "";
}

export function getAnimationDuration(animationType: AnimationType): number {
  return animations[animationType]?.duration || 2000;
}

export function getElementAnimationClass(animationType: ElementAnimationType): string {
  return elementAnimations[animationType]?.className || "";
}

export function getElementAnimationDuration(animationType: ElementAnimationType): number {
  return elementAnimations[animationType]?.duration || 0;
}

// Canvas animation functions for GIF generation
export function renderFadeInFrame(
  ctx: CanvasRenderingContext2D,
  progress: number,
  renderSignature: (ctx: CanvasRenderingContext2D, opacity: number) => void
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const opacity = Math.min(progress, 1);
  renderSignature(ctx, opacity);
}

export function renderPulseFrame(
  ctx: CanvasRenderingContext2D,
  progress: number,
  renderSignature: (ctx: CanvasRenderingContext2D, opacity: number, scale: number) => void
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const cycle = (progress * 2) % 2;
  const pulseProgress = cycle <= 1 ? cycle : 2 - cycle;
  const opacity = 0.8 + (0.2 * (1 - pulseProgress));
  const scale = 1 + (0.05 * pulseProgress);
  renderSignature(ctx, opacity, scale);
}

export function renderCrossDissolveFrame(
  ctx: CanvasRenderingContext2D,
  progress: number,
  renderSignature: (ctx: CanvasRenderingContext2D, opacity: number) => void
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let opacity = 0;
  if (progress <= 0.25) {
    opacity = progress * 1.2; // 0 to 0.3
  } else if (progress <= 0.5) {
    opacity = 0.3 + ((progress - 0.25) * 1.6); // 0.3 to 0.7
  } else if (progress <= 0.75) {
    opacity = 0.7 + ((progress - 0.5) * 0.8); // 0.7 to 0.9
  } else {
    opacity = 0.9 + ((progress - 0.75) * 0.4); // 0.9 to 1.0
  }
  renderSignature(ctx, Math.min(opacity, 1));
}
