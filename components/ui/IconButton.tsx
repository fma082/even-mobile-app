import { cx } from '@/lib/cx';
import { tokens } from '@/theme/tokens';

import { Icon, type IconName, type IconTone } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export type IconButtonProps = Omit<PressableScaleProps, 'children' | 'accessibilityLabel'> & {
  icon: IconName;
  /** Required: icon-only controls must be named. */
  accessibilityLabel: string;
  variant?: 'raised' | 'plain';
  tone?: IconTone;
};

/** Circular control. `raised` carries the same bevel treatment as Card, at button scale. */
export function IconButton({
  icon,
  variant = 'raised',
  tone = 'default',
  className,
  style,
  ...rest
}: IconButtonProps) {
  const raised = variant === 'raised';

  return (
    <PressableScale
      accessibilityRole="button"
      hitSlop={tokens.size.hitSlop}
      className={cx(
        'items-center justify-center rounded-full',
        raised && 'border border-subtle bg-surface',
        className,
      )}
      style={[
        { width: tokens.size.iconButton, height: tokens.size.iconButton },
        raised && { boxShadow: tokens.shadow.bevel },
        style,
      ]}
      {...rest}>
      <Icon name={icon} tone={tone} />
    </PressableScale>
  );
}
