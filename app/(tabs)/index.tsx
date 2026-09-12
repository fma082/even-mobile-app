import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionCard } from '@/components/decision/DecisionCard';
import { GradientText } from '@/components/ui/GradientText';
import { IconButton } from '@/components/ui/IconButton';
import { PresenceOrb } from '@/components/ui/PresenceOrb';
import { SecondaryRow } from '@/components/ui/SecondaryRow';
import { Text } from '@/components/ui/Text';
import { useHomeEntrance, useSurfaceEntrance } from '@/hooks/useHomeEntrance';
import { useAppStore } from '@/store/app';
import { tokens } from '@/theme/tokens';

/** Full-bleed backdrop: barely-there warm white falling to the canvas grey. */
const backdrop = [tokens.colors.surface, tokens.colors.canvas] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const decisions = useAppStore((s) => s.pendingDecisions);
  const loadPendingDecisions = useAppStore((s) => s.loadPendingDecisions);
  const { presenceStyle, greetingStyle, cardDelay, reduceMotion } = useHomeEntrance();

  useEffect(() => {
    loadPendingDecisions();
  }, [loadPendingDecisions]);

  const [featured] = decisions;

  return (
    <LinearGradient colors={backdrop} style={styles.fill}>
      <View style={{ paddingTop: insets.top }}>
        <Header />
      </View>

      <ScrollView contentContainerClassName="items-center px-20 pb-48 pt-24">
        <Animated.View style={presenceStyle}>
          <PresenceOrb />
        </Animated.View>

        <Animated.View style={greetingStyle}>
          <View className="mb-32 mt-16 items-center gap-4">
            <Text variant="displayLg" accessibilityRole="header">
              Good morning, Facu
            </Text>
            <Text variant="body" tone="secondary">
              {featured ? 'I have a decision for you.' : 'Nothing needs you right now.'}
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
            <SecondaryRow
              title="Your savings goal"
              subtitle="can wait"
              onPress={() => router.push('/cashflow')}
            />
          </Surfacing>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

function Header() {
  return (
    <View className="flex-row items-center justify-between px-20 py-8">
      <IconButton
        icon="expand"
        accessibilityLabel="Expand co-pilot"
        // TODO: open the full-screen co-pilot conversation.
        onPress={() => {}}
      />
      <GradientText>Even</GradientText>
      <IconButton
        icon="menu"
        variant="plain"
        accessibilityLabel="Menu"
        onPress={() => router.push('/settings')}
      />
    </View>
  );
}

/** Mounts on the card's beat in the Home entrance sequence. */
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
      <View className="gap-16">{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
});
