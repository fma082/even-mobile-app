import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionCard } from '@/components/decision/DecisionCard';
import { GradientText } from '@/components/ui/GradientText';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PresenceOrb } from '@/components/ui/PresenceOrb';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useHomeEntrance, useSurfaceEntrance } from '@/hooks/useHomeEntrance';
import { useAppStore } from '@/store/app';
import { tokens } from '@/theme/tokens';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const decisions = useAppStore((s) => s.pendingDecisions);
  const loadPendingDecisions = useAppStore((s) => s.loadPendingDecisions);
  const { presenceStyle, greetingStyle, cardDelay, reduceMotion } = useHomeEntrance();

  useEffect(() => {
    loadPendingDecisions();
  }, [loadPendingDecisions]);

  const [featured, ...queued] = decisions;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <Header />

      <ScrollView contentContainerClassName="items-center px-5 pb-12 pt-6">
        <Animated.View style={presenceStyle}>
          <PresenceOrb />
        </Animated.View>

        <Animated.View style={greetingStyle}>
          <View className="mb-8 mt-4 items-center gap-1">
            <Text variant="display" accessibilityRole="header">
              Hola, Facu
            </Text>
            <Text variant="body" tone="ink2">
              {featured ? 'Tengo una decisión para mostrarte.' : 'Todo en orden por ahora.'}
            </Text>
          </View>
        </Animated.View>

        {featured ? (
          <Surfacing getDelay={cardDelay} reduceMotion={reduceMotion}>
            <DecisionCard
              decision={featured}
              onPress={() =>
                router.push({ pathname: '/decision/[id]', params: { id: featured.id } })
              }
            />
            <QuietRow queued={queued.length} />
          </Surfacing>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="flex-row items-center justify-between px-5 py-2">
      <IconButton
        icon="expand"
        accessibilityLabel="Expandir copiloto"
        // TODO: open the full-screen co-pilot conversation.
        onPress={() => {}}
      />
      <GradientText width={tokens.size.wordmarkWidth} height={tokens.size.wordmarkHeight}>
        Even
      </GradientText>
      <IconButton
        icon="menu"
        variant="plain"
        accessibilityLabel="Menú"
        onPress={() => router.push('/settings')}
      />
    </View>
  );
}

/** Mounts with the card's beat in the Home entrance sequence. */
function Surfacing({
  getDelay,
  reduceMotion,
  children,
}: {
  getDelay: () => number;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const [delay] = useState(getDelay);
  const style = useSurfaceEntrance(delay, reduceMotion);
  // Animated wrappers carry motion only; layout classes live on the inner View.
  return (
    <Animated.View style={[styles.stretch, style]}>
      <View className="gap-4">{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ stretch: { alignSelf: 'stretch' } });

function QuietRow({ queued }: { queued: number }) {
  const status =
    queued === 0
      ? 'Nada más en espera'
      : `${queued} ${queued === 1 ? 'decisión más' : 'decisiones más'} en espera`;

  return (
    <PressableScale
      onPress={() => router.push('/cashflow')}
      haptic="select"
      accessibilityRole="button"
      accessibilityLabel={`${status}. Ver cashflow`}
      className="flex-row items-center justify-between rounded-lg bg-surfaceSunken px-4 py-3">
      <Text variant="small" tone="ink2">
        {status}
      </Text>
      <View className="flex-row items-center gap-1">
        <Text variant="small" tone="ink3">
          Cashflow
        </Text>
        <Icon name="chevronRight" color="ink3" size={tokens.size.iconSm} />
      </View>
    </PressableScale>
  );
}
