import { View } from 'react-native';

import { cx } from '@/lib/cx';

import { PulseDot } from './PulseDot';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  tone?: 'accent' | 'neutral';
  /** The pulsing dot marks a live signal; drop it for static labels. */
  live?: boolean;
};

export function Chip({ label, tone = 'accent', live = true }: ChipProps) {
  const accent = tone === 'accent';

  return (
    <View
      className={cx(
        'flex-row items-center gap-8 self-start rounded-full px-12 py-4',
        accent ? 'bg-accent-weak' : 'bg-surface-sunken',
      )}>
      {live ? <PulseDot /> : null}
      <Text variant="micro" tone={accent ? 'accent' : 'secondary'}>
        {label}
      </Text>
    </View>
  );
}
