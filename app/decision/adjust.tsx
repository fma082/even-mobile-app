import { Host, Slider } from '@expo/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/app';
import { tokens } from '@/theme/tokens';
import { remainder, sharePercent } from '@/types/decision';

// @expo/ui's Slider is a native control and needs an explicit height from its Host.
const styles = StyleSheet.create({ slider: { height: tokens.spacing[40] } });

/**
 * Adjust (C).
 *
 * The user drags the AMOUNT, because people decide in money, not in rates. The share and what
 * stays available are derived and read-only — showing them as editable would invite the two to
 * disagree with the figure actually being moved.
 *
 * Nothing here is committed: closing the sheet without confirming changes nothing.
 */
export default function AdjustDecisionSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const decision = useAppStore((s) => s.decisions.find((d) => d.id === id));
  const draft = useAppStore((s) => (id ? s.draftAmounts[id] : undefined));
  const setDraftAmount = useAppStore((s) => s.setDraftAmount);

  const adjustable = decision?.proposal.adjustable;
  const [amount, setAmount] = useState(draft ?? adjustable?.amount ?? 0);

  if (!decision || !adjustable) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-24">
        <Text variant="body" tone="secondary">
          I can&apos;t find that decision.
        </Text>
      </View>
    );
  }

  const onConfirm = () => {
    setDraftAmount(decision.id, amount);
    router.back();
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-end px-20 py-8">
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
      </View>

      <View className="flex-1 gap-32 px-20">
        <View className="gap-4">
          <Text variant="title" accessibilityRole="header">
            How much should I set aside?
          </Text>
          <Text variant="body" tone="secondary">
            From the {formatMoney(adjustable.basis)} that came in.
          </Text>
        </View>

        <View className="items-center gap-4">
          <Text variant="displayLg">{formatMoney(amount)}</Text>
          <Text variant="caption" tone="muted">
            {sharePercent(adjustable, amount)}% of this payment
          </Text>
        </View>

        <Host style={styles.slider}>
          <Slider
            value={amount}
            min={adjustable.min}
            max={adjustable.max}
            step={adjustable.step}
            onValueChange={setAmount}
          />
        </Host>

        <View className="items-center">
          <Text variant="body" tone="secondary">
            Leaves {formatMoney(remainder(adjustable, amount))} available to spend.
          </Text>
        </View>
      </View>

      <View className="gap-8 px-20" style={{ paddingBottom: insets.bottom + tokens.spacing[20] }}>
        <Button label="Use this amount" onPress={onConfirm} />
        <Button label="Cancel" variant="ghost" haptic="select" onPress={() => router.back()} />
      </View>
    </View>
  );
}
