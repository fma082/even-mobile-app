import Constants from 'expo-constants';

import { formatMoney } from '@/lib/format';
import type { Decision, DecisionOutcome } from '@/types/decision';

export type CopilotContext = { decisionId?: string };

export type CopilotReply = { text: string; source: 'mock' | 'llm' };

/** The seam the UI depends on. Swap the implementation, not the screens. */
export interface CopilotService {
  getDecisions(): Promise<Decision[]>;
  /** `amount` overrides the proposed one when the user adjusted it. */
  approveDecision(id: string, amount?: number): Promise<DecisionOutcome>;
  ignoreDecision(id: string): Promise<Decision>;
  /** Always available for a resolved decision — there is no undo window. */
  undoDecision(id: string): Promise<Decision>;
  askCopilot(prompt: string, context?: CopilotContext): Promise<CopilotReply>;
}

type CopilotConfig = { baseUrl?: string; model?: string; apiKey?: string };

export function readCopilotConfig(): CopilotConfig {
  const extra = Constants.expoConfig?.extra as { copilot?: CopilotConfig } | undefined;
  return extra?.copilot ?? {};
}

const MOCK_LATENCY_MS = 250;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function seedDecisions(now: Date): Decision[] {
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
  return [
    {
      id: 'dec_income_001',
      signalType: 'income',
      signalTitle: 'You got paid for a big project',
      detectedAt: daysAgo(2),
      evidence: [
        { label: 'Payment from Northfield Studio: 12,400' },
        { label: '32% above your six-month average' },
        { label: 'Your next quarterly tax payment is due on the 20th' },
      ],
      proposal: {
        statement: 'I can split it between taxes and your buffer — take a look.',
        // 25% of the payment, adjustable in 100-unit steps up to half of it.
        adjustable: { amount: 3100, min: 0, max: 6200, step: 100, basis: 12400 },
        result: 'Your reserve would cover three months of tax.',
      },
      status: 'pending',
    },
    {
      id: 'dec_spend_002',
      signalType: 'spend',
      signalTitle: 'Two subscriptions are overlapping',
      detectedAt: daysAgo(5),
      evidence: [{ label: 'Two cloud storage charges this month' }],
      proposal: {
        statement: 'Cancel one of the two and keep the cheaper plan.',
        adjustable: { amount: 29, min: 0, max: 29, step: 1, basis: 29 },
        result: "You'd save 348 a year.",
      },
      status: 'pending',
    },
  ];
}

/**
 * Mock decisions live for the lifetime of the JS context so approve and undo actually persist
 * across calls. A real implementation replaces this whole module, not just the data.
 */
let decisions: Decision[] | null = null;

const all = () => (decisions ??= seedDecisions(new Date()));

function find(id: string): Decision {
  const decision = all().find((d) => d.id === id);
  if (!decision) throw new Error(`Unknown decision "${id}"`);
  return decision;
}

function replace(next: Decision): Decision {
  decisions = all().map((d) => (d.id === next.id ? next : d));
  return next;
}

export async function getDecisions(): Promise<Decision[]> {
  await wait(MOCK_LATENCY_MS);
  return [...all()];
}

export async function approveDecision(id: string, amount?: number): Promise<DecisionOutcome> {
  await wait(MOCK_LATENCY_MS);
  const current = find(id);
  const approvedAmount = amount ?? current.proposal.adjustable.amount;
  const decision = replace({
    ...current,
    status: 'approved',
    resolvedAt: new Date().toISOString(),
    approvedAmount,
  });

  return {
    decision,
    // "in your plan" is load-bearing: Even recorded a commitment, it did not move money.
    summary: `${formatMoney(approvedAmount)} set aside in your plan. ${decision.proposal.result}`,
    nextStep: "Move it when you're ready.",
    reversible: true,
  };
}

export async function ignoreDecision(id: string): Promise<Decision> {
  await wait(MOCK_LATENCY_MS);
  return replace({ ...find(id), status: 'ignored', resolvedAt: new Date().toISOString() });
}

export async function undoDecision(id: string): Promise<Decision> {
  await wait(MOCK_LATENCY_MS);
  const { resolvedAt: _resolvedAt, approvedAmount: _approvedAmount, ...rest } = find(id);
  return replace({ ...rest, status: 'pending' });
}

export async function askCopilot(prompt: string, context: CopilotContext = {}): Promise<CopilotReply> {
  // TODO(copilot-llm): wire a hosted open-source model (Llama / Qwen) via OpenRouter or Groq.
  //  - Both expose an OpenAI-compatible `POST {baseUrl}/chat/completions` with
  //    `Authorization: Bearer <key>`; config comes from readCopilotConfig()
  //    (app.config.ts `extra.copilot` ← COPILOT_* in .env.local).
  //  - SECURITY: a key in `extra` is embedded in the app bundle and is extractable. Before
  //    release, route calls through a server proxy (e.g. an Expo Router API route or an edge
  //    function) that holds the key; the app should only know the proxy URL.
  //  - Human-over-AI: the model may only EXPLAIN and PROPOSE. Never execute an action from
  //    model output — every action goes through a user-approved, reversible Decision.
  await wait(MOCK_LATENCY_MS);
  const about = context.decisionId ? ` about ${context.decisionId}` : '';
  return { text: `(mock) I got your question${about}: "${prompt}"`, source: 'mock' };
}

export const copilot: CopilotService = {
  getDecisions,
  approveDecision,
  ignoreDecision,
  undoDecision,
  askCopilot,
};
