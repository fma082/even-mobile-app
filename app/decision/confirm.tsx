import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useAppStore } from '@/store/app';
import { tokens } from '@/theme/tokens';

/**
 * Confirm (D).
 *
 * A STATE, not a toast. The decision moved money, so undo must not depend on the user catching
 * a timed banner: it is a permanent control here, it carries no countdown, and the decision
 * stays reversible from history afterwards. That is the difference between real reversibility
 * and the theatrical kind.
 */
export default function ConfirmDecisionScreen() {
  const insets = useSafeAreaInsets();
  const outcome = useAppStore((s) => s.lastOutcome);
  const undoDecision = useAppStore((s) => s.undoDecision);

  const onUndo = async () => {
    if (outcome) await undoDecision(outcome.decision.id);
    router.dismissTo('/');
  };

  return (
    <View
      className="flex-1 justify-between bg-canvas px-20"
      style={{ paddingTop: insets.top + tokens.spacing[48], paddingBottom: insets.bottom + tokens.spacing[20] }}>
      <View className="items-center gap-16">
        <Icon name="approve" tone="active" size={tokens.size.orb / 4} />
        {/* Not "Done." — that would read as though the transfer had happened. Even recorded a
            commitment; the user still moves the money in their own bank. */}
        <Text variant="displaySm" className="text-center" accessibilityRole="header">
          It&apos;s in your plan.
        </Text>
        {outcome ? (
          <>
            <Text variant="body" tone="secondary" className="text-center">
              {outcome.summary}
            </Text>
            <Text variant="bodyMedium" className="text-center">
              {outcome.nextStep}
            </Text>
          </>
        ) : null}
      </View>

      <View className="gap-8">
        <Text variant="caption" tone="muted" className="text-center">
          You can undo this anytime.
        </Text>
        <Button label="Undo" variant="secondary" icon="undo" onPress={onUndo} />
        <Button label="Done" onPress={() => router.dismissTo('/')} />
      </View>
    </View>
  );
}
