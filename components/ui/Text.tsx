import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cx } from '@/lib/cx';
import { faceKey } from '@/lib/fonts';
import { useAppStore } from '@/store/app';
import { tokens, type TypeVariant } from '@/theme/tokens';

export type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'accentOn';

const toneClass: Record<Tone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted',
  accent: 'text-accent',
  accentOn: 'text-accent-on',
};

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  className?: string;
};

/**
 * The only way to set type. Size, line-height and tracking come from the type tokens; the brand
 * face is applied only once it has actually registered, otherwise we fall back to the system font
 * at the same weight so a missing file degrades instead of crashing.
 */
export function Text({ variant = 'body', tone = 'primary', className, style, ...rest }: TextProps) {
  const t = tokens.type[variant];
  const key = faceKey(t.fontFamily, t.fontWeight);
  const loaded = useAppStore((s) => (key ? s.loadedFonts.includes(key) : false));

  return (
    <RNText
      className={cx(toneClass[tone], className)}
      style={[
        { fontSize: t.fontSize, lineHeight: t.lineHeight, letterSpacing: t.letterSpacing },
        loaded ? { fontFamily: key } : { fontWeight: t.fontWeight },
        style,
      ]}
      {...rest}
    />
  );
}
