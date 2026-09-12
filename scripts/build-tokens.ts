/**
 * Generates theme/tokens.generated.ts from tokens/even-tokens.json (Tokens Studio format).
 *
 * Run `npm run tokens` after every re-export from Tokens Studio. This is the ONLY step
 * needed to update the app's visual system — nothing downstream is hand-edited.
 *
 * Aliases in the export are set-relative and may cross sets: `{neutral.600}` resolves into
 * `primitives`, `{accent.default}` into `semantic`, `{fontFamilies.display}` into `type`.
 * So the index is keyed by the path WITHOUT its set name, and a collision is a hard error.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(root, 'tokens/even-tokens.json');
const OUTPUT = resolve(root, 'theme/tokens.generated.ts');

type GradientValue = {
  type: string;
  rotation: string;
  stops: { color: string; position: string }[];
};
type TypographyValue = Record<string, string>;
type TokenValue = string | GradientValue | TypographyValue;
type Token = { value: TokenValue; type: string; description?: string };
type Node = Token | { [key: string]: Node };

const isToken = (node: Node): node is Token =>
  typeof node === 'object' && node !== null && 'value' in node && 'type' in node;

/** Sets whose contents are token trees; everything else in the file is metadata. */
const SET_ORDER = ['primitives', 'semantic', 'scale', 'type'] as const;

const raw = JSON.parse(readFileSync(SOURCE, 'utf8')) as Record<string, Node>;

// ---------------------------------------------------------------------------
// Index + alias resolution
// ---------------------------------------------------------------------------

/** Set-relative path → token. `primitives.neutral.600` is indexed as `neutral.600`. */
const index = new Map<string, Token>();

function indexSet(node: Node, path: string[]): void {
  if (isToken(node)) {
    const key = path.join('.');
    const existing = index.get(key);
    if (existing && existing !== node) {
      throw new Error(
        `Ambiguous alias target "${key}" — two sets define it, so {${key}} is unresolvable.`,
      );
    }
    index.set(key, node);
    return;
  }
  for (const [key, child] of Object.entries(node)) indexSet(child, [...path, key]);
}

for (const set of SET_ORDER) {
  const node = raw[set];
  if (!node) throw new Error(`Missing token set "${set}" in ${SOURCE}`);
  indexSet(node, []);
}

const ALIAS = /^\{([^}]+)\}$/;

function resolveString(value: string, seen: string[] = []): string {
  const match = ALIAS.exec(value.trim());
  if (!match) return value;
  const key = match[1];
  if (seen.includes(key)) throw new Error(`Alias cycle: ${[...seen, key].join(' → ')}`);
  const target = index.get(key);
  if (!target) throw new Error(`Unresolved alias {${key}}`);
  if (typeof target.value !== 'string') {
    throw new Error(`Alias {${key}} points at a composite token, which cannot be inlined.`);
  }
  return resolveString(target.value, [...seen, key]);
}

function lookup(path: string): Token {
  const token = index.get(path);
  if (!token) throw new Error(`Expected token "${path}" in ${SOURCE}`);
  return token;
}

function stringValue(path: string): string {
  const { value } = lookup(path);
  if (typeof value !== 'string') throw new Error(`Token "${path}" is not a scalar.`);
  return resolveString(value);
}

// ---------------------------------------------------------------------------
// Shaping
// ---------------------------------------------------------------------------

const camel = (s: string) => s.replace(/-(.)/g, (_, c: string) => c.toUpperCase());

/**
 * Flattens `semantic` into flat camelCase color keys:
 *   bg.canvas → canvas        (the `bg` group is implicit)
 *   accent.default → accent   (`default` collapses into its group)
 *   icon.on-accent → iconOnAccent
 */
function semanticColorKey(group: string, leaf: string): string {
  if (group === 'bg') return camel(leaf);
  if (leaf === 'default') return camel(group);
  return camel(group) + camel(leaf).charAt(0).toUpperCase() + camel(leaf).slice(1);
}

const semantic = raw.semantic as Record<string, Record<string, Token>>;

