import { StyleSheet, View, type ViewProps } from 'react-native';

import { tokens } from '@/theme/tokens';

import { PressableScale } from './PressableScale';

/**
 * Container visuals are a RESOLVED STYLE OBJECT, not Tailwind classes.
 *
 * NativeWind registers View/Text/Pressable itself, but nothing from Reanimated. PressableScale
 * renders Animated.createAnimatedComponent(Pressable), and className does not survive on that
 * component on Android — which is why the card rendered as bare text. Anything that must be
 * visible goes through `style`; values still come from tokens, never literals.
 */
const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[20],
    gap: tokens.spacing[16],
  },
  raised: {
    backgroundColor: tokens.colors.surface,
    // The border is what guarantees the edge: borders always render on Android, shadows do not.
    borderWidth: tokens.size.hairline,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.elevation.card,
  },
  sunken: {
    backgroundColor: tokens.colors.surfaceSunken,
  },
});

export type CardProps = ViewProps & {
  className?: string;
  /** `raised`: a white surface floating above the canvas. `sunken`: a quiet grey well. */
  tone?: 'raised' | 'sunken';
  /** Supplying this makes the whole card a button (scale-down + haptic). */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Card({ tone = 'raised', className, style, onPress, ...rest }: CardProps) {
  const base = [styles.base, tone === 'raised' ? styles.raised : styles.sunken, style];

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        className={className}
        style={base}
        {...rest}
      />
    );
  }

  return <View className={className} style={base} {...rest} />;
}
