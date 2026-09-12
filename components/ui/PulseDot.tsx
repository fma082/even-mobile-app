import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { tokens, type ColorToken } from '@/theme/tokens';

const { pulse } = tokens.motion;

/**
 * A live-signal dot: a still core with a soft ring radiating out, and still under reduced motion.
 *
 * Uses Reanimated directly rather than Moti — Moti's tslib interop breaks Expo Router's static
 * web render, and every other animation in the app is already Reanimated.
 */
export function PulseDot({ color = 'accent' }: { color?: ColorToken }) {
  const reduceMotion = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    phase.set(
      withRepeat(
        withTiming(1, { duration: tokens.motion.duration.pulse, easing: Easing.out(Easing.ease) }),
        -1,
        // No reverse: the ring radiates outward and restarts, it does not breathe back in.
        false,
      ),
    );
    return () => cancelAnimation(phase);
  }, [reduceMotion, phase]);

  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(phase.get(), [0, 1], [pulse.opacityFrom, 0]),
    transform: [{ scale: interpolate(phase.get(), [0, 1], [1, pulse.scaleTo]) }],
  }));

  const dot = {
    width: tokens.size.dot,
    height: tokens.size.dot,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors[color],
  };

  return (
    <View style={{ width: dot.width, height: dot.height }}>
      {reduceMotion ? null : <Animated.View style={[StyleSheet.absoluteFill, dot, ring]} />}
      <View style={dot} />
    </View>
  );
}
