import { Placeholder } from '@/components/Placeholder';

export default function ConfirmDecisionScreen() {
  return (
    <Placeholder
      title="Listo"
      note="Confirmation + undo"
      links={[{ label: 'Volver a Home', href: '/', replace: true }]}
    />
  );
}
