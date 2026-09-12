import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens, withAlpha } from '@/theme/tokens';

import { Icon, type IconName, type IconTone } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type Tone } from './Text';

const activeTone: IconTone = 'active';
const idleTone: IconTone = 'muted';
const activeLabel: Tone = 'accent';
const idleLabel: Tone = 'muted';

// Content dissolves into the bar instead of being cut off by it.
const fade = [withAlpha(tokens.colors.canvas, 0), tokens.colors.canvas] as const;

/** `tabBarIcon` factory so screens only name the icon; focus colour lives here. */
export const tabIcon =
  (name: IconName) =>
  ({ focused }: { focused: boolean }) => <Icon name={name} tone={focused ? activeTone : idleTone} />;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      className="border-t border-subtle bg-canvas"
      style={{ paddingBottom: insets.bottom }}>
      <LinearGradient
        colors={fade}
        pointerEvents="none"
        style={[styles.fade, { top: -tokens.size.tabBarFade, height: tokens.size.tabBarFade }]}
      />
      <View className="flex-row" style={{ height: tokens.size.tabBarHeight }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <PressableScale
              key={route.key}
              haptic="select"
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              className="flex-1 items-center justify-center gap-4">
              {options.tabBarIcon?.({
                focused,
                color: focused ? tokens.colors.iconActive : tokens.colors.iconMuted,
                size: tokens.size.icon,
              })}
              <Text variant="micro" tone={focused ? activeLabel : idleLabel}>
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0 },
});
