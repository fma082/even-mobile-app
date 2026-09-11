import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cx } from '@/lib/cx';
import { useAppStore } from '@/store/app';
import { tokens, type ColorToken, type TypeVariant } from '@/theme/tokens';

export type Tone = Extract<ColorToken, 'ink' | 'ink2' | 'ink3' | 'accent' | 'accentInk'>;

const toneClass: Record<Tone, string> = {
  ink: 'text-ink',
  ink2: 'text-ink2',
  ink3: 'text-ink3',
  accent: 'text-accent',
  accentInk: 'text-accentInk',
};

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  className?: string;
};

/**
 * The only way to set type. Size/line-height/tracking come from tokens.type; the General Sans
 * family is applied only once it has loaded, otherwise the system font + weight is used.
 */
export function Text({ variant = 'body', tone = 'ink', className, style, ...rest }: TextProps) {
  const t = tokens.type[variant];
  const family = tokens.fontFamily[t.family];
  const hasBrandFont = useAppStore((s) => s.loadedFonts.includes(family));

  return (
    <RNText
      className={cx(toneClass[tone], className)}
      style={[
        { fontSize: t.fontSize, lineHeight: t.lineHeight, letterSpacing: t.letterSpacing },
        hasBrandFont ? { fontFamily: family } : { fontWeight: t.fontWeight },
        style,
      ]}
      {...rest}
    />
  );
}
