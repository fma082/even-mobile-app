import { useLocalSearchParams } from 'expo-router';

import { Placeholder } from '@/components/Placeholder';

export default function DecisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Placeholder
      title="Decisión"
      note={id}
      links={[
        { label: 'Ajustar', href: { pathname: '/decision/adjust', params: { id } } },
        { label: 'Aprobar', href: { pathname: '/decision/confirm', params: { id } } },
      ]}
    />
  );
}
