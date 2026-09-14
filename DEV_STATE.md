# Even — development state

Last updated: 2026-09-14 · branch `main` · https://github.com/fma082/even-mobile-app

This file records what is **not** recoverable by reading the code: why things are built the way
they are, which traps cost time, what has actually been verified versus merely assumed, and the
product decisions that were made in conversation and left no trace in the source.
For what the code does, read the code. For scope and roadmap, read `CLAUDE.md`.

---

## Where the app is

Home and the full decision flow (`decision/[id]` → `adjust` → `confirm`) are built, and Home
**renders correctly on an Android device** as of 2026-09-14. `onboarding/*`, `content/*`,
`paywall`, `cashflow` and `learn` are still `Placeholder` stubs, present so every route can be
walked. The copilot LLM is **not** wired — `services/copilot.ts` returns mock data behind the
interface the UI depends on.

The app ships in **English**. Working conversation is in Spanish; product copy is not.

### Stack

`expo ~57.0.22` · `react-native 0.86.3` · `react-native-reanimated 4.5.1` · `nativewind ^4.2.6`
· `zustand ^5.0.15` · `@expo/ui ~57.0.18` · `lucide-react-native ^1.45.0` ·
`@react-native-masked-view/masked-view 0.3.2` · `expo-dev-client ~57.0.19`

### What exists

| | |
| --- | --- |
| **Design system** | `Text` `Button` `Card` `Chip` `IconButton` `SecondaryRow` `TabBar` `Icon` `PressableScale` `PresenceOrb` `PulseDot` `GradientText` |
| **Decision** | `DecisionCard` `EvidenceList` · routes `decision/[id]` (B), `adjust` (C), `confirm` (D) |
| **Data** | `services/copilot.ts` (mock, in-memory) · `store/app.ts` (zustand) · `types/decision.ts` |
| **Theme** | `tokens/even-tokens.json` → `scripts/build-tokens.ts` → `theme/tokens.generated.{ts,json}` → `theme/tokens.ts` |
| **Stubs** | onboarding ×5 · `content/[slug]` · `paywall` · `cashflow` · `learn` · `settings` |

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
- **Tracking is read as dp, the `%` suffix is ignored.** See open item 1.
- Semantic colours flatten to camelCase (`bg.canvas` → `canvas`, `accent.default` → `accent`,
  `icon.on-accent` → `iconOnAccent`), then `tailwind.config.js` splits them into scoped scales so
  utilities read as `text-primary` / `border-subtle` / `bg-accent-weak` rather than stuttering
  into `text-text-primary`.

---

## The decision flow

The `Decision` is the product's core reusable object. Its anatomy — **Signal → Why → Proposal →
Control → Reversible** — is a product rule, not a layout preference: evidence is rendered
*before* the ask so the user approves reasoning they have seen rather than trusting an
instruction. See `CLAUDE.md` §2.

### The adjustable model

`proposal.adjustable` is `{ amount, min, max, step, basis }`. **`amount` is the value the user
drags**, because people decide in money, not in rates. The share and the remainder are computed
by `sharePercent()` and `remainder()` and are **never stored** — storing them would let them
drift from the figure actually being moved.

`basis` exists as a number because it has to: the payment total originally lived only as text
inside an `evidence.label`, which made the percentage underivable.

### Undo is persistent

There is no undo window, and `DecisionOutcome.reversible` is a field rather than an assumption
so that no screen invents an expiry and renders a countdown. The decision moved money;
reversibility that depends on catching a timed banner is theatrical. Consequences:

- `confirm` (D) is a **state**, not a toast. Undo is a permanent control there.
- The store keeps **every** decision, not just pending ones, so history can offer undo.
- A failed approve or undo leaves the previous status untouched — a revert that did not happen
  must never look like it did.

### Adjust is not committed until approved

The in-progress amount lives in `store.draftAmounts[id]`, not in route params, so the sheet can
hand the value back to screen B and **closing the sheet without confirming changes nothing
real**. Approving clears the draft, so undo restores the proposal rather than a half-made edit.

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

### Money never goes through `Intl`

`lib/format.ts` formats by hand. Hermes ships `Intl` inconsistently across platforms, and the
amount is the figure the user is deciding on, so it must render identically everywhere. Currency
lives in one constant there — `{ symbol: '$', group: ',' }`, and it is **literally USD**.

### `require.context` resolves at bundle time

Adding font files needs `npx expo start -c`. A plain reload will not pick them up. Ordinary
source edits do **not** need `-c`.

---

## Product decisions made in conversation

These shaped the code and are invisible in it.

| Decision | Why |
| --- | --- |
| The Adjust slider moves the **amount**, not the percentage | people decide in money; the percentage is a secondary derived label |
| Undo is **persistent**, never a 10s snackbar | the decision moved money; real reversibility, not theatrical |
| Currency is **literally USD**, not a local-currency placeholder | market is international freelancers billing in USD |
| Both header buttons are **plain** — glyph only, no disc | matches the ultra-minimal direction; also proved the grey disc was the dev-client overlay |
| Spacing classes use **literal dp keys** (`px-20`) | matches the token export rather than inventing a `×4` mapping |
| Tracking read as **dp**, ignoring the `%` suffix | the true percentage gave −0.096dp on a 32px display: invisible |
| Home's backdrop ends on **`surface-sunken`** | `canvas` is 1.5% off `surface`, so that gradient could never be seen |
| `@expo/ui`'s native **Slider** over a custom gesture control | its universal layer works in Expo Go on SDK 56+, so no custom build was needed for it |

---

## The development build

Expo Go was ruled out as the cause of the rendering bug, but the dev build stays — it is the
recommended setup for a real app and removes a whole class of doubt.

- EAS project `e228d9af-e097-4562-9c78-9420e96aed6d`, owner `byfma`
- Bundle identifier **`com.fma082.even`** on both platforms — effectively permanent once published
- `eas.json` `development` profile: `developmentClient`, `distribution: "internal"`, and
  **`buildType: "apk"`** — the default `aab` cannot be sideloaded onto a device
- The Android keystore is managed by EAS. Losing it means never shipping an update to that app
  again; retrieve it with `npx eas-cli credentials`

```sh
npx eas-cli build --platform android --profile development   # ~10–20 min, plus queue
npx expo start --dev-client                                  # the flag matters
```

Rebuild only for new native modules or config-plugin changes. JS and TS changes hot-reload.

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
| ✅ Slider maths (share, remainder) | exercised across the full range in node |
| ✅ Pressable surfaces render on Android | confirmed on a Moto g75 after the `PressableScale` rewrite |
| ⚠️ The whole decision flow B → C → D | never walked on a device; approve/undo never exercised |
| ⚠️ Press feedback still springs | the transform moved to the wrapper; not felt on a device |
| ⚠️ The @expo/ui Slider in Adjust | bundles and types; a native control has never mounted here |
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
npm run tokens      # only after editing tokens/even-tokens.json
npx expo start -c
```
