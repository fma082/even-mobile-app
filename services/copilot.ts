import Constants from 'expo-constants';

import type { Decision } from '@/types/decision';

export type CopilotContext = { decisionId?: string };

export type CopilotReply = { text: string; source: 'mock' | 'llm' };

/** The seam the UI depends on. Swap the implementation, not the screens. */
export interface CopilotService {
  getPendingDecisions(): Promise<Decision[]>;
  askCopilot(prompt: string, context?: CopilotContext): Promise<CopilotReply>;
}

type CopilotConfig = { baseUrl?: string; model?: string; apiKey?: string };

export function readCopilotConfig(): CopilotConfig {
  const extra = Constants.expoConfig?.extra as { copilot?: CopilotConfig } | undefined;
  return extra?.copilot ?? {};
}

const MOCK_LATENCY_MS = 250;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function mockDecisions(now: Date): Decision[] {
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
  return [
    {
      id: 'dec_income_001',
      signalType: 'income',
      signalTitle: 'You got paid for a big project',
      detectedAt: daysAgo(2),
      evidence: [
        { label: 'Payment from Northfield Studio: $12,400' },
        { label: '32% above your six-month average' },
        { label: 'Your next quarterly tax payment is due on the 20th' },
      ],
      proposal: {
        statement: 'I can split it between taxes and your buffer — take a look.',
        params: { percent: 25, amount: 3100 },
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
        params: { monthlySaving: 29 },
        result: "You'd save $348 a year.",
      },
      status: 'pending',
    },
  ];
}

export async function getPendingDecisions(): Promise<Decision[]> {
  await wait(MOCK_LATENCY_MS);
  return mockDecisions(new Date()).filter((d) => d.status === 'pending');
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

export const copilot: CopilotService = { getPendingDecisions, askCopilot };
