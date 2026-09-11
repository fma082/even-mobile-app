// Tailwind theme is DERIVED from theme/tokens.ts — never add raw values here.
// Scales are replaced (not extended) so off-token classes like `p-7` or `bg-red-500` don't exist.
const { tokens } = require('./theme/tokens');

const px = (scale) => Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, `${v}px`]));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors: tokens.colors,
    spacing: { ...px(tokens.spacing), px: '1px' },
    borderRadius: px(tokens.radius),
    fontFamily: Object.fromEntries(
      Object.entries(tokens.fontFamily).map(([k, family]) => [k, [family]]),
    ),
    fontSize: Object.fromEntries(
      Object.entries(tokens.type).map(([k, t]) => [
        k,
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
