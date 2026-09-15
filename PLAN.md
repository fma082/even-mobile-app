# Even — build plan

Companion to `CLAUDE.md` (scope, principles) and `DEV_STATE.md` (what is true right now).
This is the sequenced *how*. Phases are ordered so each one de-risks the next.

---

## The motion thesis

Even's design language is restrained: only the orb animates persistently, everything else
answers a touch. That is a constraint on *how* to create engagement, not permission to skip it.

**A confirmation is the most important moment in the product.** It is where the user finds out
whether Even actually did what it said, and it is the only place the "human over AI" promise
becomes visible. A static receipt wastes it.

Three rules for every confirmation in this app:

1. **One-shot, orchestrated — never a loop.** A sequence with a beginning and an end. Loops
   belong to the orb alone.
2. **Motion must carry meaning.** Movement should show *what the decision does to the user's
   money*, not decorate the screen. If an animation could be swapped for a different one without
   changing what the user understands, cut it.
3. **The co-pilot reacts, the interface does not celebrate.** The orb is the presence; it is
   what acknowledges. No confetti, no bouncing checkmarks — this product handles someone's
   income.

Everything below honours reduced-motion by rendering the end state immediately.

---

## Phase 0 — Close the loop on what exists ✅

Done 2026-09-15 on a Moto g75. B → C → D works end to end, the `@expo/ui` Slider mounts and
drags with the share and remainder recalculating live, and Approve → Undo returns the decision
to Home as pending — the cycle that proves reversibility is real. The Slider fallback to
discrete presets was not needed.

---

## Phase 1 — Motion foundations

Build the vocabulary *before* adding screens, so five screens do not each invent their own.

**1.1 Motion tokens.** Extend the hand-authored `motion` group in `theme/tokens.ts` with a
`confirm` choreography (beat delays, spring configs, count duration). Figma does not own these;
they live beside `entrance`.

**1.2 `useChoreography` hook.** Generalise `useHomeEntrance`: a sequence of named beats with
delays, returning an animated style per beat, reduced-motion aware. Home's entrance becomes its
first consumer, the confirmation its second.

**1.3 Haptic vocabulary.** `lib/haptics.ts` has `press`, `select`, `approve`. Add:
- `tick` — light selection, for each slider step
- `commit` — the heavier notification at the moment an action lands

**1.4 Pending states on `Button`.** Approving hits the network. Today the button does nothing
while it waits. Add a `pending` prop: the label crossfades to a subtle indicator, the button
becomes non-interactive, and the press scale holds. Without this, every async action in the app
feels broken on a slow connection.

---

## Phase 2 — The confirmation moment (screen D)

The centrepiece. Replace the static receipt with a sequence, roughly 900 ms end to end:

| Beat | What happens | Why |
| --- | --- | --- |
| 0 ms | **The orb appears**, small, and brightens once | the co-pilot acknowledges — reuses the signature element instead of a generic checkmark |
| ~120 ms | **Haptic `commit`** on the orb's peak | the physical beat lands with the visual one |
| ~200 ms | **The amount settles** — scale + fade, carried from B | the same figure travels between screens, so the result reads as continuous rather than newly announced |
| ~450 ms | **The summary rises** in the co-pilot's voice | the explanation follows the fact, never precedes it |
| ~700 ms | **Undo fades in last** | present and permanent, but not competing with the result |

Undo deliberately arrives last and then simply stays — no countdown, no pulsing, nothing that
implies it is expiring. Its prominence comes from being permanently there, which is the whole
point.

**Undoing gets its own beat**: the amount returns to zero and the orb dims — the reversal is
shown, not just stated. Then back to Home, where the decision is pending again.

---

## Phase 3 — Microinteractions across the existing screens

Small, high-leverage, all on already-built surfaces.

- **Slider (C):** `tick` haptic on every step change. Cheapest engagement win in the app — it
  turns dragging into something you feel, and the amount is what the user is deciding.
