import { StyleSheet } from 'react-native';

import { tokens } from '@/theme/tokens';

import { Icon, type IconName, type IconTone } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Text, type Tone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// Resolved styles, not classes — see the note in Card.tsx.
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[8],
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing[20],
    paddingVertical: tokens.spacing[12],
  },
  primary: { backgroundColor: tokens.colors.accent },
  secondary: {
    backgroundColor: tokens.colors.surface,
    borderWidth: tokens.size.hairline,
    borderColor: tokens.colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
});

const variantStyle: Record<ButtonVariant, object> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

const labelTone: Record<ButtonVariant, Tone> = {
  primary: 'accentOn',
  secondary: 'primary',
  ghost: 'accent',
};

const iconTone: Record<ButtonVariant, IconTone> = {
  primary: 'onAccent',
  secondary: 'default',
  ghost: 'active',
};

export type ButtonProps = Omit<PressableScaleProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  /** Trailing icon. */
  icon?: IconName;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  disabled,
  className,
  style,
  ...rest
}: ButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={className}
      style={[
        styles.base,
        variantStyle[variant],
        disabled && { opacity: tokens.opacity.disabled },
        style,
      ]}
      {...rest}>
      <Text variant="bodyMedium" tone={labelTone[variant]}>
        {label}
      </Text>
      {icon ? <Icon name={icon} tone={iconTone[variant]} size={tokens.size.iconSm} /> : null}
    </PressableScale>
  );
}
