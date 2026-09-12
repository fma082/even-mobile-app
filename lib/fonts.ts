import type { FontSource } from 'expo-font';

import { fontAssets } from '@/theme/tokens.generated';

/**
 * Brand fonts, discovered from assets/fonts/ — no code change needed to add a weight.
 *
 * WHICH files are required is derived from the type styles themselves (see fontAssets in the
 * generated tokens), so adding a weight in Figma surfaces here as a named missing file rather
 * than as silently wrong-looking type.
 *
 * Metro resolves require.context at bundle time, so restart `npx expo start -c` after dropping
 * files in.
 */
const fontFiles = require.context('../assets/fonts', false, /\.(otf|ttf)$/);

const stem = (key: string) => key.replace(/^.*\//, '').replace(/\.(otf|ttf)$/, '');

const KEY_BY_FACE = new Map(fontAssets.map((a) => [`${a.family}|${a.weight}`, a.key]));

/** The name a (family, weight) pair is registered under, or undefined if the DS has no such face. */
export function faceKey(family: string, weight: string): string | undefined {
  return KEY_BY_FACE.get(`${family}|${weight}`);
}

export type DiscoveredFonts = {
  sources: Record<string, FontSource>;
  /** Human-readable descriptions of faces the design system needs but assets/fonts/ lacks. */
  missing: string[];
};

export function discoverBrandFonts(): DiscoveredFonts {
  const byStem = new Map(fontFiles.keys().map((key) => [stem(key), key]));
  const sources: Record<string, FontSource> = {};
  const missing: string[] = [];

  for (const asset of fontAssets) {
    const file = byStem.get(asset.file);
    if (file) sources[asset.key] = fontFiles(file) as FontSource;
    else missing.push(`${asset.file}.otf/.ttf (${asset.family} ${asset.weight})`);
  }

  return { sources, missing };
}