const colors: Record<string, string> = {};
for (const [group, members] of Object.entries(semantic)) {
  if (group === 'gradient') continue; // composite, emitted separately
  for (const [leaf, token] of Object.entries(members)) {
    if (typeof token.value !== 'string') continue;
    colors[semanticColorKey(group, leaf)] = resolveString(token.value);
  }
}

const gradientToken = lookup('gradient.accent');
const gradientValue = gradientToken.value as GradientValue;
const gradient = {
  rotation: Number(gradientValue.rotation),
  stops: gradientValue.stops.map((stop) => ({
    color: resolveString(stop.color),
    position: Number(stop.position),
  })),
};

const numbersFrom = (group: Record<string, Token>) =>
  Object.fromEntries(
    Object.entries(group).map(([key, token]) => [key, Number(resolveString(token.value as string))]),
  );

const scale = raw.scale as Record<string, Record<string, Token>>;
const spacing = numbersFrom(scale.spacing);
const radius = numbersFrom(scale.radius);

const typeSet = raw.type as Record<string, Record<string, Token>>;
const fontFamily = Object.fromEntries(
  Object.entries(typeSet.fontFamilies).map(([key, token]) => [key, resolveString(token.value as string)]),
);
const fontWeight = Object.fromEntries(
  Object.entries(typeSet.fontWeights).map(([key, token]) => [key, resolveString(token.value as string)]),
);

/**
 * Tokens Studio writes tracking as a percentage of the font size; React Native's
 * `letterSpacing` is in points. Convert once, here, so components never do math.
 */
function letterSpacingPx(value: string, fontSize: number): number {
  const trimmed = value.trim();
  const px = trimmed.endsWith('%')
    ? (fontSize * Number(trimmed.slice(0, -1))) / 100
    : Number(trimmed);
  return Math.round(px * 1000) / 1000;
}

const typography = Object.fromEntries(
  Object.entries(typeSet.typography).map(([key, token]) => {
    const value = token.value as TypographyValue;
    const fontSize = Number(resolveString(value.fontSize));
    return [
      camel(key),
      {
        fontFamily: resolveString(value.fontFamily),
        fontWeight: resolveString(value.fontWeight),
        fontSize,
        lineHeight: Number(resolveString(value.lineHeight)),
        letterSpacing: letterSpacingPx(value.letterSpacing, fontSize),
      },
    ];
  }),
);

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const literal = (value: unknown) => JSON.stringify(value, null, 2).replace(/"([A-Za-z_$][\w$]*)":/g, '$1:');

const banner = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: tokens/even-tokens.json (Tokens Studio export)
 * Regenerate: npm run tokens
 *
 * Hand-authored values that Figma does not own (motion, element sizes, opacity)
 * live in theme/tokens.ts, which composes this file.
 */`;

const out = `${banner}

/** Semantic colors, aliases resolved to hex. */
export const colors = ${literal(colors)} as const;

/** Accent gradient (presence orb + wordmark), in stop order. */
export const gradient = ${literal(gradient)} as const;

/** Accent gradient as a flat color array, for LinearGradient / SVG stops. */
export const gradientStops = ${literal(gradient.stops.map((s) => s.color))} as const;

/** Spacing scale. Keys are the value in dp — \`16\` is 16dp. */
export const spacing = ${literal(spacing)} as const;

export const radius = ${literal(radius)} as const;

/** Family names as registered with expo-font. */
export const fontFamily = ${literal(fontFamily)} as const;

export const fontWeight = ${literal(fontWeight)} as const;

/** Type styles. \`letterSpacing\` is already converted from % to dp. */
export const typography = ${literal(typography)} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypeVariant = keyof typeof typography;
`;

writeFileSync(OUTPUT, out);

const count = index.size;
console.log(`✓ ${OUTPUT.replace(root + '/', '')} — ${count} tokens resolved`);
console.log(`  colors: ${Object.keys(colors).join(', ')}`);
console.log(`  spacing: ${Object.keys(spacing).join(', ')}`);
console.log(`  radius: ${Object.keys(radius).join(', ')}`);
console.log(`  type: ${Object.keys(typography).join(', ')}`);
