import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { tokens, type ColorToken } from '@/theme/tokens';

/** A live-signal dot: a still core with a soft ring radiating out. Still under reduced motion. */
export function PulseDot({ color = 'accent' }: { color?: ColorToken }) {
  const reduceMotion = useReducedMotion();
  const dot = {
    width: tokens.size.dot,
    height: tokens.size.dot,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors[color],
  };

  return (
    <View style={{ width: dot.width, height: dot.height }}>
      {reduceMotion ? null : (
        <MotiView
          from={{ opacity: tokens.motion.pulse.opacityFrom, scale: 1 }}
          animate={{ opacity: 0, scale: tokens.motion.pulse.scaleTo }}
          transition={{
            type: 'timing',
            duration: tokens.motion.duration.pulse,
            loop: true,
            repeatReverse: false,
          }}
          style={[StyleSheet.absoluteFill, dot]}
        />
      )}
      <View style={dot} />
    </View>
  );
}
