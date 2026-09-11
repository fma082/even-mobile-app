export type SignalType = 'income' | 'tax' | 'savings' | 'spend';

export type DecisionStatus = 'pending' | 'approved' | 'ignored';

export type Decision = {
  id: string;
  signalType: SignalType;
  signalTitle: string;
  /** ISO 8601 timestamp. */
  detectedAt: string;
  evidence: { label: string }[];
  proposal: {
    statement: string;
    params: Record<string, number>;
    result: string;
  };
  status: DecisionStatus;
};
