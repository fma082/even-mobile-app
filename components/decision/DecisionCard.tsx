import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { PulseDot } from '@/components/ui/PulseDot';
import { Text } from '@/components/ui/Text';
import { formatDetectedAt } from '@/lib/format';
import { tokens } from '@/theme/tokens';
import type { Decision, SignalType } from '@/types/decision';

export const signalLabel: Record<SignalType, string> = {
  income: 'Ingreso',
  tax: 'Impuestos',
  savings: 'Ahorro',
  spend: 'Gasto',
};

export type DecisionCardProps = {
  decision: Decision;
  onPress: () => void;
};

export function DecisionCard({ decision, onPress }: DecisionCardProps) {
  const signals = decision.evidence.length;
  const meta = `${formatDetectedAt(decision.detectedAt)} · ${signals} ${signals === 1 ? 'señal' : 'señales'}`;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${signalLabel[decision.signalType]}. ${decision.signalTitle}. ${decision.proposal.statement}`}
      accessibilityHint="Abre la decisión con el porqué y la propuesta"
      className="self-stretch rounded-xl">
      <Card className="gap-4">
        <View className="flex-row items-center justify-between">
          <Chip label={signalLabel[decision.signalType]} leading={<PulseDot />} />
          <Text variant="caption" tone="ink3">
            {meta}
          </Text>
        </View>

        <View className="gap-1">
          <Text variant="heading">{decision.signalTitle}</Text>
          <Text variant="body" tone="ink2" numberOfLines={2}>
            {decision.proposal.statement}
          </Text>
        </View>

        <View className="h-px bg-line" />

        <View className="flex-row items-center justify-between">
          <Text variant="bodyStrong" tone="accent">
            Ver decisión
          </Text>
          <Icon name="chevronRight" color="accent" size={tokens.size.iconSm} />
        </View>
      </Card>
    </PressableScale>
  );
}
