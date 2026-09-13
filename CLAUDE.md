# Even — Project context for Claude Code

Even is a **guide-first financial co-pilot for freelancers with irregular income**.
This file is the durable **scope, intent and roadmap**. For the current *build state*
(what's verified vs assumed, token pipeline internals, known traps), read **DEV_STATE.md**.
The app ships in **English**. The maintainer communicates in Spanish; product copy is English.

---

## 1. What Even is

- **User:** freelancers / anyone with income that goes up and down. "Income that rises and
  falls" is the through-line of the whole product.
- **Objective:** it does **not** show dashboards of data — it **guides proactively**. It
  surfaces decisions, explains the why, proposes an action, and lets the user approve/adjust/
  ignore. Everything is reversible.
- **Portfolio note:** this is the maintainer's first mobile product, meant to demonstrate
  product thinking + shipping + AI/governance UX. Right-sized on purpose (it is not a design-
  system showcase).

## 2. Product principles (do not violate)

- **Guide-first, never a dashboard.** No balance-and-charts home. If a screen needs data
  (e.g. Cashflow), lead with a **plain-language verdict** and let a visual support it — never
  make the user interpret a chart. The co-pilot reads the chart *for* the user.
- **Human over AI (the product's signature).** Even never acts without permission, always
  shows the why before the ask, and every action is reversible (undo). Even its *reading* of
  the user is correctable.
- **The "Decision" is the core reusable object.** Anatomy, in order:
  **Signal → Why (evidence) → Proposal → Control (Approve / Adjust / Ignore) → Reversible
  result (undo).** Evidence always comes *before* the proposal.
- **Honesty everywhere, including the paywall.** No fake urgency, no dark patterns, visible
  exit, cancel-anytime stated.
- **Silence is a feature.** When nothing needs the user, the co-pilot stays quiet (calm empty
  state), it does not manufacture alerts.

## 3. Information architecture

Tab bar (4 sections):
- **Home** — the co-pilot presence (the orb) + the decision(s) it surfaces. Entry to the
  decision flow. The expand button opens **Ask Even** (full-screen co-pilot).
- **Cashflow (Money)** — forecast, verdict-first. Honest uncertainty: irregular income means a
  **range that widens into the future**, never a false-precise line. Can also spawn decisions.
- **Learn** — content curated to the user's moment (each piece shows *why you're seeing this*);
  a browsable library below; opens an **Article** view.
- **Settings** — account, income connection, the **mandate** (what the co-pilot watches,
  editable), permissions/trust, subscription.

Overlays / flows (not tabs): **Decision (B)** expanded → **Adjust (C)** sheet → **Confirm +
undo (D)**; **Ask Even**; **Paywall**. **Onboarding** is a 5-step flow before the app: welcome
+ trust contract → connect income → reflection (co-pilot mirrors the variable income back) →
mandate (what to watch) → handoff (lands on Home, calm).

## 4. Design language

- **Aesthetic:** ultra-minimal, lots of white space, one blue accent, tasteful glow.
- **The AI presence is a blue→violet glowing orb.** The gradient is *meaningful* (it IS the
  co-pilot), never decoration. It is the ONE element with a persistent animation.
- **Color:** white surfaces on a subtle white→light-grey background gradient. Accent
  `#4C82F7`. Monochrome zinc neutrals. All values come from tokens.
- **Type:** **Fraunces** (display serif, weight 400, optical display) for **big display
  moments only** (greetings/titles). **General Sans** for all UI/body. Serif-display + sans-UI.
- **Cards:** white surface, soft drop shadow, and a subtle top highlight to read as "lit from
  above". NOTE: a white inner-bevel over a near-white card is invisible — use a real border +
  elevation, not a white-on-white inset.
- **Motion:** high-craft but restrained. Orchestrated **entrance** on Home (presence → greeting
  → the card **floats up and lands**, shadow settling). Everything else responds to touch
  (scale-down + haptic). Only the orb breathes persistently. Respect reduced-motion.
- **Icons:** `lucide-react-native` (House, ChartLine/TrendingUp, BookOpen, Settings, Bell,
  Maximize2, Menu, ChevronRight), colored via `icon/*` tokens (default / muted / active /
  on-accent).

## 5. Architecture & conventions

- **Stack:** Expo (Router, TypeScript strict) · NativeWind v4 · Reanimated · expo-haptics ·
  react-native-svg · expo-linear-gradient · expo-font. (Moti removed — unused.)
- **Tokens are the single source of truth.** `tokens/` holds the design tokens (Tokens Studio
  JSON). `theme/tokens.generated.ts` is generated from it (`npm run tokens`).
  `theme/tokens.ts` **composes** the generated tokens with the hand-authored engineering
  constants (motion, size, opacity, elevation). A token re-export must **never** overwrite motion.
- **No magic numbers** in components — always theme tokens / Tailwind classes derived from them.
- **Cross-platform = one design system.** Adapt only platform specifics (safe areas, haptics,
  back gesture) via `Platform` where needed. Do not fork the design.
- **Copilot LLM:** to be wired later to a **hosted open-source model** (e.g. Llama/Qwen via
  Groq/OpenRouter) behind a small server proxy — never ship a key in the app.

## 6. Working agreement

- **Show diffs before applying** non-trivial changes.
- **A web render does NOT prove native.** Always verify on device; web is structurally blind to
  RN-specific issues (e.g. cssInterop, masked-view stubs, elevation).
- **Fonts:** General Sans is Fontshare-licensed and **cannot** be committed — a clean clone
  falls back to system font (logged). Fraunces (OFL) is committed. `assets/fonts/README.md`
  lists exact filenames.

## 7. Roadmap (build order)

1. **Verify & finish Home** on device (close the open ⚠️ items in DEV_STATE.md).
2. **Decision flow:** Decision (B) → Adjust sheet (C) → Confirm + undo (D). This is the
   signature — floating cards + microinteractions live here.
3. **Onboarding** (5 steps).
4. **Cashflow** (verdict-first forecast) · **Learn + Article** · **Settings** (with the mandate).
5. **Ask Even** (full-screen co-pilot) + wire the hosted open-source LLM behind a proxy.
6. **Paywall** (honest).

Each screen: build from the design-system components, driven by mock data from
`services/copilot.ts` until the LLM is wired. Keep copy in English, in the co-pilot's calm,
first-person, plain voice.

@AGENTS.md
