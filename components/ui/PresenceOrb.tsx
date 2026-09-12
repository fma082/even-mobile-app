import { useEffect, useId } from 'react';
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
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { tokens } from '@/theme/tokens';

// Orb geometry in a 100×100 viewBox (shape, not design values): a soft halo, and a core lit
// slightly from the upper left so it reads as a sphere rather than a flat disc.
const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;
const CORE_R = 28;
const CORE_LIGHT = { cx: 42, cy: 38, r: 34, fx: 38, fy: 32 };
const HALO_INNER_STOP = 0.45;

const [gradStart, gradEnd] = tokens.gradientStops;
const { breath } = tokens.motion;

/**
 * The co-pilot's presence. Its slow breathing is the ONE persistent motion in the app;
 * with reduced motion it simply rests at full size.
 */
export function PresenceOrb({ size = tokens.size.orb }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  const phase = useSharedValue(reduceMotion ? 1 : 0);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    if (reduceMotion) return;
    phase.set(
      withRepeat(
        withTiming(1, {
          duration: tokens.motion.duration.breath / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(phase);
  }, [reduceMotion, phase]);

  const breathing = useAnimatedStyle(() => ({
    opacity: interpolate(phase.get(), [0, 1], [breath.opacityFrom, breath.opacityTo]),
    transform: [{ scale: interpolate(phase.get(), [0, 1], [breath.scaleFrom, breath.scaleTo]) }],
  }));

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Even, your co-pilot"
      style={[{ width: size, height: size }, breathing]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
        <Defs>
          <RadialGradient
            id={`halo${id}`}
            cx={CENTER}
            cy={CENTER}
            r={CENTER}
            gradientUnits="userSpaceOnUse">
            <Stop offset={HALO_INNER_STOP} stopColor={gradStart} stopOpacity={tokens.opacity.orbHalo} />
            <Stop offset={1} stopColor={gradEnd} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`core${id}`} {...CORE_LIGHT} gradientUnits="userSpaceOnUse">
            <Stop offset={0} stopColor={gradStart} stopOpacity={tokens.opacity.orbCore} />
            <Stop offset={1} stopColor={gradEnd} stopOpacity={tokens.opacity.orbCore} />
          </RadialGradient>
        </Defs>
        <Circle cx={CENTER} cy={CENTER} r={CENTER} fill={`url(#halo${id})`} />
        <Circle cx={CENTER} cy={CENTER} r={CORE_R} fill={`url(#core${id})`} />
      </Svg>
    </Animated.View>
  );
}
