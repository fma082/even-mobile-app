import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatDetectedAt } from '@/lib/format';
import { tokens } from '@/theme/tokens';
import type { Decision, SignalType } from '@/types/decision';

export const signalLabel: Record<SignalType, string> = {
  income: 'Income',
  tax: 'Taxes',
  savings: 'Savings',
  spend: 'Spending',
};

export type DecisionCardProps = {
  decision: Decision;
  onPress: () => void;
};

export function DecisionCard({ decision, onPress }: DecisionCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${signalLabel[decision.signalType]}. ${decision.signalTitle}. ${decision.proposal.statement}`}
      accessibilityHint="Opens the decision, with the reasoning and the proposal">
      <View className="flex-row items-center justify-between gap-8">
        <Chip label={signalLabel[decision.signalType]} />
        <Text variant="micro" tone="muted">
          {formatDetectedAt(decision.detectedAt)}
        </Text>
      </View>

      <View className="gap-4">
        <Text variant="heading">{decision.signalTitle}</Text>
        <Text variant="body" tone="secondary" numberOfLines={2}>
          {decision.proposal.statement}
        </Text>
      </View>

      {/* Hairline via border, not a background: the palette scopes border colours to borders. */}
      <View className="border-t border-subtle" />

      <View className="flex-row items-center justify-between">
        <Text variant="bodyMedium" tone="accent">
          See decision
        </Text>
        <Icon name="chevronRight" tone="active" size={tokens.size.iconSm} />
      </View>
    </Card>
  );
}
