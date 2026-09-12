/**
 * Even design tokens — the single entry point for every visual value in the app.
 *
 * Colour, spacing, radius and type come from Figma via tokens/even-tokens.json and are
 * REGENERATED (`npm run tokens`); never edit them here. Motion, element sizes and opacity
 * are authored below, because Figma does not describe them — a token re-export must never
 * silently reset the spring that makes the decision card land.
 *
 * Keep this file plain data + pure helpers (no React Native imports): app.config.ts loads it
 * at build time.
 */
import {
  colors,
  fontFamily,
  fontWeight,
  gradient,
  gradientStops,
  radius,
  spacing,
  typography,
} from './tokens.generated';

/** `#RRGGBB` + alpha → `rgba()`. Pure, so it is safe at build time too. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Fixed element sizes (dp). Geometry, not design tokens. */
const size = {
  hairline: 1,
  dot: 6,
  icon: 20,
  iconSm: 16,
  iconStroke: 1.75,
  iconButton: 40,
  focusRing: 2,
  orb: 136,
  wordmarkHeight: 34,
  tabBarHeight: 56,
  tabBarFade: 24,
  hitSlop: 8,
} as const;

const opacity = {
  pressed: 0.7,
  disabled: 0.4,
  cardGlow: 0.1,
  orbCore: 1,
  orbHalo: 0.35,
} as const;

/**
 * Motion. Everything answers a user action, except the presence `breath` (the ONE persistent
 * loop) and the decision chip `pulse`. Durations in ms.
 */
const motion = {
  duration: { fast: 120, base: 220, slow: 420, breath: 3600, pulse: 1400 },
  pressScale: 0.97,
  spring: {
    press: { damping: 22, stiffness: 340, mass: 0.6 },
    /** Deliberately under-damped: the card overshoots slightly, then settles. */
    surface: { damping: 15, stiffness: 130, mass: 1 },
    presence: { damping: 14, stiffness: 90, mass: 1 },
  },
  entrance: {
    greetingDelay: 320,
    cardDelay: 640,
    presenceFromScale: 0.6,
    greetingRise: 8,
    cardRise: 28,
    cardFromScale: 0.96,
  },
  breath: { scaleFrom: 0.94, scaleTo: 1.04, opacityFrom: 0.8, opacityTo: 1 },
  pulse: { opacityFrom: 0.5, scaleTo: 2.4 },
} as const;

const shadow = {
  /** The card's drop shadow — an accent-tinted glow, not a grey box shadow. */
  card: `0px 8px 24px 0px ${withAlpha(colors.accent, opacity.cardGlow)}`,
  /** Inner top highlight that reads as a bevel on raised surfaces. */
  bevel: `inset 0px 1px 0px 0px ${withAlpha(colors.surface, 0.9)}`,
} as const;

export const tokens = {
  colors,
  gradient,
  gradientStops,
  spacing,
  radius,
  fontFamily,
  fontWeight,
  type: typography,
  size,
  opacity,
  motion,
  shadow,
} as const;

export type Tokens = typeof tokens;
export type { ColorToken, RadiusToken, SpacingToken, TypeVariant } from './tokens.generated';
