import { router, type Href } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

export type PlaceholderLink = { label: string; href: Href; replace?: boolean };

/** Stub screen: a centered label + optional links so every route can be walked. */
export function Placeholder({
  title,
  note,
  links = [],
}: {
  title: string;
  note?: string;
  links?: PlaceholderLink[];
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center gap-4 bg-bg px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {note ? (
        <Text variant="small" tone="ink3">
          {note}
        </Text>
      ) : null}
      <View className="mt-4 gap-2">
        {links.map((link) => (
          <Button
            key={link.label}
            label={link.label}
            variant="secondary"
            onPress={() => (link.replace ? router.replace(link.href) : router.push(link.href))}
          />
        ))}
        {router.canGoBack() ? <Button label="Volver" variant="ghost" onPress={router.back} /> : null}
      </View>
    </View>
  );
}
