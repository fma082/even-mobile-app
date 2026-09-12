import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { discoverBrandFonts } from '@/lib/fonts';
import { useAppStore } from '@/store/app';
import { tokens } from '@/theme/tokens';

export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync().catch(() => {});

const brandFonts = discoverBrandFonts();

export default function RootLayout() {
  const [loaded, error] = useFonts(brandFonts.sources);
  const setLoadedFonts = useAppStore((s) => s.setLoadedFonts);
  const ready = loaded || error !== null;

  useEffect(() => {
    if (!ready) return;
    if (error) console.warn('[fonts] Brand fonts failed to load — using the system font.', error);
    else setLoadedFonts(Object.keys(brandFonts.sources));
    if (brandFonts.missing.length > 0) {
      console.info(
        `[fonts] Missing ${brandFonts.missing.join(', ')} — falling back to the system font. ` +
          'Drop the files into assets/fonts/ and restart with `npx expo start -c`.',
      );
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [ready, error, setLoadedFonts]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: tokens.colors.canvas },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="decision/[id]" />
          <Stack.Screen name="decision/adjust" options={{ presentation: 'modal' }} />
          <Stack.Screen name="decision/confirm" />
          <Stack.Screen name="content/[slug]" />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
