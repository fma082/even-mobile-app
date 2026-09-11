import { Placeholder } from '@/components/Placeholder';

export default function LearnScreen() {
  return (
    <Placeholder
      title="Aprender"
      links={[{ label: 'Abrir contenido', href: { pathname: '/content/[slug]', params: { slug: 'primeros-pasos' } } }]}
    />
  );
}
