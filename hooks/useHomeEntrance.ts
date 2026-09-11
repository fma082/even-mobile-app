import { useEffect, useState } from 'react';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { tokens } from '@/theme/tokens';

const { entrance, spring, duration } = tokens.motion;

/**
 * Home entrance, choreographed as ONE sequence rather than a per-item fade:
 * the presence swells in (spring) → the greeting rises once it has "spoken" →
 * the decision card surfaces (spring, see useSurfaceEntrance).
 * With reduced motion everything is simply present.
 */
export function useHomeEntrance() {
  const reduceMotion = useReducedMotion();
  const [startedAt] = useState(() => Date.now());
  const presence = useSharedValue(reduceMotion ? 1 : 0);
  const greeting = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    presence.set(withSpring(1, spring.presence));
    greeting.set(
      withDelay(
        entrance.greetingDelay,
        withTiming(1, { duration: duration.slow, easing: Easing.out(Easing.cubic) }),
      ),
    );
  }, [reduceMotion, presence, greeting]);

  const presenceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(presence.get(), [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(presence.get(), [0, 1], [entrance.presenceFromScale, 1]) }],
  }));

  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greeting.get(),
    transform: [{ translateY: interpolate(greeting.get(), [0, 1], [entrance.greetingRise, 0]) }],
  }));

  /** Delay left until the card's beat — a card that mounts late (data) still lands in sequence. */
  const cardDelay = () => Math.max(0, entrance.cardDelay - (Date.now() - startedAt));

  return { presenceStyle, greetingStyle, cardDelay, reduceMotion };
}

/** A surface rising into place on a spring after `delay` ms. */
export function useSurfaceEntrance(delay: number, reduceMotion: boolean) {
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withDelay(delay, withSpring(1, spring.surface)));
  }, [delay, reduceMotion, progress]);

  return useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.5], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [entrance.cardRise, 0]) },
      { scale: interpolate(progress.get(), [0, 1], [entrance.cardFromScale, 1]) },
    ],
  }));
}
