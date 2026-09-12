import { View, type ViewProps } from 'react-native';

import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { PressableScale } from './PressableScale';

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
  const raised = tone === 'raised';
  const classes = cx(
    'gap-16 rounded-lg p-20',
    raised ? 'border border-subtle bg-surface' : 'bg-surface-sunken',
    className,
  );
  // The border carries the edge; the shadow carries the lift. No inset highlight — it would be
  // white on white, and Android renders inset shadows unreliably.
  const lift = raised && tokens.elevation.card;

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        className={classes}
        style={[lift, style]}
        {...rest}
      />
    );
  }

  return <View className={classes} style={[lift, style]} {...rest} />;
}
