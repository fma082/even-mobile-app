import { StyleSheet } from 'react-native';

import { tokens } from '@/theme/tokens';

import { Icon, type IconName, type IconTone } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';

// Resolved styles, not classes — see the note in Card.tsx.
const styles = StyleSheet.create({
  base: {
    width: tokens.size.iconButton,
    height: tokens.size.iconButton,
    borderRadius: tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: {
    backgroundColor: tokens.colors.surface,
    borderWidth: tokens.size.hairline,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.elevation.control,
  },
});

export type IconButtonProps = Omit<PressableScaleProps, 'children' | 'accessibilityLabel'> & {
  icon: IconName;
  /** Required: icon-only controls must be named. */
  accessibilityLabel: string;
  /** `plain` is just the glyph — no disc, no elevation. */
  variant?: 'raised' | 'plain';
  tone?: IconTone;
};

export function IconButton({
  icon,
  variant = 'plain',
  tone = 'default',
  className,
  style,
  ...rest
}: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      hitSlop={tokens.size.hitSlop}
      className={className}
      style={[styles.base, variant === 'raised' && styles.raised, style]}
      {...rest}>
      <Icon name={icon} tone={tone} />
    </PressableScale>
  );
}
