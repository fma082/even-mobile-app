import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EvidenceList } from '@/components/decision/EvidenceList';
import { signalLabel } from '@/components/decision/DecisionCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { formatDetectedAt, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/app';
import { sharePercent } from '@/types/decision';

/**
 * The Decision, expanded (B).
 *
 * Order is the product's signature and is not negotiable: Signal → Why → Proposal → Control.
 * The evidence comes BEFORE the ask, so the user is approving reasoning they have seen rather
 * than trusting an instruction.
 */
export default function DecisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const decision = useAppStore((s) => s.decisions.find((d) => d.id === id));
  const decisionsState = useAppStore((s) => s.decisionsState);
  const loadDecisions = useAppStore((s) => s.loadDecisions);
  const draft = useAppStore((s) => (id ? s.draftAmounts[id] : undefined));
  const approveDecision = useAppStore((s) => s.approveDecision);
  const ignoreDecision = useAppStore((s) => s.ignoreDecision);

  // Deep links land here without the list having been fetched.
  useEffect(() => {
    if (decisionsState === 'idle') loadDecisions();
  }, [decisionsState, loadDecisions]);

  if (!decision) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-24">
        <Text variant="body" tone="secondary">
          {decisionsState === 'loading' ? 'One moment…' : "I can't find that decision."}
        </Text>
      </View>
    );
  }

  const { adjustable } = decision.proposal;
  const amount = draft ?? adjustable.amount;

  const onApprove = async () => {
    const outcome = await approveDecision(decision.id, amount);
    if (outcome) router.replace('/decision/confirm');
  };

  const onIgnore = async () => {
    await ignoreDecision(decision.id);
    router.dismissTo('/');
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-20 py-8">
        <IconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerClassName="gap-32 px-20 pb-32">
        <View className="gap-12">
          <View className="flex-row items-center justify-between gap-8">
            <Chip label={signalLabel[decision.signalType]} />
            <Text variant="micro" tone="muted">
              {formatDetectedAt(decision.detectedAt)}
            </Text>
          </View>
          <Text variant="displaySm" accessibilityRole="header">
            {decision.signalTitle}
          </Text>
        </View>

        <View className="gap-12">
          <Text variant="micro" tone="muted" accessibilityRole="header">
            WHY
          </Text>
          <EvidenceList items={decision.evidence} />
        </View>

        <Card>
          <Text variant="body" tone="secondary">
            {decision.proposal.statement}
          </Text>

          <View className="gap-4">
            <Text variant="displayLg">{formatMoney(amount)}</Text>
            <Text variant="caption" tone="muted">
              {sharePercent(adjustable, amount)}% of {formatMoney(adjustable.basis)}
              {draft === undefined ? '' : ' · adjusted'}
            </Text>
          </View>

          <View className="border-t border-subtle" />

          <Text variant="body" tone="secondary">
            {decision.proposal.result}
          </Text>
        </Card>

        <View className="gap-8">
          <Button label="Approve" icon="approve" onPress={onApprove} />
          <Button
            label="Adjust the amount"
            variant="secondary"
            onPress={() => router.push({ pathname: '/decision/adjust', params: { id: decision.id } })}
          />
          <Button label="Not now" variant="ghost" haptic="select" onPress={onIgnore} />
        </View>
      </ScrollView>
    </View>
  );
}
