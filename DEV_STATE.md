# Even — development state

Last updated: 2026-09-13 · branch `main` · https://github.com/fma082/even-mobile-app

This file records what is **not** recoverable by reading the code: why things are built the way
they are, which traps cost time, and what has actually been verified versus merely assumed.
For what the code does, read the code.

---

## Where the app is

Home is built and running on device. Everything else (`onboarding/*`, `decision/*`, `content/*`,
`paywall`, `cashflow`, `learn`, `settings`) is a `Placeholder` stub, present so every route can
be walked. The copilot LLM is **not** wired — `services/copilot.ts` returns mock data behind the
interface the UI depends on.

The app ships in **English**. Working conversation is in Spanish; product copy is not.

---

## The token pipeline

`tokens/even-tokens.json` (Tokens Studio export) is the single source of truth for colour,
spacing, radius and type. One command regenerates everything:

```sh
npm run tokens
```

It writes **two** generated files, both committed:

| File | Consumer | Why |
| --- | --- | --- |
| `theme/tokens.generated.ts` | app code | typed, `as const` |
| `theme/tokens.generated.json` | `tailwind.config.js` | that config is CommonJS and **cannot** `require` a `.ts` |

`theme/tokens.ts` composes the generated values with the things Figma does not describe —
`motion`, `size`, `opacity`, `elevation`. **A token re-export must never reset the spring that
makes the decision card land**, which is exactly why the generator does not write `tokens.ts`
directly.

`scripts/build-tokens.ts` also derives `fontAssets` from the type styles themselves, so adding a
weight in Figma surfaces as a *named missing file* rather than as silently wrong-looking type.

### Conventions the generator encodes

- **Aliases are set-relative and cross sets.** `{neutral.600}` resolves into `primitives`,
  `{accent.default}` into `semantic`, `{fontFamilies.display}` into `type`. The resolver indexes
  by path-minus-set-name and errors on ambiguity or cycles.
- **Spacing keys are literal dp.** `px-20` is 20dp. This is *not* Tailwind's `key × 4`
  convention — the export defines the scale that way.
- **Tracking is read as dp, the `%` suffix is ignored.** See the open item below.
- Semantic colours flatten to camelCase (`bg.canvas` → `canvas`, `accent.default` → `accent`,
  `icon.on-accent` → `iconOnAccent`), then `tailwind.config.js` splits them into scoped scales so
  utilities read as `text-primary` / `border-subtle` / `bg-accent-weak` rather than stuttering
  into `text-text-primary`.

---

## Traps — read before touching these

### NativeWind `cssInterop` returns a component; it does not mutate

`components/ui/PressableScale.tsx` was rendering the *unwrapped* animated Pressable, so
`className` was ignored on native. Every `PressableScale`-based component lost all its styling:
the card had no surface, `SecondaryRow` no background and a wrapped chevron, TabBar items no
`flex-1` so the labels ran together, and round icon buttons drew a grey disc because Android
renders `elevation` from the outline of a background-less view.

```js
const Styled = cssInterop(AnimatedPressable, { className: 'style' });  // use the RETURN value
```

### A web render cannot validate NativeWind styling

The bug above passed a browser render cleanly, because on web `className` reaches the DOM and CSS
applies it **whether or not NativeWind is wired up**. Web screenshots are fine for copy, layout
intent and colour, and are structurally blind to native style resolution.

To check the native path without a device, grep the served bundle:

```sh
curl -s "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true" \
  | grep -c StyledPressable
```

### No inset shadows

`elevation` tokens carry the iOS `shadow*` props and the Android `elevation` together; each
platform ignores the other's keys, so one object covers both without a `Platform` branch — and
without importing `react-native` into `theme/tokens.ts`, which `app.config.ts` loads at build
time.

RN 0.86 *does* parse `inset` (`processBoxShadow.js:145`), so that is not the reason to avoid it.
The reason is that an inset highlight on these surfaces is white-on-white and invisible, and
Android renders inset shadows unreliably.

### masked-view is native-only

`@react-native-masked-view/masked-view`'s web build is a 4-line stub that discards `children` and
renders only `maskElement`. The gradient wordmark therefore shows as solid text on web and as the
real gradient on iOS/Android. Not a bug; do not "fix" it.

### `require.context` resolves at bundle time

Adding font files needs `npx expo start -c`. A plain reload will not pick them up. Ordinary
source edits do **not** need `-c`.

---

## Verified vs assumed

| | How |
| --- | --- |
| ✅ iOS + Android Metro bundle | `npx expo export`, both platforms, clean |
| ✅ TypeScript strict, no `any` | `npx tsc --noEmit` |
| ✅ Home composition + English copy | headless Chrome render |
| ✅ Backdrop gradient reaches `#F5F5F7` | sampled pixels from the render |
| ✅ General Sans + Fraunces load | 4 DOM refs, visually confirmed on device |
| ✅ `cssInterop` fix reaches the device | grep of the served Android bundle |
| ⚠️ Native layout after the `cssInterop` fix | **not** confirmed on device yet |
| ⚠️ Wordmark gradient on native | looks blue-violet on Android; not confirmed as a gradient |
| ⚠️ Reduced-motion behaviour | coded, never exercised |
| ❌ iOS device/simulator | no full Xcode on this machine — only Command Line Tools |

---

## Open items

1. **Tracking units disagree with Figma.** The export writes `-0.3%`, which as a true percentage
   of a 32px display is −0.096dp (invisible). It is read as −0.3dp. Fix the unit in Tokens Studio
   so source and app agree, then `npm run tokens`.
2. **`canvas` and `surface` are 1.5% apart** (`#FAFBFC` / `#FFFFFF`), so a gradient between them
   can never be seen. Home's backdrop ends on `surface-sunken` as a workaround. A dedicated
   `bg.gradient` token pair would be the real fix.
3. **The tab bar sits ~2% lighter** than the content above it (`#FAFBFC` vs `#F5F5F7`), separated
   by the `border-subtle` hairline. Reads as a deliberate bar; revisit if it looks wrong.
4. **`moti` is still in `package.json` but unused.** Its tslib interop crashed Expo Router's
   static web render, so `PulseDot` moved to plain Reanimated. Safe to uninstall.
5. **The repo folder is `Even-moble-app`** (typo) while the GitHub repo is `even-mobile-app`.
   Harmless; git does not care.
6. Real LLM wiring. `services/copilot.ts` has the security notes: a key in `extra` ships inside
   the bundle and is extractable, so route through a proxy before release. The model may only
   **explain and propose** — every action goes through a user-approved, reversible Decision.

---

## Manual setup

Fonts are the only thing not reproducible from a clone: `Fraunces-Regular.ttf` is committed
(Google Fonts, OFL), but **General Sans is not redistributable** and must come from
[fontshare.com](https://www.fontshare.com/fonts/general-sans) — see `assets/fonts/README.md` for
the exact filenames, which are derived from the type tokens.

```sh
npm install
npm run tokens      # only needed after editing tokens/even-tokens.json
npx expo start -c
```
