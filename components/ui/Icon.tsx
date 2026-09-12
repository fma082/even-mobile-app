import {
  Bell,
  BookOpen,
  ChartLine,
  ChevronRight,
  House,
  Maximize2,
  Menu,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';

import { tokens } from '@/theme/tokens';

/**
 * The app's icon vocabulary. Naming them by ROLE rather than by glyph means swapping
 * ChartLine for TrendingUp is a one-line change here, not a sweep through the screens.
 */
const ICONS = {
  home: House,
  cashflow: ChartLine,
  learn: BookOpen,
  settings: Settings,
  notifications: Bell,
  expand: Maximize2,
  menu: Menu,
  chevronRight: ChevronRight,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Icon colour roles, straight from the semantic `icon.*` tokens. */
export type IconTone = 'default' | 'muted' | 'active' | 'onAccent';

const toneColor: Record<IconTone, string> = {
  default: tokens.colors.icon,
  muted: tokens.colors.iconMuted,
  active: tokens.colors.iconActive,
  onAccent: tokens.colors.iconOnAccent,
};

export type IconProps = {
  name: IconName;
  tone?: IconTone;
  size?: number;
};

/** Decorative: label the pressable that contains it, not the icon. */
export function Icon({ name, tone = 'default', size = tokens.size.icon }: IconProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      size={size}
      color={toneColor[tone]}
      strokeWidth={tokens.size.iconStroke}
      pointerEvents="none"
    />
  );
}
