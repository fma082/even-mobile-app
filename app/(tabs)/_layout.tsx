import { Tabs } from 'expo-router';

import { TabBar, tabIcon } from '@/components/ui/TabBar';
import { tokens } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: tokens.colors.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="cashflow" options={{ title: 'Cashflow', tabBarIcon: tabIcon('cashflow') }} />
      <Tabs.Screen name="learn" options={{ title: 'Aprender', tabBarIcon: tabIcon('learn') }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
