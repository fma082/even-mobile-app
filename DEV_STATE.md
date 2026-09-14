# Even — development state

Last updated: 2026-09-14 · branch `main` · https://github.com/fma082/even-mobile-app

This file records what is **not** recoverable by reading the code: why things are built the way
they are, which traps cost time, and what has actually been verified versus merely assumed.
For what the code does, read the code.

---

## Where the app is

Home and the full decision flow (`decision/[id]` → `adjust` → `confirm`) are built. Pressable
surfaces did not render their containers on Android; the fix is in but **not yet seen on a
device** — open item 1. `onboarding/*`, `content/*`, `paywall`, `cashflow` and `learn` are still
`Placeholder` stubs, present so every route can be walked. The copilot LLM is **not** wired —
`services/copilot.ts` returns mock data behind the interface the UI depends on.

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

### Never style an `Animated.createAnimatedComponent(...)` node

On Android, styling one drops **both** `className` and `style`. Verified on a Moto g75 in Expo
Go *and* in a development build, so it is not an Expo Go limitation.

`components/ui/PressableScale.tsx` is the pattern to copy: an `Animated.View` carries the
transform and nothing else, and every visible style lands on a **stock `Pressable`**, which both
React Native and NativeWind fully understand. A `containerStyle` prop exists for the rare case
where the pressable must claim space in its parent's layout (the tab bar items).

Two theories chased and disproved, do not repeat them:
- *"Use the `cssInterop` return value."* It both registers by side effect
  (`interopComponents.set(base, wrapper)`) **and** returns the wrapper; NativeWind's own
  `components.js` discards the return. Registration was never the problem.
- *"Avoid Tailwind, pass resolved `style` objects instead."* Necessary but not sufficient —
  `style` was being dropped too.

### A web render cannot validate NativeWind styling

The bug above passed a browser render cleanly, because on web `className` reaches the DOM and CSS
applies it **whether or not NativeWind is wired up**. Web screenshots are fine for copy, layout
intent and colour, and are structurally blind to native style resolution.

A bundle grep confirms *which code* the device is running, but never that it renders correctly:

```sh
curl -s "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true" \
  | grep -c SomeMarker
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
| ✅ Android development build (EAS) | installed and running on a Moto g75 |
| ✅ iOS + Android Metro bundle | `npx expo export`, both platforms, clean |
| ✅ TypeScript strict, no `any` | `npx tsc --noEmit` |
| ✅ Home composition + English copy | headless Chrome render |
| ✅ Backdrop gradient reaches `#F5F5F7` | sampled pixels from the render |
| ✅ General Sans + Fraunces load | 4 DOM refs, visually confirmed on device |
| ✅ Expo Go ruled out as the cause | the development build reproduced it identically |
| ⚠️ Pressable surfaces render on Android | `PressableScale` rewritten; **not yet seen on a device** |
| ⚠️ The @expo/ui Slider in Adjust | bundles and types; a native control has never mounted here |
| ⚠️ Wordmark gradient on native | looks blue-violet on Android; not confirmed as a gradient |
| ⚠️ Reduced-motion behaviour | coded, never exercised |
| ❌ iOS device/simulator | no full Xcode on this machine — only Command Line Tools |

---

## Open items

1. ⚠️ **Pressable surfaces did not render their containers on Android.** *Verified broken on a
   Moto g75 in Expo Go **and** in a development build, so Expo Go is ruled out.* The Decision
   Card showed as bare text with no surface, border or shadow; `SecondaryRow` lost its background
   and its `flex-row` (the chevron wrapped below the text); TabBar items lost `flex-1` so the
   labels ran together; `Button` lost its fill.

   **Cause, confirmed.** Styling an `Animated.createAnimatedComponent(Pressable)` node drops
   **both** `className` and `style` on Android. Plain Views (the Chip) always rendered correctly,
   which was the tell.

   **Fix applied** (`PressableScale`): the `Animated.View` now carries the press transform and
   nothing else, and every visible style lands on a stock `Pressable`. `cssInterop` is gone from
   the codebase. `containerStyle` exists for pressables that must claim space in their parent's
   layout — only the tab bar items do.

   **Still unverified on a device.** When picking this up, load it and check **the chevron in
   `SecondaryRow`: it must sit to the right of the text, on the same line.** Do not judge by its
   background — `#F5F5F7` on a ~`#F8F8F9` backdrop is nearly invisible even when applied
   correctly. If it renders, close this item and the ⚠️ rows in the table above.

2. **Tracking units disagree with Figma.** The export writes `-0.3%`, which as a true percentage
   of a 32px display is −0.096dp (invisible). It is read as −0.3dp. Fix the unit in Tokens Studio
   so source and app agree, then `npm run tokens`.
3. **`canvas` and `surface` are 1.5% apart** (`#FAFBFC` / `#FFFFFF`), so a gradient between them
   can never be seen. Home's backdrop ends on `surface-sunken` as a workaround. A dedicated
   `bg.gradient` token pair would be the real fix.
4. **The tab bar sits ~2% lighter** than the content above it (`#FAFBFC` vs `#F5F5F7`), separated
   by the `border-subtle` hairline. Reads as a deliberate bar; revisit if it looks wrong.
5. **`moti` is still in `package.json` but unused.** Its tslib interop crashed Expo Router's
   static web render, so `PulseDot` moved to plain Reanimated. Safe to uninstall.
6. **The repo folder is `Even-moble-app`** (typo) while the GitHub repo is `even-mobile-app`.
   Harmless; git does not care.
7. Real LLM wiring. `services/copilot.ts` has the security notes: a key in `extra` ships inside
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
