import { StyleSheet, View } from 'react-native';

import { tokens } from '@/theme/tokens';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

// Resolved styles, not classes — see the note in Card.tsx.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing[16],
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surfaceSunken,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[12],
  },
  label: { flex: 1, gap: tokens.spacing[2] },
});

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
      className={className}
      style={styles.row}>
      <View style={styles.label}>
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
