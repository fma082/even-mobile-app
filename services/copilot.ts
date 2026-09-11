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
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  return [
    {
      id: 'dec_income_001',
      signalType: 'income',
      signalTitle: 'Cobraste más que tu promedio',
      detectedAt: hoursAgo(2),
      evidence: [
        { label: 'Ingreso de Estudio Norte: $ 1.840.000' },
        { label: '32% por encima de tu promedio de 6 meses' },
        { label: 'Tu próximo pago de monotributo vence el 20' },
      ],
      proposal: {
        statement: 'Apartar el 25% a tu reserva de impuestos antes de que se mezcle con tus gastos.',
        params: { percent: 25, amount: 460000 },
        result: 'Tu reserva cubriría 3 meses de monotributo.',
      },
      status: 'pending',
    },
    {
      id: 'dec_spend_002',
      signalType: 'spend',
      signalTitle: 'Suscripciones duplicadas',
      detectedAt: hoursAgo(30),
      evidence: [{ label: 'Dos cobros de almacenamiento en la nube este mes' }],
      proposal: {
        statement: 'Cancelar una de las dos suscripciones.',
        params: { monthlySaving: 4200 },
        result: 'Ahorrarías $ 50.400 al año.',
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
  const about = context.decisionId ? ` sobre ${context.decisionId}` : '';
  return { text: `(mock) Recibí tu pregunta${about}: "${prompt}"`, source: 'mock' };
}

export const copilot: CopilotService = { getPendingDecisions, askCopilot };
