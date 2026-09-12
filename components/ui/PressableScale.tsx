import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptics, type HapticKind } from '@/lib/haptics';
import { tokens } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * NativeWind only resolves `className` on components it knows about.
 *
 * cssInterop RETURNS the wrapped component — it does not mutate its argument — so the return
 * value is what must be rendered. Dropping it silently breaks native only: on web `className`
 * reaches the DOM and CSS applies it regardless, so the failure does not show up in a browser.
 */
const StyledPressable = cssInterop(AnimatedPressable, { className: 'style' });

const focusRing: ViewStyle = {
  outlineColor: tokens.colors.accent,
  outlineStyle: 'solid',
  outlineWidth: tokens.size.focusRing,
  outlineOffset: tokens.size.focusRing,
};

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Haptic fired on press-in; `false` for none. */
  haptic?: HapticKind | false;
  pressedScale?: number;
};

/**
 * Base of every tappable surface: spring scale-down + haptic on press, visible focus ring for
 * keyboard / switch access. Reduced motion keeps the haptic and drops the scale.
 */
export function PressableScale({
  haptic = 'press',
  pressedScale = tokens.motion.pressScale,
  style,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const [focused, setFocused] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <StyledPressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) scale.set(withSpring(pressedScale, tokens.motion.spring.press));
        if (haptic) haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, tokens.motion.spring.press));
        onPressOut?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[animatedStyle, focused && focusRing, style]}
    />
  );
}
