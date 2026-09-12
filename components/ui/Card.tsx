import { View, type ViewProps } from 'react-native';

import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { PressableScale } from './PressableScale';

/**
 * Drop shadow plus an inset top highlight. The highlight is what reads as a bevel: it lightens
 * the hairline border along the top edge only, so the card looks lit from above rather than
 * outlined. RN 0.86 supports inset boxShadow, so no overlay view is needed.
 */
const raisedShadow = `${tokens.shadow.card}, ${tokens.shadow.bevel}`;

export type CardProps = ViewProps & {
  className?: string;
  /** `raised`: white, hairline + accent glow. `sunken`: a quiet grey well. */
  tone?: 'raised' | 'sunken';
  /** Supplying this makes the whole card a button (scale-down + haptic). */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Card({ tone = 'raised', className, style, onPress, ...rest }: CardProps) {
  const raised = tone === 'raised';
  const classes = cx(
    'gap-16 rounded-lg p-20',
    raised ? 'border border-subtle bg-surface' : 'bg-surface-sunken',
    className,
  );
  const shadow = raised && { boxShadow: raisedShadow };

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        className={classes}
        style={[shadow, style]}
        {...rest}
      />
    );
  }

  return <View className={classes} style={[shadow, style]} {...rest} />;
}
