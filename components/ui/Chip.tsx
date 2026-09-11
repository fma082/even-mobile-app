import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cx } from '@/lib/cx';

import { Text } from './Text';

export type ChipProps = {
  label: string;
  /** e.g. a <PulseDot />. */
  leading?: ReactNode;
  tone?: 'accent' | 'neutral';
};

export function Chip({ label, leading, tone = 'accent' }: ChipProps) {
  return (
    <View
      className={cx(
        'flex-row items-center gap-2 self-start rounded-full px-3 py-1',
        tone === 'accent' ? 'bg-accentWeak' : 'bg-surfaceSunken',
      )}>
      {leading}
      <Text variant="caption" tone={tone === 'accent' ? 'accent' : 'ink2'}>
        {label}
      </Text>
    </View>
  );
}
