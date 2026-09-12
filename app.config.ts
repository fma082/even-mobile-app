// Lets this config import other TypeScript files (theme/tokens.ts).
import 'tsx/cjs';

import type { ConfigContext, ExpoConfig } from 'expo/config';

import { tokens } from './theme/tokens';

// app.json holds static config; this layer injects token-derived values and env, so
// colors stay single-sourced in theme/tokens.ts.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Even',
  slug: config.slug ?? 'even',
  backgroundColor: tokens.colors.canvas,
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-splash-screen',
      {
        backgroundColor: tokens.colors.canvas,
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  extra: {
    ...config.extra,
    // Read by services/copilot.ts. Expo CLI loads these from .env / .env.local.
    // NOTE: everything in `extra` ships inside the app bundle — dev use only (see copilot.ts).
    copilot: {
      baseUrl: process.env.COPILOT_BASE_URL,
      model: process.env.COPILOT_MODEL,
      apiKey: process.env.COPILOT_API_KEY,
    },
  },
});
