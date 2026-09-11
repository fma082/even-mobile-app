/**
 * Even design tokens — the SINGLE SOURCE OF TRUTH for color, space, radius, type and motion.
 *
 * PROVISIONAL: the blue direction is validated, the Figma rework is pending. Change values
 * here only — tailwind.config.js, app.config.ts and every component derive from this file.
 *
 * Keep this file plain data + pure helpers (no React Native imports): it is also loaded by
 * Tailwind and the Expo config at build time.
 */

const colors = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSunken: '#F5F5F7',
  ink: '#1A1A1F',
  ink2: '#71717A',
  ink3: '#AEAEB6',
  line: '#EEEEF2',
  lineStrong: '#E4E4EA',
  accent: '#4C82F7',
  accentWeak: '#EDF3FE',
  accentInk: '#FFFFFF',
  transparent: 'transparent',
} as const;

/** Presence orb + gradient text, in stop order. */
const gradient = ['#6CA4FF', '#8196FF', '#A78BFA'] as const;

/** Base-4 scale. Keys follow Tailwind's convention (key × 4 = px), so `p-4` is 16. */
const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

const radius = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

/** Family names registered at runtime; files are matched by name in assets/fonts/. */
const fontFamily = {
  regular: 'GeneralSans-Regular',
  medium: 'GeneralSans-Medium',
  semibold: 'GeneralSans-Semibold',
} as const;

type FontWeight = '400' | '500' | '600';

type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  family: keyof typeof fontFamily;
  letterSpacing: number;
};

const type = {
  display: { fontSize: 27, lineHeight: 34, fontWeight: '600', family: 'semibold', letterSpacing: -0.4 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600', family: 'semibold', letterSpacing: -0.3 },
  heading: { fontSize: 19, lineHeight: 24, fontWeight: '600', family: 'semibold', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400', family: 'regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '500', family: 'medium', letterSpacing: 0 },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400', family: 'regular', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', family: 'medium', letterSpacing: 0.1 },
} as const satisfies Record<string, TypeStyle>;

/** Fixed element sizes (dp). */
const size = {
  hairline: 1,
  dot: 6,
  icon: 20,
  iconSm: 16,
  iconStroke: 1.75,
  iconButton: 40,
  focusRing: 2,
  orb: 136,
  wordmarkWidth: 72,
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
 * Motion. Everything answers a user action, except the presence `breath` (the ONE
 * persistent loop) and the decision chip `pulse`. Durations in ms.
 */
const motion = {
  duration: { fast: 120, base: 220, slow: 420, breath: 3600, pulse: 1400 },
  pressScale: 0.97,
  spring: {
    press: { damping: 22, stiffness: 340, mass: 0.6 },
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

/** `#RRGGBB` + alpha → `rgba()`. Pure, so it is safe at build time too. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const shadow = {
  card: `0px 8px 24px 0px ${withAlpha(colors.accent, opacity.cardGlow)}`,
} as const;

export const tokens = {
  colors,
  gradient,
  spacing,
  radius,
  fontFamily,
  type,
  size,
  opacity,
  motion,
  shadow,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colors;
export type TypeVariant = keyof typeof type;
export type SpacingToken = keyof typeof spacing;
