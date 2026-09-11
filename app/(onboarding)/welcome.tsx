import { Placeholder } from '@/components/Placeholder';

export default function WelcomeScreen() {
  return (
    <Placeholder title="Welcome" note="Onboarding · 1/5" links={[{ label: 'Siguiente', href: '/connect' }]} />
  );
}
