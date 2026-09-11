import Svg, { Path } from 'react-native-svg';

import { tokens, type ColorToken } from '@/theme/tokens';

// 24×24 stroke icons. Paths are geometry, not design values.
const paths = {
  expand: ['M14 4h6v6', 'M10 20H4v-6', 'M20 4l-6 6', 'M4 20l6-6'],
  menu: ['M4 9h16', 'M4 15h16'],
  chevronRight: ['M9 6l6 6-6 6'],
  home: ['M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z'],
  cashflow: ['M4 17l5-5 4 4 7-7', 'M15 9h5v5'],
  learn: [
    'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z',
    'M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z',
  ],
  settings: ['M4 8h9', 'M17 8h3', 'M4 16h3', 'M11 16h9', 'M15 6v4', 'M9 14v4'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof paths;

export type IconProps = {
  name: IconName;
  color?: ColorToken;
  size?: number;
};

/** Decorative: label the pressable that contains it, not the icon. */
export function Icon({ name, color = 'ink', size = tokens.size.icon }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" pointerEvents="none">
      {paths[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={tokens.colors[color]}
          strokeWidth={tokens.size.iconStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
