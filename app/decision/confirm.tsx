import { Placeholder } from '@/components/Placeholder';

export default function ConfirmDecisionScreen() {
  return (
    <Placeholder
      title="Done"
      note="Confirmation + undo"
      links={[{ label: 'Back to Home', href: '/', replace: true }]}
    />
  );
}