- **Slider (C):** the derived "leaves $X available" figure crossfades rather than snapping.
- **Decision card (Home):** on tap, the card lifts slightly *before* navigating, so the
  transition begins on the surface the user touched.
- **Ignore ("Not now"):** the card settles away rather than vanishing — a dismissal should look
  like a decision, not a bug.
- **Chip pulse:** already built; audit that it is the only loop besides the orb.
- **Tab switches:** the active icon's colour transitions rather than cutting.

---

## Phase 4 — Onboarding (5 steps)

`welcome` → `connect` → `reflect` → `mandate` → `handoff`. The trust contract is the product's
first impression, and the **reflect** step is the emotional core: the co-pilot mirrors the user's
variable income back at them.

That step is the second-best motion opportunity in the app — the income visibly *rises and falls*
as the co-pilot describes it, which is the through-line of the whole product made visible.
`handoff` should land on Home already calm, reusing the Home entrance choreography.

The **mandate** step is never a blank setup form. Even **proposes** sensible defaults — taxes +
buffer, marked *recommended* — and the user edits them. Same pattern in Settings. A co-pilot that
hands you an empty form has not understood anything about you yet, which contradicts the reflect
step that just preceded it.

---

## Phase 5 — Cashflow, Learn, Settings

- **Cashflow** — verdict-first. A plain-language sentence leads; the visual supports it. Honest
  uncertainty: irregular income is a **range that widens into the future**, never a false-precise
  line. The widening should draw in on entry — the uncertainty is the message.
- **Learn** — each item states *why you're seeing this*. Curated list, browsable library below,
  opens an Article view.
- **Settings** — account, income connection, the editable **mandate**, permissions/trust,
  subscription. This is also where **history** lives, with undo available on past decisions.

---

## Phase 6 — Ask Even, then the LLM

Full-screen co-pilot behind the header's expand button. Build the UI against
`services/copilot.ts` mocks first, then wire a hosted open-source model **behind a proxy** — a
key in `extra` ships inside the bundle and is extractable. The proxy is key-security hygiene,
not a regulatory requirement: Even never touches the money (`CLAUDE.md` §2).

The model may only **explain and propose**. Every action still goes through a user-approved,
reversible Decision. This constraint is the product, not a limitation of the prototype.

---

## Phase 7 — Paywall

Honest by construction: no fake urgency, no dark patterns, visible exit, cancel-anytime stated
plainly. Worth building last, when there is enough product for the value to be self-evident.

---

## Decisions taken

1. **The amount settles in D** — scale and fade, carried from B — rather than counting up.
   Calmer, and it creates continuity: the same figure travels between screens instead of being
   announced twice.
2. **No hold-to-approve.** Persistent undo already removes the cost of a mistap, so the friction
   would be governance theatre — the opposite of the intent.
3. **The mandate is proposed, then edited.** Even pre-selects defaults marked *recommended*;
   the user adjusts. Never a blank form, in onboarding or in Settings.
4. **Even never moves money** — see `CLAUDE.md` §2. It detects, explains and proposes; the user
   approves and moves it in their own bank.
5. **v1 only RECORDS the commitment.** No bank deep-links, no copyable transfers — that is real
   integration scope that does not serve the thesis, and an outbound handoff would break the calm
   end of the confirmation. Even prepares and remembers; the user executes in their own world.
   D therefore ends in a **state**, not an action. A confirmable instruction is a later phase,
   and reads as "coming soon" in the case study.
6. **The confirmation copy is fixed** (`3b86bcb`+): headline *"It's in your plan."*, summary
   *"$3,100 set aside in your plan…"*, next step *"Move it when you're ready."* `summary` and
   `nextStep` are separate fields on `DecisionOutcome` because they are different speech acts —
   one reports, one asks — and Phase 2 gives each its own beat.

## Still open

Nothing blocking. The next open call is whatever Phase 0 turns up on the device.
