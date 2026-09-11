import { View, type ViewProps } from 'react-native';

import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

export type CardProps = ViewProps & {
  className?: string;
  /** `raised`: white with hairline + soft accent glow. `sunken`: quiet grey well. */
  tone?: 'raised' | 'sunken';
};

export function Card({ tone = 'raised', className, style, ...rest }: CardProps) {
  return (
    <View
      className={cx(
        'rounded-xl p-5',
        tone === 'raised' ? 'border border-line bg-surface' : 'bg-surfaceSunken',
        className,
      )}
      style={[tone === 'raised' && { boxShadow: tokens.shadow.card }, style]}
      {...rest}
    />
  );
}
