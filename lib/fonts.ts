import type { FontSource } from 'expo-font';

import { tokens } from '@/theme/tokens';

/**
 * Discovers General Sans files dropped into assets/fonts/ — no code change needed.
 * Files are matched by name to tokens.fontFamily: GeneralSans-Regular / -Medium / -Semibold
 * (.otf or .ttf). Metro resolves require.context at bundle time, so restart
 * `npx expo start -c` after adding files.
 */
const fontFiles = require.context('../assets/fonts', false, /\.(otf|ttf)$/);

const stem = (key: string) => key.replace(/^.*\//, '').replace(/\.(otf|ttf)$/, '');

export function discoverBrandFonts(): { sources: Record<string, FontSource>; missing: string[] } {
  const keysByName = new Map(fontFiles.keys().map((key) => [stem(key), key]));
  const sources: Record<string, FontSource> = {};
  const missing: string[] = [];
  for (const family of Object.values(tokens.fontFamily)) {
    const key = keysByName.get(family);
    if (key) sources[family] = fontFiles(key) as FontSource;
    else missing.push(family);
  }
  return { sources, missing };
}
