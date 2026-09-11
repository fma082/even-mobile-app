import { Placeholder } from '@/components/Placeholder';

export default function SettingsScreen() {
  return (
    <Placeholder
      title="Ajustes"
      note="Dev: rutas stub"
      links={[
        { label: 'Onboarding', href: '/welcome' },
        { label: 'Paywall', href: '/paywall' },
      ]}
    />
  );
}
