import { create } from 'zustand';

import { copilot } from '@/services/copilot';
import type { Decision, DecisionOutcome } from '@/types/decision';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type AppState = {
  /** Brand font faces that registered successfully; anything else falls back to system. */
  loadedFonts: string[];
  setLoadedFonts: (families: string[]) => void;

  /** Every decision, whatever its status — undo needs the resolved ones to stay reachable. */
  decisions: Decision[];
  decisionsState: LoadState;
  /** The most recent approval, for the confirmation screen. */
  lastOutcome: DecisionOutcome | null;

  loadDecisions: () => Promise<void>;
  approveDecision: (id: string, amount?: number) => Promise<DecisionOutcome | null>;
  ignoreDecision: (id: string) => Promise<void>;
  undoDecision: (id: string) => Promise<void>;
};

/** Decisions still waiting on the user. */
export const pendingDecisions = (decisions: Decision[]) =>
  decisions.filter((d) => d.status === 'pending');

/**
 * Decisions the user already resolved. Every one of them is still reversible — there is no
 * undo window — which is what lets history offer undo rather than just a receipt.
 */
export const resolvedDecisions = (decisions: Decision[]) =>
  decisions.filter((d) => d.status !== 'pending');

export const useAppStore = create<AppState>()((set, get) => ({
  loadedFonts: [],
  setLoadedFonts: (loadedFonts) => set({ loadedFonts }),

  decisions: [],
  decisionsState: 'idle',
  lastOutcome: null,

  loadDecisions: async () => {
    if (get().decisionsState === 'loading') return;
    set({ decisionsState: 'loading' });
    try {
      set({ decisions: await copilot.getDecisions(), decisionsState: 'ready' });
    } catch {
      set({ decisionsState: 'error' });
    }
  },

  approveDecision: async (id, amount) => {
    try {
      const outcome = await copilot.approveDecision(id, amount);
      set((s) => ({
        decisions: s.decisions.map((d) => (d.id === id ? outcome.decision : d)),
        lastOutcome: outcome,
      }));
      return outcome;
    } catch {
      return null;
    }
  },

  ignoreDecision: async (id) => {
    try {
      const decision = await copilot.ignoreDecision(id);
      set((s) => ({ decisions: s.decisions.map((d) => (d.id === id ? decision : d)) }));
    } catch {
      // Leave the decision pending: a failed dismissal must not look like it worked.
    }
  },

  undoDecision: async (id) => {
    try {
      const decision = await copilot.undoDecision(id);
      set((s) => ({
        decisions: s.decisions.map((d) => (d.id === id ? decision : d)),
        lastOutcome: s.lastOutcome?.decision.id === id ? null : s.lastOutcome,
      }));
    } catch {
      // Same: keep showing it as resolved rather than claiming a revert that did not happen.
    }
  },
}));
