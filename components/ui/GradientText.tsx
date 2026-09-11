import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { useAppStore } from '@/store/app';
import { tokens, type TypeVariant } from '@/theme/tokens';

// Approximate cap height (em) used to optically center the text in its box.
const CAP_HEIGHT_EM = 0.7;

export type GradientTextProps = {
  children: string;
  variant?: TypeVariant;
  width: number;
  height: number;
};

/** Single-line text filled with the brand gradient (the "Even" wordmark). */
export function GradientText({ children, variant = 'display', width, height }: GradientTextProps) {
  const t = tokens.type[variant];
  const family = tokens.fontFamily[t.family];
  const hasBrandFont = useAppStore((s) => s.loadedFonts.includes(family));
  const id = `grad${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const lastStop = tokens.gradient.length - 1;

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={children} style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            {tokens.gradient.map((color, i) => (
              <Stop key={color} offset={i / lastStop} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <SvgText
          x={width / 2}
          y={(height + t.fontSize * CAP_HEIGHT_EM) / 2}
          textAnchor="middle"
          fill={`url(#${id})`}
          fontSize={t.fontSize}
          letterSpacing={t.letterSpacing}
          fontFamily={hasBrandFont ? family : undefined}
          fontWeight={hasBrandFont ? undefined : t.fontWeight}>
          {children}
        </SvgText>
      </Svg>
    </View>
  );
}
