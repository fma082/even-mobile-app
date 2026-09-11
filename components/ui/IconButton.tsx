import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export type IconButtonProps = Omit<PressableScaleProps, 'children' | 'accessibilityLabel'> & {
  icon: IconName;
  /** Required: icon-only controls must be named. */
  accessibilityLabel: string;
  variant?: 'outline' | 'plain';
};

export function IconButton({ icon, variant = 'outline', className, style, ...rest }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      hitSlop={tokens.size.hitSlop}
      className={cx(
        'items-center justify-center rounded-full',
        variant === 'outline' && 'border border-line bg-surface',
        className,
      )}
      style={[{ width: tokens.size.iconButton, height: tokens.size.iconButton }, style]}
      {...rest}>
      <Icon name={icon} />
    </PressableScale>
  );
}
