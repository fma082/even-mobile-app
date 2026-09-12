import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { gradientDirection, tokens, type TypeVariant } from '@/theme/tokens';

import { Text } from './Text';

const { start, end } = gradientDirection();

export type GradientTextProps = {
  children: string;
  variant?: TypeVariant;
};

/**
 * Text filled with the brand gradient (the "Even" wordmark).
 *
 * The string is rendered twice on purpose: once as the mask that cuts the gradient to the
 * glyph shapes, and once invisibly inside the gradient so the gradient inherits the text's
 * intrinsic size. That keeps the wordmark correct at any type scale without hard-coded
 * width/height, which would clip as soon as the font or size token changed.
 */
export function GradientText({ children, variant = 'displaySm' }: GradientTextProps) {
  const label = (
    <Text variant={variant} style={styles.mask}>
      {children}
    </Text>
  );

  return (
    <MaskedView accessible accessibilityRole="header" accessibilityLabel={children} maskElement={label}>
      <LinearGradient colors={tokens.gradientStops} start={start} end={end}>
        <Text variant={variant} style={styles.sizer} accessibilityElementsHidden importantForAccessibility="no">
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: { backgroundColor: 'transparent' },
  sizer: { opacity: 0 },
});
