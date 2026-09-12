import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/Placeholder';

export default function DecisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Placeholder
      title="Decision"
      note={id}
      links={[
        { label: 'Adjust', href: { pathname: '/decision/adjust', params: { id } } },
        { label: 'Approve', href: { pathname: '/decision/confirm', params: { id } } },
      ]}
    />
  );
}
