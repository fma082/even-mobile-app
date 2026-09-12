import { View } from 'react-native';

import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type SecondaryRowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  className?: string;
};

/** A quiet, lower-priority row: title + subtitle, chevron trailing. */
export function SecondaryRow({ title, subtitle, onPress, className }: SecondaryRowProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      className={cx(
        'flex-row items-center justify-between gap-16 rounded-sm bg-surface-sunken px-16 py-12',
        className,
      )}>
      <View className="flex-1 gap-2">
        <Text variant="bodyMedium">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="chevronRight" tone="muted" size={tokens.size.iconSm} />
    </PressableScale>
  );
}
