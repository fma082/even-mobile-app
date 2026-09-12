/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: tokens/even-tokens.json (Tokens Studio export)
 * Regenerate: npm run tokens
 *
 * Hand-authored values that Figma does not own (motion, element sizes, opacity)
 * live in theme/tokens.ts, which composes this file.
 */

/** Semantic colors, aliases resolved to hex. */
export const colors = {
  canvas: "#FAFBFC",
  surface: "#FFFFFF",
  surfaceSunken: "#F5F5F7",
  borderSubtle: "#EEEEF2",
  borderStrong: "#E4E4EA",
  textPrimary: "#1A1A1F",
  textSecondary: "#71717A",
  textMuted: "#AEAEB6",
  accent: "#4C82F7",
  accentHover: "#3B6FE0",
  accentWeak: "#EDF3FE",
  accentOn: "#FFFFFF",
  icon: "#52525B",
  iconMuted: "#AEAEB6",
  iconActive: "#4C82F7",
  iconOnAccent: "#FFFFFF"
} as const;

/** Accent gradient (presence orb + wordmark), in stop order. */
export const gradient = {
  rotation: 100,
  stops: [
    {
      color: "#6CA4FF",
      position: 0
    },
    {
      color: "#A78BFA",
      position: 1
    }
  ]
} as const;

/** Accent gradient as a flat color array, for LinearGradient / SVG stops. */
export const gradientStops = [
  "#6CA4FF",
  "#A78BFA"
] as const;

/** Spacing scale. Keys are the value in dp — `16` is 16dp. */
export const spacing = {
  "2": 2,
  "4": 4,
  "8": 8,
  "12": 12,
  "16": 16,
  "20": 20,
  "24": 24,
  "32": 32,
  "40": 40,
  "48": 48
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  full: 999
} as const;

/** Family names as registered with expo-font. */
export const fontFamily = {
  display: "Fraunces",
  sans: "General Sans"
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600"
} as const;

/** Type styles. `letterSpacing` is already converted from % to dp. */
export const typography = {
  displayLg: {
    fontFamily: "Fraunces",
    fontWeight: "400",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.096
  },
  displaySm: {
    fontFamily: "Fraunces",
    fontWeight: "400",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0
  },
  heading: {
    fontFamily: "General Sans",
    fontWeight: "600",
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.095
  },
  title: {
    fontFamily: "General Sans",
    fontWeight: "600",
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.051
  },
  body: {
    fontFamily: "General Sans",
    fontWeight: "400",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0
  },
  bodyMedium: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0
  },
  caption: {
    fontFamily: "General Sans",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0
  },
  micro: {
    fontFamily: "General Sans",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0
  }
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypeVariant = keyof typeof typography;
