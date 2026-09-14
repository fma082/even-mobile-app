# Even — development state

Last updated: 2026-09-14 · branch `main` · https://github.com/fma082/even-mobile-app

This file records what is **not** recoverable by reading the code: why things are built the way
they are, which traps cost time, and what has actually been verified versus merely assumed.
For what the code does, read the code.

---

## Where the app is

Home is built and runs on device, but **its card and other pressable surfaces do not render
their containers on Android** — see open item 1, which is parked. Everything else
(`onboarding/*`, `decision/*`, `content/*`, `paywall`, `cashflow`, `learn`, `settings`) is a
`Placeholder` stub, present so every route can be walked. The copilot LLM is **not** wired — `services/copilot.ts` returns mock data behind the
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

### `className` does not reach Reanimated components on Android

NativeWind registers `View`, `Text`, `Pressable`, `ScrollView` and friends itself
(`react-native-css-interop/dist/runtime/components.js`) but **nothing from Reanimated**. So
`className` on `Animated.createAnimatedComponent(...)` depends on a manual `cssInterop`
registration, and on Android that does not hold.

Anything whose appearance matters must go through `style`, not `className`. See open item 1 —
this is live, not solved.

Note `cssInterop` both registers by side effect (`interopComponents.set(base, wrapper)`) **and**
returns the wrapper; NativeWind's own `components.js` discards the return. "Use the return value"
is therefore *not* the fix, and was chased once already.

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
| ✅ iOS + Android Metro bundle | `npx expo export`, both platforms, clean |
| ✅ TypeScript strict, no `any` | `npx tsc --noEmit` |
| ✅ Home composition + English copy | headless Chrome render |
| ✅ Backdrop gradient reaches `#F5F5F7` | sampled pixels from the render |
| ✅ General Sans + Fraunces load | 4 DOM refs, visually confirmed on device |
| ❌ Card renders a container on Android | **verified broken on Moto g75, works on web** — see open item 1 |
| ⚠️ The resolved-style fix (`e287766`) | pushed, **never loaded on a device** |
| ⚠️ Wordmark gradient on native | looks blue-violet on Android; not confirmed as a gradient |
| ⚠️ Reduced-motion behaviour | coded, never exercised |
| ❌ iOS device/simulator | no full Xcode on this machine — only Command Line Tools |

---

## Open items

1. ❌ **The Decision Card renders with no container on Android.** *Verified broken on a Moto g75,
   works on web — RN/NativeWind + Reanimated className registration.* **Parked 2026-09-14 to move
   on to the next screen; come back to this.**

   No white surface, no border, no shadow — the card reads as bare text on the background. The
   same failure hits everything else routed through `PressableScale`: `SecondaryRow` loses its
   background *and* `flex-row` (the chevron wraps below the text), TabBar items lose `flex-1` so
   the labels run together, `Button` loses its fill.

   **Cause.** NativeWind registers `View`, `Text` and `Pressable` itself but nothing from
   Reanimated, so `className` only reaches `PressableScale` — which renders
   `Animated.createAnimatedComponent(Pressable)` — through a manual `cssInterop` registration
   that does not hold on Android. Plain Views (the Chip) render correctly, which is the tell.

   **Two dead ends, do not repeat them:**
   - *"Use the `cssInterop` return value."* `cssInterop` does `interopComponents.set(base, wrapper)`
     as a side effect **and** returns the wrapper; NativeWind's own `components.js` discards the
     return. Registration was never the problem. Cost a device reload.
   - *A web render cannot see this at all.* On web `className` reaches the DOM and CSS applies it
     regardless of whether the interop works. Verify on device only.

   **Fix pushed but unverified:** `e287766` moves the container visuals of Card, IconButton,
   SecondaryRow, Button and the TabBar items to resolved style objects built from tokens, so they
   no longer depend on `className` at all. **Nobody has loaded this on a device.** When picking
   this up, load it first — the work may already be done.

   **How to tell whether it worked:** the chevron in `SecondaryRow` must sit to the *right* of the
   text, on the same line. Do not judge by its background: `#F5F5F7` on a ~`#F8F8F9` backdrop is
   nearly invisible even when applied correctly.

   **If it is still broken,** the next thing to try is keeping `className` off the animated node
   entirely — carry the press transform on a wrapper and let a stock `Pressable` (which NativeWind
   registers) hold the styling — rather than fighting the registration.

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
