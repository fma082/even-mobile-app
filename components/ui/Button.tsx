import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { Icon, type IconName, type IconTone } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Text, type Tone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'border border-strong bg-surface',
  ghost: 'bg-transparent',
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
      className={cx(
        'flex-row items-center justify-center gap-8 rounded-sm px-20 py-12',
        containerClass[variant],
        className,
      )}
      style={[disabled && { opacity: tokens.opacity.disabled }, style]}
      {...rest}>
      <Text variant="bodyMedium" tone={labelTone[variant]}>
        {label}
      </Text>
      {icon ? <Icon name={icon} tone={iconTone[variant]} size={tokens.size.iconSm} /> : null}
    </PressableScale>
  );
}
