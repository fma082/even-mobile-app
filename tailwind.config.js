// Tailwind theme is DERIVED from the generated tokens — never add raw values here.
// Scales are REPLACED (not extended) so off-token classes like `p-7` or `bg-red-500` don't exist.
//
// The generated .json (not the .ts) is required because this config is plain CommonJS.
// Regenerate both with `npm run tokens`.
const { colors, spacing, radius, typography, fontAssets } = require('./theme/tokens.generated.json');

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const px = (scale) => Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, `${v}px`]));

/** Full semantic palette, kebab-cased: `canvas`, `surface-sunken`, `icon-on-accent`. */
const palette = Object.fromEntries(Object.entries(colors).map(([k, v]) => [kebab(k), v]));

/**
 * Pulls one semantic family out of the palette as its own scale, so utilities read the way the
 * design system names things — `text-primary`, `border-subtle`, `bg-accent-weak` — instead of
 * stuttering into `text-text-primary`. The family's own value becomes DEFAULT.
 */
const family = (prefix) =>
  Object.fromEntries(
    Object.entries(palette)
      .filter(([k]) => k === prefix || k.startsWith(`${prefix}-`))
      .map(([k, v]) => [k === prefix ? 'DEFAULT' : k.slice(prefix.length + 1), v]),
  );

const accent = family('accent');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors: { ...palette, transparent: 'transparent' },

    // bg-canvas, bg-surface, bg-surface-sunken, bg-accent, bg-accent-weak
    backgroundColor: {
      canvas: palette.canvas,
      surface: palette.surface,
      'surface-sunken': palette['surface-sunken'],
      accent,
      transparent: 'transparent',
    },
    // text-primary, text-secondary, text-muted, text-accent, text-accent-on
    textColor: { ...family('text'), accent },
    // border-subtle, border-strong, border-accent
    borderColor: { ...family('border'), accent },
    // fill-icon, fill-icon-muted, fill-icon-active, fill-icon-on-accent
    fill: family('icon'),

    // Keys are the value in dp, straight from the token export: `px-20` is 20dp.
    // `0` and `px` are geometry, not design decisions.
    spacing: { 0: '0px', ...px(spacing), px: '1px' },
    borderRadius: px(radius),

    fontFamily: Object.fromEntries(
      // Maps to the registered face at the family's regular weight; <Text variant> is the
      // real path to type, and picks the correct weight per style.
      fontAssets
        .filter((f) => f.weight === '400')
        .map((f) => [f.family === 'Fraunces' ? 'display' : 'sans', [f.key]]),
    ),
    fontSize: Object.fromEntries(
      Object.entries(typography).map(([k, t]) => [
        kebab(k),
        [
          `${t.fontSize}px`,
          {
            lineHeight: `${t.lineHeight}px`,
            letterSpacing: `${t.letterSpacing}px`,
            fontWeight: t.fontWeight,
          },
        ],
      ]),
    ),
    extend: {},
  },
  plugins: [],
};
