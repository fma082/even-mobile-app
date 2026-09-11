import { create } from 'zustand';

import { copilot } from '@/services/copilot';
import type { Decision } from '@/types/decision';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type AppState = {
  /** Brand font families that registered successfully; anything else falls back to system. */
  loadedFonts: string[];
  setLoadedFonts: (families: string[]) => void;

  pendingDecisions: Decision[];
  decisionsState: LoadState;
  loadPendingDecisions: () => Promise<void>;
};

export const useAppStore = create<AppState>()((set, get) => ({
  loadedFonts: [],
  setLoadedFonts: (loadedFonts) => set({ loadedFonts }),

  pendingDecisions: [],
  decisionsState: 'idle',
  loadPendingDecisions: async () => {
    if (get().decisionsState === 'loading') return;
    set({ decisionsState: 'loading' });
    try {
      const pendingDecisions = await copilot.getPendingDecisions();
      set({ pendingDecisions, decisionsState: 'ready' });
    } catch {
      set({ decisionsState: 'error' });
    }
  },
}));
