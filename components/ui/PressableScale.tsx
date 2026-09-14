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

const focusRing: ViewStyle = {
  outlineColor: tokens.colors.accent,
  outlineStyle: 'solid',
  outlineWidth: tokens.size.focusRing,
  outlineOffset: tokens.size.focusRing,
};

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  /** Everything visible: background, border, radius, padding. Lands on a stock Pressable. */
  style?: StyleProp<ViewStyle>;
  /**
   * Layout for the animated wrapper — `flex: 1`, `alignSelf` and the like. Only needed when the
   * pressable has to claim space inside its parent's layout, as the tab bar items do.
   */
  containerStyle?: StyleProp<ViewStyle>;
  className?: string;
  /** Haptic fired on press-in; `false` for none. */
  haptic?: HapticKind | false;
  pressedScale?: number;
};

/**
 * Base of every tappable surface: spring scale-down + haptic on press, visible focus ring for
 * keyboard / switch access. Reduced motion keeps the haptic and drops the scale.
 *
 * SPLIT ON PURPOSE. The press transform lives on an Animated.View that carries nothing else,
 * and every visible style lands on a STOCK Pressable. NativeWind registers Pressable itself but
 * nothing from Reanimated, and styling an Animated.createAnimatedComponent(Pressable) did not
 * survive on Android — verified on a Moto g75 in both Expo Go and a development build. Keeping
 * the two concerns on separate nodes means the visible node is always a component both React
 * Native and NativeWind fully understand.
 */
export function PressableScale({
  haptic = 'press',
  pressedScale = tokens.motion.pressScale,
  style,
  containerStyle,
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
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
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
        style={[style, focused && focusRing]}
      />
    </Animated.View>
  );
}
