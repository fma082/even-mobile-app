import { Placeholder } from '@/components/Placeholder';

export default function SettingsScreen() {
  return (
    <Placeholder
      title="Settings"
      note="Dev: stub routes"
      links={[
        { label: 'Onboarding', href: '/welcome' },
        { label: 'Paywall', href: '/paywall' },
      ]}
    />
  );
}
