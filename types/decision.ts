export type SignalType = 'income' | 'tax' | 'savings' | 'spend';

export type DecisionStatus = 'pending' | 'approved' | 'ignored';

/** One fact behind a proposal. Evidence is always shown BEFORE the proposal. */
export type Evidence = { label: string };

/**
 * The quantity the user drags in the Adjust sheet.
 *
 * `amount` is the value being decided — people decide in money, not in rates. The share and
 * what is left over are DERIVED from it and never stored, so they cannot drift out of sync
 * with the figure actually being moved.
 */
export type Adjustable = {
  /** Currency units to set aside. The slider's value. */
  amount: number;
  min: number;
  max: number;
  /** Slider granularity, in currency units. */
  step: number;
  /** The sum `amount` is taken out of — the income that arrived. */
  basis: number;
};

/** `amount` as a share of the basis, 0–100. Secondary label on the slider. */
export function sharePercent({ basis }: Adjustable, amount: number): number {
  return basis === 0 ? 0 : Math.round((amount / basis) * 100);
}

/** What stays available after setting `amount` aside. Derived, never editable. */
export function remainder({ basis }: Adjustable, amount: number): number {
  return basis - amount;
}

export type Decision = {
  id: string;
  signalType: SignalType;
  signalTitle: string;
  /** ISO 8601 timestamp. */
  detectedAt: string;
  evidence: Evidence[];
  proposal: {
    statement: string;
    adjustable: Adjustable;
    /** What the user gets out of it, in the co-pilot's voice. */
    result: string;
  };
  status: DecisionStatus;
  /** ISO 8601. Set on approve or ignore; cleared on undo. */
  resolvedAt?: string;
  /** The amount actually approved, which may differ from the proposed one. */
  approvedAmount?: number;
};

/**
 * The result of approving a decision.
 *
 * `reversible` is always true and carries no deadline: the decision moved money, so undo must
 * not depend on catching a timed toast. It is a field rather than an assumption so no screen
 * invents an expiry and renders a countdown, which would make reversibility theatrical.
 */
export type DecisionOutcome = {
  decision: Decision;
  /** Plain-language confirmation, first person, co-pilot voice. */
  summary: string;
  reversible: true;
};
