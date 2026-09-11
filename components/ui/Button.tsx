import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Text, type Tone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-accentWeak',
  ghost: 'bg-transparent',
};

const labelTone: Record<ButtonVariant, Tone> = {
  primary: 'accentInk',
  secondary: 'accent',
  ghost: 'accent',
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
        'flex-row items-center justify-center gap-2 rounded-full px-5 py-3',
        containerClass[variant],
        className,
      )}
      style={[disabled && { opacity: tokens.opacity.disabled }, style]}
      {...rest}>
      <Text variant="bodyStrong" tone={labelTone[variant]}>
        {label}
      </Text>
      {icon ? <Icon name={icon} color={labelTone[variant]} size={tokens.size.iconSm} /> : null}
    </PressableScale>
  );
}
