import { Placeholder } from '@/components/Placeholder';

export default function HandoffScreen() {
  return (
    <Placeholder
      title="Handoff"
      note="Onboarding · 5/5"
      links={[{ label: 'Go to Home', href: '/', replace: true }]}
    />
  );
}
