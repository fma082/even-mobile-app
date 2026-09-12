import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/Placeholder';

export default function ContentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Placeholder title="Content" note={slug} />;
}
